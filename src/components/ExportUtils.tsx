import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import ExcelJS, { type CellValue } from "exceljs";
import { saveAs } from "file-saver";
import type { ReactNode } from 'react';

// Interface for Web Worker message (conceptual) - Commented out as unused
// interface PDFWorkerMessage {
//   action: "generatePdf";
//   htmlContentId: string;
//   filename: string;
// }

interface ToastOptions {
  title?: ReactNode;
  description?: ReactNode;
  variant?: "default" | "destructive" | "success";
}

// Keep this as a fallback or for simple, non-worker based generation if needed.
async function generatePdfOnMainThread(elementId: string, filename: string): Promise<void> {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element with id "${elementId}" not found.`);
    alert(`Error: Could not find content to export for ID: ${elementId}`);
    return;
  }
  try {
    document.body.classList.add('print-mode');
    element.classList.add('exporting-content');
    const canvas = await html2canvas(element, {
      scale: 2, useCORS: true, logging: false,
      windowWidth: element.scrollWidth, windowHeight: element.scrollHeight,
    });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
    const imgX = (pdfWidth - imgWidth * ratio) / 2;
    pdf.addImage(imgData, 'PNG', imgX, 0, imgWidth * ratio, imgHeight * ratio);
    pdf.save(filename);
  } catch (error) {
    console.error("Error generating PDF on main thread:", error);
    alert("An error occurred while generating the PDF. Please try again.");
  } finally {
    document.body.classList.remove('print-mode');
    element.classList.remove('exporting-content');
  }
}

export async function exportToPDFWithWorker(elementId: string, filename: string, showToast?: (options: ToastOptions) => void): Promise<void> {
  const element = document.getElementById(elementId) as HTMLElement | null;
  if (!element) {
    console.error(`Element with id "${elementId}" not found.`);
    if (showToast) showToast({ title: "Export Error", description: `Content for ID '${elementId}' not found.`, variant: "destructive" });
    else alert(`Error: Could not find content to export for ID: ${elementId}`);
    return;
  }

  // Get the HTML string of the element
  // For more complex scenarios, consider a more robust way to serialize styles or use a headless browser approach server-side.
  const htmlString = element.outerHTML;

  if (typeof Worker !== 'undefined') {
    const pdfWorker = new Worker(new URL('../workers/pdf.worker.ts', import.meta.url), { type: 'module' });
    
    if(showToast) showToast({ title: "PDF Export Started", description: "Your PDF is being generated in the background.", variant: "default"});
    else alert("PDF generation started in background...");

    pdfWorker.postMessage({ action: 'generatePdf', htmlString, filename });

    pdfWorker.onmessage = (event: MessageEvent<{ success: boolean; filename: string; pdfBlob?: Blob; error?: string }>) => {
      const { success, filename: returnedFilename, pdfBlob, error } = event.data;
      if (success && pdfBlob) {
        saveAs(pdfBlob, returnedFilename);
        if(showToast) showToast({ title: "PDF Export Complete", description: `${returnedFilename} has been downloaded.`, variant: "success"});
        else alert("PDF downloaded!");
      } else {
        console.error("PDF worker failed:", error);
        if(showToast) showToast({ title: "PDF Export Failed", description: error || "An unknown error occurred in the PDF worker.", variant: "destructive"});
        else alert(`PDF generation failed: ${error}`);
      }
      pdfWorker.terminate(); // Clean up worker
    };

    pdfWorker.onerror = (error: ErrorEvent) => {
      console.error("PDF worker error:", error);
      if(showToast) showToast({ title: "PDF Worker Error", description: error.message || "An unexpected error occurred with the PDF generator.", variant: "destructive"});
      else alert("PDF worker error. Check console.");
      pdfWorker.terminate();
    };
  } else {
    // Fallback if Web Workers are not supported (or for simplicity in some environments)
    console.warn("Web Workers not supported. Generating PDF on main thread.");
    if(showToast) showToast({ title: "PDF Export Started", description: "Generating PDF on main thread (may cause lag).", variant: "default"});
    else alert("Web Workers not supported. PDF will generate on main thread.");
    await generatePdfOnMainThread(elementId, filename); // Use the old main thread version
  }
}

// Define a more specific type for Excel row data
type ExcelRowData = Record<string, CellValue | undefined>;

export const exportToExcel = async (data: ExcelRowData[], filename: string = "data.xlsx"): Promise<boolean> => {
  try {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Sheet1");

    // Add headers
    if (data.length > 0) {
      const headers = Object.keys(data[0]);
      worksheet.addRow(headers);

      // Add data rows
      data.forEach((row: ExcelRowData) => {
        // Convert all values to what ExcelJS expects (string, number, boolean, Date, null)
        const excelRow: CellValue[] = headers.map(header => {
          const value = row[header];
          if (value instanceof Date) return value;
          if (typeof value === 'boolean') return value;
          if (typeof value === 'number') return value;
          if (typeof value === 'string') return value;
          if (value === null || value === undefined) return null;
          return String(value);
        });
        worksheet.addRow(excelRow);
      });
    }

    // Style headers (optional)
    worksheet.getRow(1).font = { bold: true };
    worksheet.columns.forEach(column => {
      if (column && typeof column.eachCell === 'function') {
        // Estimate column width based on header and some sample data
        let maxLength = 0;
        column.eachCell({ includeEmpty: true }, (cell, _rowNumber) => {
          const cellValue = cell.value;
          const columnLength = cellValue ? String(cellValue).length : 10;
          if (columnLength > maxLength) {
            maxLength = columnLength;
          }
        });
        column.width = maxLength < 10 ? 10 : maxLength > 50 ? 50 : maxLength + 2;
      } else if (column) {
        column.width = 20; // Default width if eachCell is not available but column is
      }
    });

    // Write to buffer and trigger download
    const buffer = await workbook.xlsx.writeBuffer();
    // Write to file and trigger download
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);

    return true;
  } catch (error) {
    console.error("Error exporting to Excel:", error);
    return false;
  }
};

/**
 * Prepares data for Excel export by formatting and structuring it
 * @param data Raw data to be prepared for Excel export
 * @returns Formatted data ready for Excel export
 */
export const prepareExcelData = (data: Record<string, unknown>[]): Record<string, CellValue | "">[] => {
  // If data is already in the right format, return it as is
  if (!data || data.length === 0) return [];

  // Ensure all objects have the same keys for consistent columns
  const allKeys = new Set<string>();
  data.forEach((item: Record<string, unknown>) => {
    Object.keys(item).forEach((key) => allKeys.add(key));
  });

  // Create a standardized array with all possible keys
  return data.map((item: Record<string, unknown>) => {
    const standardizedItem: Record<string, CellValue | ""> = {};
    Array.from(allKeys).forEach((key) => {
      const value = item[key];
      if (value instanceof Date || typeof value === 'boolean' || typeof value === 'number' || typeof value === 'string' || value === null || value === undefined) {
        standardizedItem[key] = value as CellValue;
      } else {
        standardizedItem[key] = String(value);
      }
    });
    return standardizedItem;
  });
};

export const exportToMultipleSheets = (
  data: Record<string, ExcelRowData[]>,
  filename: string = "esg-plan.xlsx",
) => {
  try {
    // Create a new workbook
    const workbook = new ExcelJS.Workbook();

    // Add each dataset as a separate sheet
    Object.entries(data).forEach(([sheetName, sheetData]) => {
      if (sheetData && sheetData.length > 0) {
        const worksheet = workbook.addWorksheet(sheetName);

        // Add headers
        const headers = Object.keys(sheetData[0]);
        worksheet.addRow(headers);

        // Add data rows
        sheetData.forEach((row: ExcelRowData) => {
          // Convert all values to what ExcelJS expects
          const excelRow: CellValue[] = headers.map(header => {
            const value = row[header];
            if (value instanceof Date) return value;
            if (typeof value === 'boolean') return value;
            if (typeof value === 'number') return value;
            if (typeof value === 'string') return value;
            if (value === null || value === undefined) return null;
            return String(value);
          });
          worksheet.addRow(excelRow);
        });
      }
    });

    // Write to file and trigger download
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);

    return true;
  } catch (error) {
    console.error("Error exporting to Excel with multiple sheets:", error);
    return false;
  }
};
