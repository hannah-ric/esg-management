import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import ExcelJS from "exceljs";

export const exportToPDF = async (
  elementId: string,
  filename: string = "document.pdf",
) => {
  try {
    const element = document.getElementById(elementId);
    if (!element) {
      console.error(`Element with ID ${elementId} not found`);
      return false;
    }

    const canvas = await html2canvas(element);
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "px",
      format: [canvas.width, canvas.height],
    });

    pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
    pdf.save(filename);

    return true;
  } catch (error) {
    console.error("Error exporting to PDF:", error);
    return false;
  }
};

export const exportToExcel = (data: any[], filename: string = "data.xlsx") => {
  try {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Sheet1");

    // Add headers
    if (data.length > 0) {
      const headers = Object.keys(data[0]);
      worksheet.addRow(headers);

      // Add data rows
      data.forEach((row) => {
        worksheet.addRow(Object.values(row));
      });
    }

    // Write to file and trigger download
    workbook.xlsx.writeBuffer().then((buffer) => {
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      window.URL.revokeObjectURL(url);
    });

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
export const prepareExcelData = (data: any[]): any[] => {
  // If data is already in the right format, return it as is
  if (!data || data.length === 0) return [];

  // Ensure all objects have the same keys for consistent columns
  const allKeys = new Set<string>();
  data.forEach((item) => {
    Object.keys(item).forEach((key) => allKeys.add(key));
  });

  // Create a standardized array with all possible keys
  return data.map((item) => {
    const standardizedItem: Record<string, any> = {};
    Array.from(allKeys).forEach((key) => {
      standardizedItem[key] = item[key] !== undefined ? item[key] : "";
    });
    return standardizedItem;
  });
};

export const exportToMultipleSheets = (
  data: Record<string, any[]>,
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
        sheetData.forEach((row: any) => {
          worksheet.addRow(Object.values(row));
        });
      }
    });

    // Write to file and trigger download
    workbook.xlsx.writeBuffer().then((buffer) => {
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      window.URL.revokeObjectURL(url);
    });

    return true;
  } catch (error) {
    console.error("Error exporting to Excel with multiple sheets:", error);
    return false;
  }
};
