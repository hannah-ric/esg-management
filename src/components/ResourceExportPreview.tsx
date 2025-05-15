import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Eye, FileText, FileSpreadsheet, Download } from "lucide-react";
import ResourceExporter from "./ResourceExporter";
import { logger } from "@/lib/logger";

interface ResourceExportPreviewProps {
  resource?: {
    id: string;
    title: string;
    description: string;
    type: string;
    category: string;
    fileType: string;
    url: string;
    rawContent?: string;
    esgData?: any;
  };
  resources?: Array<{
    id: string;
    title: string;
    description?: string;
    type: string;
    category: string;
    fileType?: string;
    url?: string;
    rawContent?: string;
    esgData?: any;
  }>;
  exportFormat?: "excel" | "pdf";
  className?: string;
}

const ResourceExportPreview: React.FC<ResourceExportPreviewProps> = ({
  resource,
  resources,
  exportFormat = "excel",
  className = "",
}) => {
  const [activeTab, setActiveTab] = useState<"preview" | "export">("preview");

  // Group resources by category if multiple resources are provided
  const resourcesByCategory = resources
    ? resources.reduce<Record<string, any[]>>((acc, res) => {
        const category = res.category || "Uncategorized";
        if (!acc[category]) {
          acc[category] = [];
        }
        acc[category].push(res);
        return acc;
      }, {})
    : {};

  // Format the content for preview for a single resource
  const renderSingleResourcePreview = () => {
    if (!resource) return null;

    return (
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold">{resource.title}</h2>
          <p className="text-muted-foreground">{resource.description}</p>
        </div>

        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="font-medium">Category:</span> {resource.category}
          </div>
          <div>
            <span className="font-medium">Type:</span> {resource.type}
          </div>
          <div className="col-span-2">
            <span className="font-medium">Source:</span>{" "}
            <a
              href={resource.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              {resource.url}
            </a>
          </div>
        </div>

        {resource.esgData?.dataPoints && (
          <div className="mt-6">
            <h3 className="text-lg font-medium mb-2">ESG Data Points</h3>
            <div className="border rounded-md overflow-hidden">
              <table className="w-full">
                <thead className="bg-muted">
                  <tr>
                    <th className="p-2 text-left">Metric</th>
                    <th className="p-2 text-left">Value</th>
                    <th className="p-2 text-left">Framework</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(resource.esgData.dataPoints).map(
                    ([metricId, dataPoint]: [string, any], index) => (
                      <tr
                        key={index}
                        className={index % 2 === 0 ? "bg-white" : "bg-muted/30"}
                      >
                        <td className="p-2 border-t">
                          {metricId
                            .replace(/-/g, " ")
                            .replace(/\b\w/g, (l) => l.toUpperCase())}
                        </td>
                        <td className="p-2 border-t">{dataPoint.value}</td>
                        <td className="p-2 border-t">
                          {dataPoint.frameworkId} {dataPoint.disclosureId}
                        </td>
                      </tr>
                    ),
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {resource.esgData?.mappings && (
          <div className="mt-6">
            <h3 className="text-lg font-medium mb-2">Framework References</h3>
            <div className="border rounded-md overflow-hidden">
              <table className="w-full">
                <thead className="bg-muted">
                  <tr>
                    <th className="p-2 text-left">Framework</th>
                    <th className="p-2 text-left">Disclosures</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(resource.esgData.mappings).map(
                    ([frameworkId, disclosures]: [string, any], index) => (
                      <tr
                        key={index}
                        className={index % 2 === 0 ? "bg-white" : "bg-muted/30"}
                      >
                        <td className="p-2 border-t">{frameworkId}</td>
                        <td className="p-2 border-t">
                          {Array.isArray(disclosures)
                            ? disclosures.join(", ")
                            : disclosures}
                        </td>
                      </tr>
                    ),
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {resource.rawContent && (
          <div className="mt-6">
            <h3 className="text-lg font-medium mb-2">Content Extract</h3>
            <div className="bg-muted/20 p-4 rounded-md text-sm max-h-60 overflow-y-auto">
              {resource.rawContent.substring(0, 1000)}
              {resource.rawContent.length > 1000 && "..."}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Format the content for preview for multiple resources
  const renderMultiResourcePreview = () => {
    if (!resources || resources.length === 0) {
      return (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            No resources selected for export
          </p>
        </div>
      );
    }

    return (
      <div>
        <div className="mb-4">
          <h2 className="text-xl font-semibold">Bulk Export Preview</h2>
          <p className="text-muted-foreground">
            {resources.length} resources selected for export as{" "}
            {exportFormat.toUpperCase()}
          </p>
        </div>

        {exportFormat === "excel" ? (
          <div className="border rounded-md overflow-hidden">
            <div className="bg-green-50 p-3 border-b">
              <h3 className="font-medium">Excel Export Preview</h3>
              <p className="text-sm text-gray-500">
                Your export will contain{" "}
                {Object.keys(resourcesByCategory).length} sheets
              </p>
            </div>
            <div className="max-h-80 overflow-y-auto">
              {Object.entries(resourcesByCategory).map(
                ([category, categoryResources]) => (
                  <div key={category} className="border-b last:border-b-0">
                    <div className="bg-gray-50 p-2 font-medium text-sm border-b">
                      Sheet:{" "}
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </div>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Title
                            </th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Type
                            </th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              URL
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {categoryResources.slice(0, 3).map((res) => (
                            <tr key={res.id}>
                              <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                                {res.title}
                              </td>
                              <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                                {res.type}
                              </td>
                              <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                                {res.url
                                  ? res.url.substring(0, 30) +
                                    (res.url.length > 30 ? "..." : "")
                                  : "N/A"}
                              </td>
                            </tr>
                          ))}
                          {categoryResources.length > 3 && (
                            <tr>
                              <td
                                colSpan={3}
                                className="px-3 py-2 text-sm text-gray-500 text-center"
                              >
                                + {categoryResources.length - 3} more resources
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ),
              )}
            </div>
          </div>
        ) : (
          <div className="border rounded-md overflow-hidden">
            <div className="bg-red-50 p-3 border-b">
              <h3 className="font-medium">PDF Export Preview</h3>
              <p className="text-sm text-gray-500">
                Your export will contain {resources.length} resources in{" "}
                {Object.keys(resourcesByCategory).length} categories
              </p>
            </div>
            <div className="max-h-80 overflow-y-auto p-4 bg-white">
              <h1 className="text-xl font-bold mb-4">ESG Resources Export</h1>

              {Object.entries(resourcesByCategory)
                .slice(0, 2)
                .map(([category, categoryResources]) => (
                  <div key={category} className="mb-6">
                    <h2 className="text-lg font-semibold mb-2 pb-1 border-b">
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </h2>

                    {categoryResources.slice(0, 2).map((res) => (
                      <div key={res.id} className="mb-4 p-3 border rounded-md">
                        <h3 className="font-medium">{res.title}</h3>
                        {res.description && (
                          <p className="text-sm">{res.description}</p>
                        )}
                        <p className="text-sm mt-1">
                          <strong>Type:</strong> {res.type}
                        </p>
                        {res.url && (
                          <p className="text-sm">
                            <strong>URL:</strong> {res.url}
                          </p>
                        )}
                      </div>
                    ))}

                    {categoryResources.length > 2 && (
                      <p className="text-sm text-gray-500 italic">
                        + {categoryResources.length - 2} more resources in this
                        category
                      </p>
                    )}
                  </div>
                ))}

              {Object.keys(resourcesByCategory).length > 2 && (
                <p className="text-sm text-gray-500 italic mt-4">
                  + {Object.keys(resourcesByCategory).length - 2} more
                  categories
                </p>
              )}
            </div>
          </div>
        )}

        <div className="mt-4 flex justify-end">
          <Button className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export as {exportFormat.toUpperCase()}
          </Button>
        </div>
      </div>
    );
  };

  return (
    <Card className={`w-full ${className}`}>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Resource Export Preview</span>
          {resource && (
            <Tabs
              value={activeTab}
              onValueChange={(value) =>
                setActiveTab(value as "preview" | "export")
              }
            >
              <TabsList>
                <TabsTrigger value="preview">
                  <Eye className="h-4 w-4 mr-1" /> Preview
                </TabsTrigger>
                <TabsTrigger value="export">
                  <FileText className="h-4 w-4 mr-1" /> Export
                </TabsTrigger>
              </TabsList>
            </Tabs>
          )}
          {!resource && resources && (
            <div className="flex items-center gap-2">
              {exportFormat === "excel" ? (
                <FileSpreadsheet className="h-5 w-5 text-green-600" />
              ) : (
                <FileText className="h-5 w-5 text-red-600" />
              )}
              <span>{exportFormat.toUpperCase()}</span>
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {resource ? (
          <>
            <TabsContent value="preview" className="mt-0">
              {renderSingleResourcePreview()}
            </TabsContent>
            <TabsContent value="export" className="mt-0">
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Export this resource as a PDF or Excel file to share with
                  stakeholders or include in your ESG reporting.
                </p>
                <ResourceExporter
                  resource={resource}
                  onExportComplete={(type, success) => {
                    if (success) {
                      logger.info(`${type} export completed successfully`);
                    }
                  }}
                />
              </div>
            </TabsContent>
          </>
        ) : (
          renderMultiResourcePreview()
        )}
      </CardContent>
    </Card>
  );
};

export default ResourceExportPreview;
