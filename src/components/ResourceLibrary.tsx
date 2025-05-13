import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Search,
  FileText,
  BookOpen,
  FileSpreadsheet,
  Download,
  ExternalLink,
  Filter,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface ResourceItem {
  id: string;
  title: string;
  description: string;
  type: "guide" | "template" | "framework" | "case-study";
  category: "environmental" | "social" | "governance" | "general";
  framework?: string;
  fileType: "pdf" | "xlsx" | "docx" | "url";
  url: string;
  dateAdded: string;
}

// Helper functions moved outside of component to be accessible by ResourceCard
const getFileTypeIcon = (fileType: string) => {
  switch (fileType) {
    case "pdf":
      return <FileText className="h-4 w-4" />;
    case "xlsx":
      return <FileSpreadsheet className="h-4 w-4" />;
    case "docx":
      return <FileText className="h-4 w-4" />;
    case "url":
      return <ExternalLink className="h-4 w-4" />;
    default:
      return <FileText className="h-4 w-4" />;
  }
};

const getCategoryColor = (category: string) => {
  switch (category) {
    case "environmental":
      return "bg-green-100 text-green-800";
    case "social":
      return "bg-blue-100 text-blue-800";
    case "governance":
      return "bg-purple-100 text-purple-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getTypeLabel = (type: string) => {
  switch (type) {
    case "guide":
      return "Guide";
    case "template":
      return "Template";
    case "framework":
      return "Framework";
    case "case-study":
      return "Case Study";
    default:
      return type;
  }
};

const ResourceLibrary: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  // Sample resource data
  const resources: ResourceItem[] = [
    {
      id: "1",
      title: "GRI Standards Implementation Guide",
      description:
        "Comprehensive guide to implementing the Global Reporting Initiative (GRI) Standards in your ESG reporting.",
      type: "guide",
      category: "general",
      framework: "GRI",
      fileType: "pdf",
      url: "#",
      dateAdded: "2023-06-15",
    },
    {
      id: "2",
      title: "Carbon Emissions Calculation Template",
      description:
        "Excel template for calculating and tracking Scope 1, 2, and 3 greenhouse gas emissions.",
      type: "template",
      category: "environmental",
      framework: "GHG Protocol",
      fileType: "xlsx",
      url: "#",
      dateAdded: "2023-07-22",
    },
    {
      id: "3",
      title: "SASB Industry Standards - Manufacturing",
      description:
        "Sustainability Accounting Standards Board (SASB) disclosure topics and metrics for the manufacturing sector.",
      type: "framework",
      category: "general",
      framework: "SASB",
      fileType: "pdf",
      url: "#",
      dateAdded: "2023-05-10",
    },
    {
      id: "4",
      title: "Diversity & Inclusion Policy Template",
      description:
        "Customizable template for creating a comprehensive diversity and inclusion policy for your organization.",
      type: "template",
      category: "social",
      fileType: "docx",
      url: "#",
      dateAdded: "2023-08-05",
    },
    {
      id: "5",
      title: "ESG Data Collection Methodology",
      description:
        "Best practices for establishing robust ESG data collection processes and systems.",
      type: "guide",
      category: "general",
      fileType: "pdf",
      url: "#",
      dateAdded: "2023-09-12",
    },
    {
      id: "6",
      title: "TCFD Climate Risk Assessment Framework",
      description:
        "Task Force on Climate-related Financial Disclosures (TCFD) framework for assessing and reporting climate-related risks.",
      type: "framework",
      category: "environmental",
      framework: "TCFD",
      fileType: "pdf",
      url: "#",
      dateAdded: "2023-04-18",
    },
    {
      id: "7",
      title: "Board ESG Oversight Guide",
      description:
        "Guide for establishing effective board oversight of ESG matters and integrating sustainability into governance.",
      type: "guide",
      category: "governance",
      fileType: "pdf",
      url: "#",
      dateAdded: "2023-07-30",
    },
    {
      id: "8",
      title: "Sustainable Supply Chain Case Study",
      description:
        "Case study on implementing sustainable practices throughout the supply chain in a manufacturing company.",
      type: "case-study",
      category: "environmental",
      fileType: "pdf",
      url: "#",
      dateAdded: "2023-08-22",
    },
  ];

  // Filter resources based on search query and filters
  const filteredResources = resources.filter((resource) => {
    const matchesSearch =
      searchQuery === "" ||
      resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      categoryFilter === "all" || resource.category === categoryFilter;

    const matchesType = typeFilter === "all" || resource.type === typeFilter;

    return matchesSearch && matchesCategory && matchesType;
  });

  return (
    <div className="w-full bg-background p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Resource Library
            </h1>
            <p className="text-muted-foreground mt-1">
              Access guides, templates, frameworks, and best practices for ESG
              management
            </p>
          </div>
        </div>

        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-grow">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search resources..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="environmental">Environmental</SelectItem>
                  <SelectItem value="social">Social</SelectItem>
                  <SelectItem value="governance">Governance</SelectItem>
                  <SelectItem value="general">General</SelectItem>
                </SelectContent>
              </Select>

              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Resource Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="guide">Guides</SelectItem>
                  <SelectItem value="template">Templates</SelectItem>
                  <SelectItem value="framework">Frameworks</SelectItem>
                  <SelectItem value="case-study">Case Studies</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="all">All Resources</TabsTrigger>
            <TabsTrigger value="guides">Guides</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="frameworks">Frameworks</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {filteredResources.length > 0 ? (
              filteredResources.map((resource) => (
                <ResourceCard key={resource.id} resource={resource} />
              ))
            ) : (
              <div className="text-center py-12">
                <BookOpen className="h-12 w-12 mx-auto text-muted-foreground" />
                <h3 className="mt-4 text-lg font-medium">No resources found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your search or filters
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="guides" className="space-y-4">
            {filteredResources
              .filter((r) => r.type === "guide")
              .map((resource) => (
                <ResourceCard key={resource.id} resource={resource} />
              ))}
          </TabsContent>

          <TabsContent value="templates" className="space-y-4">
            {filteredResources
              .filter((r) => r.type === "template")
              .map((resource) => (
                <ResourceCard key={resource.id} resource={resource} />
              ))}
          </TabsContent>

          <TabsContent value="frameworks" className="space-y-4">
            {filteredResources
              .filter((r) => r.type === "framework")
              .map((resource) => (
                <ResourceCard key={resource.id} resource={resource} />
              ))}
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
};

interface ResourceCardProps {
  resource: ResourceItem;
}

const ResourceCard: React.FC<ResourceCardProps> = ({ resource }) => {
  return (
    <Card className="overflow-hidden transition-all hover:border-primary/50">
      <div className="flex flex-col md:flex-row">
        <div className="flex-grow p-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge
                  variant="secondary"
                  className={getCategoryColor(resource.category)}
                >
                  {resource.category.charAt(0).toUpperCase() +
                    resource.category.slice(1)}
                </Badge>
                <Badge variant="outline">{getTypeLabel(resource.type)}</Badge>
                {resource.framework && (
                  <Badge variant="outline">{resource.framework}</Badge>
                )}
              </div>
              <h3 className="text-lg font-semibold">{resource.title}</h3>
            </div>
            <div className="flex items-center">
              <span className="text-xs text-muted-foreground">
                {resource.dateAdded}
              </span>
            </div>
          </div>
          <p className="mt-2 text-muted-foreground">{resource.description}</p>
          <div className="mt-4 flex items-center gap-2">
            <Button variant="outline" size="sm">
              Preview
            </Button>
            <Button size="sm">
              <Download className="mr-2 h-4 w-4" />
              Download {resource.fileType.toUpperCase()}
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ResourceLibrary;
