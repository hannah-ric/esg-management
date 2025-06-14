import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  exportToPDFWithWorker,
  // exportToExcel, // Unused
  exportToMultipleSheets,
} from "./ExportUtils";
import { FileText, FileSpreadsheet, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { CellValue } from "exceljs";
import type { AnalyzedContentDataPoint, AnalyzedContentFrameworkMapping, AnalyzedContentESGData } from "@/lib/plan-enhancement";

export interface ResourceExporterResourcePropsLocal {
    id: string;
    title: string;
    description: string;
    type: string;
    category: string;
    fileType: string;
    url: string;
    rawContent?: string;
    esgData?: AnalyzedContentESGData; 
}

interface ResourceExporterProps {
  resource: ResourceExporterResourcePropsLocal;
  onExportComplete?: (type: "pdf" | "excel", success: boolean) => void;
}

type ExcelSheetData = Record<string, CellValue | undefined>;

const ResourceExporter: React.FC<ResourceExporterProps> = ({
  resource,
  onExportComplete,
}) => {
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [isExportingExcel, setIsExportingExcel] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [exportSuccess, setExportSuccess] = useState<string | null>(null);

  const handleExportToPDF = async () => {
    setIsExportingPDF(true);
    setExportError(null);

    try {
      // Create a temporary div to render the content for PDF export
      const tempDiv = document.createElement("div");
      tempDiv.id = "temp-pdf-export";
      tempDiv.style.position = "absolute";
      tempDiv.style.left = "-9999px";
      tempDiv.style.padding = "20px";
      tempDiv.style.width = "800px";
      tempDiv.style.backgroundColor = "white";
      tempDiv.style.color = "black";

      // Format the content for PDF
      tempDiv.innerHTML = `
        <div style="font-family: Arial, sans-serif;">
          <h1 style="color: #333; margin-bottom: 10px;">${resource.title}</h1>
          <p style="color: #666; margin-bottom: 20px;">${resource.description}</p>
          
          <div style="margin-bottom: 20px;">
            <strong>Category:</strong> ${resource.category}<br>
            <strong>Type:</strong> ${resource.type}<br>
            <strong>Source:</strong> <a href="${resource.url}">${resource.url}</a>
          </div>
          
          ${
            resource.esgData?.dataPoints
              ? `
            <h2 style="color: #333; margin-top: 30px;">ESG Data Points</h2>
            <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
              <thead>
                <tr style="background-color: #f3f4f6;">
                  <th style="padding: 8px; text-align: left; border: 1px solid #ddd;">Metric</th>
                  <th style="padding: 8px; text-align: left; border: 1px solid #ddd;">Value</th>
                  <th style="padding: 8px; text-align: left; border: 1px solid #ddd;">Framework</th>
                </tr>
              </thead>
              <tbody>
                ${Object.entries(resource.esgData?.dataPoints || {}).map(
                    ([metricId, dataPoint]: [string, AnalyzedContentDataPoint]) => `
                  <tr>
                    <td style="padding: 8px; border: 1px solid #ddd;">${metricId.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}</td>
                    <td style="padding: 8px; border: 1px solid #ddd;">${String(dataPoint.value)}</td>
                    <td style="padding: 8px; border: 1px solid #ddd;">${dataPoint.framework_id || ""} ${dataPoint.disclosure_id || ""}</td>
                  </tr>
                `,
                  ).join("")}
              </tbody>
            </table>
          `
              : ""
          }
          
          ${
            resource.esgData?.mappings
              ? `
            <h2 style="color: #333; margin-top: 30px;">Framework References</h2>
            <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
              <thead>
                <tr style="background-color: #f3f4f6;">
                  <th style="padding: 8px; text-align: left; border: 1px solid #ddd;">Framework</th>
                  <th style="padding: 8px; text-align: left; border: 1px solid #ddd;">Disclosures</th>
                </tr>
              </thead>
              <tbody>
                ${Object.entries(resource.esgData?.mappings || {}).map(
                  ([frameworkId, disclosures]: [string, AnalyzedContentFrameworkMapping[]]) => `
                  <tr>
                    <td style="padding: 8px; border: 1px solid #ddd;">${frameworkId}</td>
                    <td style="padding: 8px; border: 1px solid #ddd;">${Array.isArray(disclosures) ? disclosures.map(d => d.disclosure_id).join(", ") : (disclosures as unknown as AnalyzedContentFrameworkMapping)?.disclosure_id || 'N/A'}</td>
                  </tr>
                `,
                ).join("")}
              </tbody>
            </table>
          `
              : ""
          }
          
          ${
            resource.rawContent
              ? `
            <h2 style="color: #333; margin-top: 30px;">Content Extract</h2>
            <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin-top: 10px; font-size: 14px;">
              ${resource.rawContent.substring(0, 2000)}${resource.rawContent.length > 2000 ? "..." : ""}
            </div>
          `
              : ""
          }
        </div>
      `;

      document.body.appendChild(tempDiv);

      // Export to PDF with improved quality and margins
      await exportToPDFWithWorker(
        "temp-pdf-export",
        `${resource.title.replace(/[^a-zA-Z0-9]/g, "_")}.pdf`
      );

      // Remove the temporary div
      document.body.removeChild(tempDiv);

      // Show success message
      setExportSuccess("PDF exported successfully!");

      // Clear success message after 3 seconds
      setTimeout(() => {
        setExportSuccess(null);
      }, 3000);

      // For the purpose of onExportComplete, we assume success if no error was thrown by exportToPDFWithWorker.
      // A more robust solution would involve exportToPDFWithWorker returning a promise that resolves to success/failure.
      if (onExportComplete) {
        onExportComplete("pdf", true); // Assuming success
      }
    } catch (error) {
      console.error("Error exporting to PDF:", error);
      setExportError("Failed to export to PDF. Please try again.");
      if (onExportComplete) {
        onExportComplete("pdf", false);
      }
    } finally {
      setIsExportingPDF(false);
    }
  };

  const handleExportToExcel = async () => {
    setIsExportingExcel(true);
    setExportError(null);

    try {
      // Prepare data for Excel export
      const excelData: Record<string, ExcelSheetData[]> = {};

      // Resource information
      excelData.resourceInfo = [
        {
          Title: resource.title,
          Description: resource.description,
          Category: resource.category,
          Type: resource.type,
          URL: resource.url,
        },
      ];

      // ESG data points
      if (resource.esgData?.dataPoints) {
        excelData.dataPoints = Object.entries(resource.esgData.dataPoints).map(
          ([metricId, dataPoint]: [string, AnalyzedContentDataPoint]) => ({
            Metric: metricId
              .replace(/-/g, " ")
              .replace(/\b\w/g, (l) => l.toUpperCase()),
            Value: String(dataPoint.value),
            Framework: `${dataPoint.framework_id || ""} ${dataPoint.disclosure_id || ""}`,
            Confidence: dataPoint.confidence || "N/A",
            Context: dataPoint.context || "N/A",
          }),
        );
      }

      // Framework mappings
      if (resource.esgData?.mappings) {
        excelData.frameworks = Object.entries(
          resource.esgData.mappings,
        ).flatMap(([frameworkId, disclosures]: [string, AnalyzedContentFrameworkMapping[]]) =>
          Array.isArray(disclosures)
            ? disclosures.map((disclosure: AnalyzedContentFrameworkMapping) => ({
                Framework: frameworkId,
                Disclosure: disclosure.disclosure_id,
              }))
            : [
                {
                  Framework: frameworkId,
                  Disclosure: (disclosures as unknown as AnalyzedContentFrameworkMapping)?.disclosure_id || 'N/A',
                },
              ],
        );
      }

      // Content extract (limited to avoid Excel size issues)
      if (resource.rawContent) {
        excelData.content = [
          {
            Content:
              resource.rawContent.substring(0, 10000) +
              (resource.rawContent.length > 10000 ? "..." : ""),
          },
        ];
      }

      // Export to multiple sheets in Excel
      const success = exportToMultipleSheets(
        excelData,
        `${resource.title.replace(/[^a-zA-Z0-9]/g, "_")}.xlsx`,
      );

      if (onExportComplete) {
        onExportComplete("excel", success);
      }

      // Show success message
      setExportSuccess("Excel file exported successfully!");

      // Clear success message after 3 seconds
      setTimeout(() => {
        setExportSuccess(null);
      }, 3000);
    } catch (error) {
      console.error("Error exporting to Excel:", error);
      setExportError("Failed to export to Excel. Please try again.");
      if (onExportComplete) {
        onExportComplete("excel", false);
      }
    } finally {
      setIsExportingExcel(false);
    }
  };

  return (
    <div className="flex flex-col space-y-2">
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleExportToPDF}
          disabled={isExportingPDF}
        >
          {isExportingPDF ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Exporting PDF...
            </>
          ) : (
            <>
              <FileText className="mr-2 h-4 w-4" />
              Export as PDF
            </>
          )}
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={handleExportToExcel}
          disabled={isExportingExcel}
        >
          {isExportingExcel ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Exporting Excel...
            </>
          ) : (
            <>
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              Export as Excel
            </>
          )}
        </Button>
      </div>

      {exportError && (
        <Alert variant="destructive" className="mt-2">
          <AlertDescription>{exportError}</AlertDescription>
        </Alert>
      )}

      {exportSuccess && (
        <Alert variant="default" className="mt-2">
          <AlertDescription>{exportSuccess}</AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default ResourceExporter;
