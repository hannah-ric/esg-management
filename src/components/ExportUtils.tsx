import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import * as XLSX from "xlsx";

export const exportToPDF = async (
  elementId: string,
  filename: string = "esg-plan.pdf",
) => {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element with ID ${elementId} not found`);
    return;
  }

  try {
    // Create a canvas from the element
    const canvas = await html2canvas(element, {
      scale: 2, // Higher scale for better quality
      useCORS: true, // Allow loading of images from other domains
      logging: false,
    });

    // Calculate dimensions to maintain aspect ratio
    const imgWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;

    const pdf = new jsPDF("p", "mm", "a4");
    let pageData = canvas.toDataURL("image/png", 1.0);

    pdf.addImage(pageData, "PNG", 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    // Add new pages if content overflows
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(pageData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save(filename);
    return true;
  } catch (error) {
    console.error("Error exporting to PDF:", error);
    return false;
  }
};

export const exportToExcel = (
  data: any,
  filename: string = "esg-plan.xlsx",
  sheetName: string = "ESG Plan",
) => {
  try {
    // Create a new workbook
    const wb = XLSX.utils.book_new();

    // Convert data to worksheet format
    const ws = XLSX.utils.json_to_sheet(data);

    // Add the worksheet to the workbook
    XLSX.utils.book_append_sheet(wb, ws, sheetName);

    // Write the workbook and trigger a download
    XLSX.writeFile(wb, filename);
    return true;
  } catch (error) {
    console.error("Error exporting to Excel:", error);
    return false;
  }
};

export const prepareExcelData = (
  questionnaireData: any,
  materialityTopics: any[],
  frameworks: any[],
  implementationPhases: any[],
  resourceRequirements: any[],
) => {
  // Company Profile Sheet
  const companyProfile = [
    {
      "Company Name": questionnaireData.companyName || "",
      Industry: questionnaireData.industry || "",
      Size: questionnaireData.size || "",
      Region: questionnaireData.region || "",
      "Current ESG Reporting": questionnaireData.currentReporting || "",
    },
  ];

  // Material Topics Sheet
  const materialTopics = materialityTopics.map((topic) => ({
    "Topic Name": topic.name,
    Category: topic.category,
    "Stakeholder Impact": topic.stakeholderImpact,
    "Business Impact": topic.businessImpact,
    Description: topic.description,
  }));

  // Framework Recommendations Sheet
  const frameworkRecommendations = frameworks.map((framework) => ({
    Framework: framework.name,
    Coverage: `${framework.coverage}%`,
  }));

  // Implementation Roadmap Sheet
  const implementationRoadmap = implementationPhases.map((phase) => ({
    Phase: phase.name,
    Duration: phase.duration,
    Status: phase.status,
  }));

  // Resource Requirements Sheet
  const resources = resourceRequirements.map((resource) => ({
    Type: resource.type,
    Description: resource.description,
    Estimate: resource.estimate,
  }));

  return {
    companyProfile,
    materialTopics,
    frameworkRecommendations,
    implementationRoadmap,
    resources,
  };
};

export const exportToMultipleSheets = (
  data: Record<string, any[]>,
  filename: string = "esg-plan.xlsx",
) => {
  try {
    // Create a new workbook
    const wb = XLSX.utils.book_new();

    // Add each dataset as a separate sheet
    Object.entries(data).forEach(([sheetName, sheetData]) => {
      if (sheetData && sheetData.length > 0) {
        const ws = XLSX.utils.json_to_sheet(sheetData);
        XLSX.utils.book_append_sheet(wb, ws, sheetName);
      }
    });

    // Write the workbook and trigger a download
    XLSX.writeFile(wb, filename);
    return true;
  } catch (error) {
    console.error("Error exporting to Excel with multiple sheets:", error);
    return false;
  }
};
