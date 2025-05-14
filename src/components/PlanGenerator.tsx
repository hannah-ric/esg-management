import React, { useState, useEffect, useRef } from "react";
import { useAppContext } from "./AppContext";
import { supabase } from "@/lib/supabase";
import { logger } from "@/lib/logger";
import { motion } from "framer-motion";
import {
  Download,
  FileText,
  CheckCircle,
  Clock,
  Users,
  DollarSign,
  ChevronDown,
  ChevronUp,
  Printer,
  FileSpreadsheet,
  FileDown,
  Sparkles,
  PlusCircle,
  Trash2,
  BarChart3,
  Loader2,
} from "lucide-react";
import {
  exportToPDF,
  exportToExcel,
  prepareExcelData,
  exportToMultipleSheets,
} from "./ExportUtils";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Progress } from "./ui/progress";
import { Separator } from "./ui/separator";
import { Badge } from "./ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import PlanGeneratorEnhanced from "./PlanGeneratorEnhanced";
import { getFrameworkRecommendations } from "@/lib/ai-services";

interface PlanGeneratorProps {
  questionnaireData?: any;
  onDownload?: (format: string) => void;
  onCustomize?: () => void;
}

const PlanGenerator: React.FC<PlanGeneratorProps> = ({
  questionnaireData: propQuestionnaireData = {
    companyName: "Acme Corporation",
    industry: "Manufacturing",
    size: "Medium Enterprise",
    region: "North America",
    currentReporting: "Basic",
    materialTopics: [
      "Climate Change",
      "Energy Efficiency",
      "Waste Management",
      "Employee Health & Safety",
      "Diversity & Inclusion",
    ],
  },
  onDownload = () => {},
  onCustomize = () => {},
}) => {
  const {
    questionnaireData: contextData,
    materialityTopics,
    user,
  } = useAppContext();
  const [questionnaireData, setQuestionnaireData] = useState(
    propQuestionnaireData,
  );

  useEffect(() => {
    // If we have data in context, use it
    if (Object.keys(contextData).length > 0) {
      const processedData = {
        companyName:
          contextData["company-profile"]?.companyName || "Your Company",
        industry: contextData["industry-selection"]?.industry || "General",
        size:
          contextData["company-profile"]?.employeeCount || "Small Enterprise",
        region:
          contextData["regulatory-requirements"]?.primaryRegion || "Global",
        currentReporting:
          contextData["regulatory-requirements"]?.currentReporting?.join(
            ", ",
          ) || "None",
        materialTopics: materialityTopics.map((topic) => topic.name) || [
          "Climate Change",
          "Energy Efficiency",
          "Waste Management",
          "Employee Health & Safety",
          "Diversity & Inclusion",
        ],
      };
      setQuestionnaireData(processedData);
    }
  }, [contextData, materialityTopics]);
  const [activeTab, setActiveTab] = useState("summary");
  const [expandedSections, setExpandedSections] = useState<string[]>([
    "executive-summary",
  ]);
  const [selectedFormat, setSelectedFormat] = useState("pdf");
  const [customMetrics, setCustomMetrics] = useState<
    Array<{
      id?: string;
      name: string;
      target: string;
      current: string;
      unit: string;
    }>
  >([]);
  const [newMetric, setNewMetric] = useState({
    name: "",
    target: "",
    current: "",
    unit: "",
  });
  const [showMetricForm, setShowMetricForm] = useState(false);

  const frameworks = [
    { name: "GRI", coverage: 85, color: "bg-green-500" },
    { name: "SASB", coverage: 72, color: "bg-blue-500" },
    { name: "TCFD", coverage: 64, color: "bg-amber-500" },
    { name: "UN SDGs", coverage: 58, color: "bg-purple-500" },
  ];

  const [implementationPhases, setImplementationPhases] = useState([
    {
      name: "Planning & Assessment",
      duration: "1-2 months",
      status: "Ready",
      progress: 0,
    },
    {
      name: "Data Collection Systems",
      duration: "2-3 months",
      status: "Not Started",
      progress: 0,
    },
    {
      name: "Policy Development",
      duration: "2-4 months",
      status: "Not Started",
      progress: 0,
    },
    {
      name: "Initial Reporting",
      duration: "1-2 months",
      status: "Not Started",
      progress: 0,
    },
    {
      name: "Stakeholder Engagement",
      duration: "3-6 months",
      status: "Not Started",
      progress: 0,
    },
    {
      name: "Continuous Improvement",
      duration: "Ongoing",
      status: "Not Started",
      progress: 0,
    },
  ]);

  // Add loading states
  const [isLoadingPhases, setIsLoadingPhases] = useState(false);
  const [isLoadingMetrics, setIsLoadingMetrics] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Enhance useEffect for loading phases
  useEffect(() => {
    const loadImplementationPhases = async () => {
      setIsLoadingPhases(true);
      try {
        if (user) {
          const { data, error } = await supabase
            .from("implementation_phases")
            .select("*")
            .eq("user_id", user.id)
            .single();

          if (error && error.code !== "PGRST116") throw error;
          if (data?.phases && data.phases.length > 0) {
            setImplementationPhases(data.phases);
          }
        }
      } catch (error) {
        logger.error("Error loading implementation phases", error);
      } finally {
        setIsLoadingPhases(false);
      }
    };

    loadImplementationPhases();
  }, [user]);

  // Enhance useEffect for loading metrics
  useEffect(() => {
    const loadCustomMetrics = async () => {
      setIsLoadingMetrics(true);
      try {
        if (user) {
          const { data, error } = await supabase
            .from("custom_metrics")
            .select("*")
            .eq("user_id", user.id);

          if (error) throw error;
          if (data && data.length > 0) {
            setCustomMetrics(data);
          }
        }
      } catch (error) {
        logger.error("Error loading custom metrics", error);
      } finally {
        setIsLoadingMetrics(false);
      }
    };

    loadCustomMetrics();
  }, [user]);

  const resourceRequirements = [
    {
      type: "Personnel",
      description: "ESG Program Manager",
      estimate: "1 FTE",
    },
    { type: "Personnel", description: "Data Analysts", estimate: "0.5-1 FTE" },
    {
      type: "Technology",
      description: "ESG Data Management System",
      estimate: "$15,000-30,000/year",
    },
    {
      type: "Financial",
      description: "External Assurance",
      estimate: "$20,000-40,000/year",
    },
    {
      type: "Financial",
      description: "Training & Capacity Building",
      estimate: "$5,000-15,000/year",
    },
  ];

  const toggleSection = (section: string) => {
    if (expandedSections.includes(section)) {
      setExpandedSections(expandedSections.filter((s) => s !== section));
    } else {
      setExpandedSections([...expandedSections, section]);
    }
  };

  const planRef = useRef<HTMLDivElement>(null);

  const handleDownload = async () => {
    setIsExporting(true);
    try {
      // Save the plan before downloading
      if (user) {
        // Get user's profile and save plan in one operation
        const { data, error } = await supabase
          .from("company_profiles")
          .select("id")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .then(async (profileResult) => {
            if (profileResult.error) throw profileResult.error;
            
            // Use the company profile ID if available, or null if not
            const companyProfileId = profileResult.data?.[0]?.id || null;
            
            // Insert the ESG plan
            return supabase.from("esg_plans").insert({
              user_id: user.id,
              company_profile_id: companyProfileId,
              title: `ESG Management Plan for ${questionnaireData.companyName}`,
              description: `Generated ESG management plan based on ${questionnaireData.industry} industry requirements`,
              frameworks: frameworks,
              implementation_phases: implementationPhases,
              resource_requirements: resourceRequirements,
              custom_metrics: customMetrics,
            });
          });

        if (error) throw error;
      }

      if (selectedFormat === "pdf") {
        await exportToPDF(
          "plan-content",
          `${questionnaireData.companyName.replace(/\s+/g, "-").toLowerCase()}-esg-plan.pdf`,
        );
      } else if (selectedFormat === "excel") {
        const excelData = prepareExcelData(
          questionnaireData,
          materialityTopics,
          frameworks,
          implementationPhases,
          resourceRequirements,
        );
        exportToMultipleSheets(
          excelData,
          `${questionnaireData.companyName.replace(/\s+/g, "-").toLowerCase()}-esg-plan.xlsx`,
        );
      } else if (selectedFormat === "ppt") {
        // Create a PowerPoint presentation
        alert(
          "PowerPoint export is coming soon. Please use PDF or Excel for now.",
        );
      } else {
        // Default fallback to the provided onDownload
        onDownload(selectedFormat);
      }
    } catch (error) {
      logger.error("Error during export", error);
      alert("There was an error exporting your plan. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div
      id="plan-content"
      className="w-full bg-background p-6 rounded-xl"
      ref={planRef}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-6"
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              ESG Management Plan
            </h1>
            <p className="text-muted-foreground mt-1">
              Generated for {questionnaireData.companyName} |{" "}
              {questionnaireData.industry}
            </p>
          </div>

          <div className="flex items-center space-x-2 mt-4 md:mt-0">
            <div className="flex items-center mr-4">
              <Select value={selectedFormat} onValueChange={setSelectedFormat}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF Document</SelectItem>
                  <SelectItem value="excel">Excel Workbook</SelectItem>
                  <SelectItem value="ppt">PowerPoint</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="mr-2">
                  <Sparkles className="mr-2 h-4 w-4" /> Enhance
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Enhance Your ESG Plan</DialogTitle>
                </DialogHeader>
                <PlanGeneratorEnhanced
                  companyName={questionnaireData.companyName}
                  industry={questionnaireData.industry}
                  materialityTopics={materialityTopics}
                  esgPlan={{
                    frameworks,
                    implementationPhases,
                    resourceRequirements,
                  }}
                  onEnhancementComplete={(data) => {
                    logger.info("Enhancement data received", data);

                    // Process AI recommendations
                    if (data.source === "ai" && data.data.frameworks) {
                      // Here we could update the frameworks based on AI recommendations
                      // This would require parsing the AI response and mapping it to our framework structure
                      logger.info("AI framework recommendations received", data.data.frameworks);
                    }

                    // Process URL analysis
                    if (data.source === "diffbot") {
                      // Process the analyzed content
                      logger.info("Analyzed content received", data.data);
                    }

                    // Process resource selections
                    if (data.source === "resource_library") {
                      // Add selected resources to the plan
                      logger.info("Selected resources received", data.data);
                    }
                  }}
                />
              </DialogContent>
            </Dialog>

            <Button variant="outline" onClick={onCustomize}>
              Customize
            </Button>

            <Button onClick={handleDownload} disabled={isExporting}>
              {isExporting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" /> Download
                </>
              )}
            </Button>
          </div>
        </div>

        <Tabs
          defaultValue="summary"
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="grid grid-cols-5 mb-8">
            <TabsTrigger value="summary">Executive Summary</TabsTrigger>
            <TabsTrigger value="frameworks">
              Framework Recommendations
            </TabsTrigger>
            <TabsTrigger value="implementation">
              Implementation Roadmap
            </TabsTrigger>
            <TabsTrigger value="resources">Resource Requirements</TabsTrigger>
            <TabsTrigger value="metrics">Custom Metrics</TabsTrigger>
          </TabsList>

          <TabsContent value="summary" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Executive Summary</CardTitle>
                <CardDescription>
                  Based on your questionnaire responses, we've generated a
                  customized ESG management plan for{" "}
                  {questionnaireData.companyName}.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">Company Profile</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Industry:</span>
                        <span className="font-medium">
                          {questionnaireData.industry}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Size:</span>
                        <span className="font-medium">
                          {questionnaireData.size}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Region:</span>
                        <span className="font-medium">
                          {questionnaireData.region}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Current ESG Reporting:
                        </span>
                        <span className="font-medium">
                          {questionnaireData.currentReporting}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Material Topics:
                        </span>
                        <span className="font-medium">
                          {questionnaireData.materialTopics.length}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Framework Coverage:
                        </span>
                        <span className="font-medium">4 Frameworks</span>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="text-lg font-medium mb-2">Material Topics</h3>
                  <div className="flex flex-wrap gap-2">
                    {questionnaireData.materialTopics.map(
                      (topic: string, index: number) => (
                        <Badge key={index} variant="secondary">
                          {topic}
                        </Badge>
                      ),
                    )}
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="text-lg font-medium mb-2">
                    Key Recommendations
                  </h3>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                      <span>
                        Establish formal ESG governance structure with board
                        oversight
                      </span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                      <span>
                        Implement data collection systems for key environmental
                        metrics
                      </span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                      <span>
                        Develop comprehensive climate risk assessment aligned
                        with TCFD
                      </span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                      <span>
                        Create formal diversity and inclusion policies with
                        measurable targets
                      </span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                      <span>
                        Establish supplier code of conduct with ESG requirements
                      </span>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="frameworks" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Framework Recommendations</CardTitle>
                <CardDescription>
                  Based on your industry and materiality assessment, we
                  recommend focusing on these frameworks and indicators.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  {frameworks.map((framework, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <h3 className="font-medium">{framework.name}</h3>
                        <span className="text-sm">
                          {framework.coverage}% coverage
                        </span>
                      </div>
                      <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                        <div
                          className={`h-full ${framework.color} rounded-full`}
                          style={{ width: `${framework.coverage}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>

                <Separator />

                <Accordion type="multiple" className="w-full">
                  <AccordionItem value="gri">
                    <AccordionTrigger>GRI Indicators</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2">
                        <div className="flex justify-between py-2 border-b">
                          <span className="font-medium">GRI 302: Energy</span>
                          <Badge>High Priority</Badge>
                        </div>
                        <div className="flex justify-between py-2 border-b">
                          <span className="font-medium">
                            GRI 305: Emissions
                          </span>
                          <Badge>High Priority</Badge>
                        </div>
                        <div className="flex justify-between py-2 border-b">
                          <span className="font-medium">GRI 306: Waste</span>
                          <Badge>Medium Priority</Badge>
                        </div>
                        <div className="flex justify-between py-2 border-b">
                          <span className="font-medium">
                            GRI 403: Occupational Health and Safety
                          </span>
                          <Badge>High Priority</Badge>
                        </div>
                        <div className="flex justify-between py-2">
                          <span className="font-medium">
                            GRI 405: Diversity and Equal Opportunity
                          </span>
                          <Badge>Medium Priority</Badge>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="sasb">
                    <AccordionTrigger>SASB Indicators</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2">
                        <div className="flex justify-between py-2 border-b">
                          <span className="font-medium">Energy Management</span>
                          <Badge>High Priority</Badge>
                        </div>
                        <div className="flex justify-between py-2 border-b">
                          <span className="font-medium">GHG Emissions</span>
                          <Badge>High Priority</Badge>
                        </div>
                        <div className="flex justify-between py-2 border-b">
                          <span className="font-medium">
                            Waste & Hazardous Materials Management
                          </span>
                          <Badge>Medium Priority</Badge>
                        </div>
                        <div className="flex justify-between py-2">
                          <span className="font-medium">
                            Employee Health & Safety
                          </span>
                          <Badge>High Priority</Badge>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="tcfd">
                    <AccordionTrigger>TCFD Recommendations</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2">
                        <div className="flex justify-between py-2 border-b">
                          <span className="font-medium">Governance</span>
                          <Badge>Medium Priority</Badge>
                        </div>
                        <div className="flex justify-between py-2 border-b">
                          <span className="font-medium">Strategy</span>
                          <Badge>High Priority</Badge>
                        </div>
                        <div className="flex justify-between py-2 border-b">
                          <span className="font-medium">Risk Management</span>
                          <Badge>High Priority</Badge>
                        </div>
                        <div className="flex justify-between py-2">
                          <span className="font-medium">
                            Metrics and Targets
                          </span>
                          <Badge>Medium Priority</Badge>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="sdgs">
                    <AccordionTrigger>UN SDGs</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2">
                        <div className="flex justify-between py-2 border-b">
                          <span className="font-medium">
                            SDG 7: Affordable and Clean Energy
                          </span>
                          <Badge>High Priority</Badge>
                        </div>
                        <div className="flex justify-between py-2 border-b">
                          <span className="font-medium">
                            SDG 8: Decent Work and Economic Growth
                          </span>
                          <Badge>Medium Priority</Badge>
                        </div>
                        <div className="flex justify-between py-2 border-b">
                          <span className="font-medium">
                            SDG 12: Responsible Consumption and Production
                          </span>
                          <Badge>High Priority</Badge>
                        </div>
                        <div className="flex justify-between py-2">
                          <span className="font-medium">
                            SDG 13: Climate Action
                          </span>
                          <Badge>High Priority</Badge>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="implementation" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Implementation Roadmap</CardTitle>
                <CardDescription>
                  A phased approach to implementing your ESG management plan
                  over the next 12-18 months.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingPhases ? (
                  <div className="flex justify-center items-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <span className="ml-2">Loading implementation phases...</span>
                  </div>
                ) : (
                  <div className="space-y-8">
                    {implementationPhases.map((phase, index) => (
                      <div key={index} className="relative">
                        {index < implementationPhases.length - 1 && (
                          <div className="absolute left-[19px] top-[40px] bottom-0 w-0.5 bg-border h-[calc(100%-16px)]"></div>
                        )}
                        <div className="flex items-start">
                          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary mr-4">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <div className="flex flex-col md:flex-row md:items-center justify-between mb-2">
                              <h3 className="text-lg font-medium">
                                {phase.name}
                              </h3>
                              <div className="flex items-center mt-1 md:mt-0">
                                <Clock className="h-4 w-4 text-muted-foreground mr-1" />
                                <span className="text-sm text-muted-foreground">
                                  {phase.duration}
                                </span>
                                <div className="flex items-center gap-2">
                                  <Badge
                                    variant="outline"
                                    className={`ml-2 ${
                                      phase.status === "Completed"
                                        ? "bg-green-100 text-green-800"
                                        : phase.status === "In Progress"
                                          ? "bg-blue-100 text-blue-800"
                                          : phase.status === "Delayed"
                                            ? "bg-amber-100 text-amber-800"
                                            : "bg-gray-100 text-gray-800"
                                    }`}
                                  >
                                    {phase.status}
                                  </Badge>
                                  <Select
                                    value={phase.status}
                                    onValueChange={(value) => {
                                      const updatedPhases = [
                                        ...implementationPhases,
                                      ];
                                      const phaseIndex = updatedPhases.findIndex(
                                        (p) => p.name === phase.name,
                                      );
                                      if (phaseIndex !== -1) {
                                        updatedPhases[phaseIndex].status = value;
                                        // Update progress based on status
                                        if (value === "Completed") {
                                          updatedPhases[phaseIndex].progress =
                                            100;
                                        } else if (value === "In Progress") {
                                          updatedPhases[phaseIndex].progress = 50;
                                        } else if (value === "Delayed") {
                                          updatedPhases[phaseIndex].progress = 25;
                                        } else {
                                          updatedPhases[phaseIndex].progress = 0;
                                        }
                                        setImplementationPhases(updatedPhases);
                                        if (user) {
                                          supabase
                                            .from("implementation_phases")
                                            .upsert({
                                              user_id: user.id,
                                              phases: updatedPhases
                                            }, { onConflict: "user_id" })
                                            .then((response) => {
                                              if (response.error) {
                                                logger.error("Failed to update implementation phases", response.error);
                                              }
                                            });
                                        }
                                      }
                                    }}
                                  >
                                    <SelectTrigger className="w-[130px] h-7 text-xs">
                                      <SelectValue placeholder="Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="Not Started">
                                        Not Started
                                      </SelectItem>
                                      <SelectItem value="In Progress">
                                        In Progress
                                      </SelectItem>
                                      <SelectItem value="Completed">
                                        Completed
                                      </SelectItem>
                                      <SelectItem value="Delayed">
                                        Delayed
                                      </SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                            </div>
                            <div className="bg-card border rounded-lg p-4 mt-2">
                              <div className="mb-2">
                                <div className="flex justify-between items-center mb-1">
                                  <span className="text-sm font-medium">
                                    Progress
                                  </span>
                                  <div className="flex items-center">
                                    <input
                                      type="range"
                                      min="0"
                                      max="100"
                                      step="5"
                                      value={phase.progress}
                                      onChange={(e) => {
                                        const newProgress = parseInt(
                                          e.target.value,
                                        );
                                        const updatedPhases = [
                                          ...implementationPhases,
                                        ];
                                        const phaseIndex =
                                          updatedPhases.findIndex(
                                            (p) => p.name === phase.name,
                                          );
                                        if (phaseIndex !== -1) {
                                          updatedPhases[phaseIndex].progress =
                                            newProgress;

                                          // Update status based on progress
                                          if (newProgress === 100) {
                                            updatedPhases[phaseIndex].status =
                                              "Completed";
                                          } else if (
                                            newProgress > 0 &&
                                            newProgress < 100
                                          ) {
                                            if (
                                              updatedPhases[phaseIndex].status !==
                                              "Delayed"
                                            ) {
                                              updatedPhases[phaseIndex].status =
                                                "In Progress";
                                            }
                                          } else {
                                            updatedPhases[phaseIndex].status =
                                              "Not Started";
                                          }

                                          setImplementationPhases(updatedPhases);
                                          if (user) {
                                            supabase
                                              .from("implementation_phases")
                                              .upsert({
                                                user_id: user.id,
                                                phases: updatedPhases
                                              }, { onConflict: "user_id" })
                                              .then((response) => {
                                                if (response.error) {
                                                  logger.error("Failed to update implementation phases", response.error);
                                                }
                                              });
                                          }
                                        }
                                      }}
                                      className="w-20 h-2 mr-2"
                                    />
                                    <span className="text-sm">
                                      {phase.progress}%
                                    </span>
                                  </div>
                                </div>
                                <Progress
                                  value={phase.progress}
                                  className="h-2"
                                  style={{
                                    backgroundColor:
                                      phase.status === "Delayed"
                                        ? "rgba(245, 158, 11, 0.2)"
                                        : undefined,
                                  }}
                                />
                              </div>
                              <h4 className="font-medium mb-2">
                                Key Activities:
                              </h4>
                              <ul className="space-y-1 text-sm">
                                {index === 0 && (
                                  <>
                                    <li>• Establish ESG steering committee</li>
                                    <li>• Conduct baseline assessment</li>
                                    <li>• Define key performance indicators</li>
                                    <li>• Set initial targets and objectives</li>
                                  </>
                                )}
                                {index === 1 && (
                                  <>
                                    <li>
                                      • Implement ESG data management system
                                    </li>
                                    <li>• Develop data collection protocols</li>
                                    <li>• Train relevant personnel</li>
                                    <li>• Establish data validation processes</li>
                                  </>
                                )}
                                {index === 2 && (
                                  <>
                                    <li>• Develop key ESG policies</li>
                                    <li>• Create governance structure</li>
                                    <li>• Establish reporting procedures</li>
                                    <li>
                                      • Integrate with existing management systems
                                    </li>
                                  </>
                                )}
                                {index === 3 && (
                                  <>
                                    <li>• Compile first ESG report</li>
                                    <li>• Conduct internal review</li>
                                    <li>• Consider external assurance needs</li>
                                    <li>• Publish report to stakeholders</li>
                                  </>
                                )}
                                {index === 4 && (
                                  <>
                                    <li>• Identify key stakeholder groups</li>
                                    <li>• Develop engagement strategy</li>
                                    <li>• Conduct materiality reassessment</li>
                                    <li>• Incorporate stakeholder feedback</li>
                                  </>
                                )}
                                {index === 5 && (
                                  <>
                                    <li>• Regular performance reviews</li>
                                    <li>• Update targets and objectives</li>
                                    <li>• Benchmark against industry peers</li>
                                    <li>• Expand scope of ESG program</li>
                                  </>
                                )}
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="resources" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Resource Requirements</CardTitle>
                <CardDescription>
                  Estimated resources needed to implement your ESG management
                  plan effectively.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-4">
                      Personnel Resources
                    </h3>
                    <div className="space-y-4">
                      {resourceRequirements
                        .filter((r) => r.type === "Personnel")
                        .map((resource, index) => (
                          <div key={index} className="flex items-start">
                            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-600 mr-4">
                              <Users className="h-5 w-5" />
                            </div>
                            <div className="flex-1">
                              <div className="flex flex-col md:flex-row md:items-center justify-between">
                                <h4 className="font-medium">
                                  {resource.description}
                                </h4>
                                <Badge
                                  variant="outline"
                                  className="mt-1 md:mt-0"
                                >
                                  {resource.estimate}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mt-1">
                                {resource.description === "ESG Program Manager"
                                  ? "Responsible for overall program coordination, reporting, and stakeholder engagement."
                                  : "Support data collection, analysis, and reporting processes."}
                              </p>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-lg font-medium mb-4">
                      Technology Resources
                    </h3>
                    <div className="space-y-4">
                      {resourceRequirements
                        .filter((r) => r.type === "Technology")
                        .map((resource, index) => (
                          <div key={index} className="flex items-start">
                            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-purple-100 text-purple-600 mr-4">
                              <FileText className="h-5 w-5" />
                            </div>
                            <div className="flex-1">
                              <div className="flex flex-col md:flex-row md:items-center justify-between">
                                <h4 className="font-medium">
                                  {resource.description}
                                </h4>
                                <Badge
                                  variant="outline"
                                  className="mt-1 md:mt-0"
                                >
                                  {resource.estimate}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mt-1">
                                Software solution for collecting, managing, and
                                reporting ESG data across the organization.
                              </p>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-lg font-medium mb-4">
                      Financial Resources
                    </h3>
                    <div className="space-y-4">
                      {resourceRequirements
                        .filter((r) => r.type === "Financial")
                        .map((resource, index) => (
                          <div key={index} className="flex items-start">
                            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-100 text-green-600 mr-4">
                              <DollarSign className="h-5 w-5" />
                            </div>
                            <div className="flex-1">
                              <div className="flex flex-col md:flex-row md:items-center justify-between">
                                <h4 className="font-medium">
                                  {resource.description}
                                </h4>
                                <Badge
                                  variant="outline"
                                  className="mt-1 md:mt-0"
                                >
                                  {resource.estimate}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mt-1">
                                {resource.description === "External Assurance"
                                  ? "Third-party verification of ESG data and reports to enhance credibility."
                                  : "Investment in employee training and capacity building for ESG management."}
                              </p>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="metrics" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Custom ESG Metrics</CardTitle>
                    <CardDescription>
                      Define and track custom metrics specific to your company's
                      ESG goals
                    </CardDescription>
                  </div>
                  {!isLoadingMetrics && (
                    <Button
                      onClick={() => setShowMetricForm(!showMetricForm)}
                      variant="outline"
                      className="flex items-center gap-1"
                    >
                      {showMetricForm ? (
                        "Cancel"
                      ) : (
                        <>
                          <PlusCircle className="h-4 w-4" />
                          Add Metric
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {isLoadingMetrics ? (
                  <div className="flex justify-center items-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <span className="ml-2">Loading custom metrics...</span>
                  </div>
                ) : (
                  <>
                    {showMetricForm && (
                      <div className="bg-muted/50 p-4 rounded-lg mb-6">
                        <h3 className="text-lg font-medium mb-4">Add New Metric</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <label className="text-sm font-medium mb-1 block">
                              Metric Name
                            </label>
                            <Input
                              placeholder="e.g., Water Usage"
                              value={newMetric.name}
                              onChange={(e) =>
                                setNewMetric({ ...newMetric, name: e.target.value })
                              }
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium mb-1 block">
                              Unit
                            </label>
                            <Input
                              placeholder="e.g., m³, kWh, tons"
                              value={newMetric.unit}
                              onChange={(e) =>
                                setNewMetric({ ...newMetric, unit: e.target.value })
                              }
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium mb-1 block">
                              Current Value
                            </label>
                            <Input
                              placeholder="e.g., 1500"
                              value={newMetric.current}
                              onChange={(e) =>
                                setNewMetric({
                                  ...newMetric,
                                  current: e.target.value,
                                })
                              }
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium mb-1 block">
                              Target Value
                            </label>
                            <Input
                              placeholder="e.g., 1200"
                              value={newMetric.target}
                              onChange={(e) =>
                                setNewMetric({
                                  ...newMetric,
                                  target: e.target.value,
                                })
                              }
                            />
                          </div>
                        </div>
                        <div className="flex justify-end">
                          <Button
                            onClick={async () => {
                              if (!newMetric.name || !newMetric.unit) return;

                              try {
                                if (user) {
                                  const { data: savedMetric } = await supabase
                                    .from("custom_metrics")
                                    .insert({
                                      user_id: user.id,
                                      name: newMetric.name,
                                      unit: newMetric.unit,
                                      current: newMetric.current,
                                      target: newMetric.target,
                                    })
                                    .select()
                                    .single();
                                  setCustomMetrics([...customMetrics, savedMetric]);
                                  setNewMetric({
                                    name: "",
                                    target: "",
                                    current: "",
                                    unit: "",
                                  });
                                  setShowMetricForm(false);
                                }
                              } catch (error) {
                                logger.error("Error saving custom metric", error);
                              }
                            }}
                          >
                            Save Metric
                          </Button>
                        </div>
                      </div>
                    )}

                    {customMetrics.length === 0 && !showMetricForm ? (
                      <div className="text-center py-8">
                        <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                        <h3 className="text-lg font-medium mb-1">
                          No Custom Metrics
                        </h3>
                        <p className="text-muted-foreground mb-4">
                          Add custom metrics to track specific ESG indicators
                          relevant to your company
                        </p>
                        <Button
                          onClick={() => setShowMetricForm(true)}
                          variant="outline"
                          className="mx-auto"
                        >
                          <PlusCircle className="h-4 w-4 mr-2" />
                          Add Your First Metric
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {customMetrics.map((metric, index) => (
                          <div
                            key={metric.id || index}
                            className="border rounded-lg p-4"
                          >
                            <div className="flex justify-between items-center mb-2">
                              <h4 className="font-medium">{metric.name}</h4>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={async () => {
                                  try {
                                    if (user && metric.id) {
                                      await supabase
                                        .from("custom_metrics")
                                        .delete()
                                        .eq("id", metric.id);
                                      setCustomMetrics(
                                        customMetrics.filter(
                                          (m) => m.id !== metric.id,
                                        ),
                                      );
                                    }
                                  } catch (error) {
                                    logger.error("Error deleting custom metric", error);
                                  }
                                }}
                              >
                                <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                              </Button>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <span className="text-sm text-muted-foreground block">
                                  Current
                                </span>
                                <span className="font-medium">
                                  {metric.current} {metric.unit}
                                </span>
                              </div>
                              <div>
                                <span className="text-sm text-muted-foreground block">
                                  Target
                                </span>
                                <span className="font-medium">
                                  {metric.target} {metric.unit}
                                </span>
                              </div>
                            </div>
                            {metric.current && metric.target && (
                              <div className="mt-3">
                                <div className="flex justify-between text-xs mb-1">
                                  <span>Progress</span>
                                  <span>
                                    {Math.min(
                                      100,
                                      Math.max(
                                        0,
                                        Math.round(
                                          parseFloat(metric.target) >
                                            parseFloat(metric.current)
                                            ? (1 -
                                                parseFloat(metric.current) /
                                                  parseFloat(metric.target)) *
                                              100
                                            : (parseFloat(metric.target) /
                                                parseFloat(metric.current)) *
                                              100,
                                        ),
                                      ),
                                    )}
                                    %
                                  </span>
                                </div>
                                <Progress
                                  value={Math.min(
                                    100,
                                    Math.max(
                                      0,
                                      Math.round(
                                        parseFloat(metric.target) >
                                          parseFloat(metric.current)
                                          ? (1 -
                                              parseFloat(metric.current) /
                                                parseFloat(metric.target)) *
                                              100
                                          : (parseFloat(metric.target) /
                                              parseFloat(metric.current)) *
                                              100,
                                      ),
                                    ),
                                  )}
                                  className="h-2"
                                />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>

      <div className="flex justify-between items-center mt-8">
        <div className="flex items-center">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" className="mr-2">
                  <Printer className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Print plan</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" className="mr-2">
                  <FileDown className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Export as PDF</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon">
                  <FileSpreadsheet className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Export as Excel</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <div className="text-sm text-muted-foreground">
          Last updated: {new Date().toLocaleDateString()}
        </div>
      </div>
    </div>
  );
};

export default PlanGenerator;
