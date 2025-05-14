import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Eye, FileText, FileSpreadsheet } from "lucide-react";
import ResourceExporter from "./ResourceExporter";
import { logger } from "@/lib/logger";

interface ResourceExportPreviewProps {
  resource: {
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
}

const ResourceExportPreview: React.FC<ResourceExportPreviewProps> = ({
  resource,
}) => {
  const [activeTab, setActiveTab] = useState<"preview" | "export">("preview");

  // Format the content for preview
  const renderPreview = () => {
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

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Resource Export</span>
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
        </CardTitle>
      </CardHeader>
      <CardContent>
        <TabsContent value="preview" className="mt-0">
          {renderPreview()}
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
      </CardContent>
    </Card>
  );
};

export default ResourceExportPreview;
