import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext, ESGPlan, ESGRecommendation, ImplementationPhase, ImplementationTask, TaskStatus } from "./AppContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, /*CardDescription*/ } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, /*TabsContent*/ } from "@/components/ui/tabs";
import { Loader2, Save, ArrowLeft, AlertCircle, Info, Edit, /*Trash,*/ Eye, Download, Sparkles } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { logger } from "@/lib/logger";
import { useErrorHandler } from "@/lib/error-utils";
import { exportToPDFWithWorker } from "@/components/ExportUtils";
import { generateESGActionPlan, analyzeMaterialityImpactForPlan } from "@/lib/ai-services";

// Import sub-components
import PlanMetaDataForm from "./plan/PlanMetaDataForm";
import PlanRecommendations from "./plan/PlanRecommendations";
import PlanImplementationPhases from "./plan/PlanImplementationPhases";

// Import Modals
import RecommendationModal from './plan/RecommendationModal';
import PhaseModal from './plan/PhaseModal';
import TaskModal from './plan/TaskModal';

// Define ToastOptions locally to ensure compatibility
import { type ReactNode } from "react";
interface CustomToastOptions {
  title?: string | JSX.Element; // More specific type for title
  description?: ReactNode;
  variant?: "default" | "destructive" | "success" | null | undefined;
  action?: React.ReactElement<{ onClick: () => void; altText: string; children: React.ReactNode }>;
}

const PlanGenerator: React.FC = () => {
  const navigate = useNavigate();
  const appContext = useAppContext();
  const { toast } = useToast();
  const { handleAsync } = useErrorHandler();

  const [plan, setPlan] = useState<Partial<ESGPlan>>({
    title: "",
    description: "",
    recommendations: [],
    implementationPhases: [],
  });
  // const [impactAnalysisData, setImpactAnalysisData] = useState<AnalyzedContentResult | null>(null); // Unused
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingAIRecs, setIsGeneratingAIRecs] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("edit-plan");

  // Modal states
  const [isRecModalOpen, setIsRecModalOpen] = useState(false);
  const [editingRec, setEditingRec] = useState<ESGRecommendation | null>(null);
  const [isPhaseModalOpen, setIsPhaseModalOpen] = useState(false);
  const [editingPhase, setEditingPhase] = useState<ImplementationPhase | null>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<ImplementationTask | null>(null);
  const [currentPhaseIdForTask, setCurrentPhaseIdForTask] = useState<string | null>(null);

  useEffect(() => {
    if (appContext.esgPlan) {
      setPlan(appContext.esgPlan);
    } else if (appContext.materialityTopics.length > 0 && (!plan.recommendations || plan.recommendations.length === 0)) {
      // Only auto-generate if no plan exists from context AND no recommendations yet
      // handleGeneratePlanWithAI(); // Decide if auto-triggering is desired
    }
  }, [appContext.esgPlan, appContext.materialityTopics, plan.recommendations]);

  const handleGeneratePlanWithAI = useCallback(async () => {
    setIsGenerating(true);
    setIsGeneratingAIRecs(true);
    setError(null);

    // Step 1: Analyze Materiality Impact
    const impactResult = await handleAsync(
      async () => analyzeMaterialityImpactForPlan(appContext.materialityTopics),
      { errorMessage: "Failed to analyze materiality topics for plan generation." }
    );

    if (impactResult.error || !impactResult.data?.content) {
      setError(impactResult.error || "Could not generate impact analysis from AI.");
      setIsGenerating(false);
      setIsGeneratingAIRecs(false);
      return;
    }

    let impactAnalysisData = {};
    try {
      // Assuming impactResult.data.content is a JSON string representing the analysis
      impactAnalysisData = JSON.parse(impactResult.data.content);
    } catch (e) {
      logger.error("Failed to parse impact analysis JSON from AI", { error: e, content: impactResult.data.content });
      // If parsing fails, we can pass the raw string content, 
      // or handle it as an error if JSON is strictly expected.
      // For now, we'll pass the raw content string to the next step, 
      // generateESGActionPlan handles non-JSON content by wrapping it.
    }

    // Step 2: Generate ESG Action Plan using the analysis
    const planResult = await handleAsync(
      async () => generateESGActionPlan(appContext.materialityTopics, impactResult.data!.content!),
      { errorMessage: "Failed to generate ESG action plan with AI." }
    );

    if (planResult.error || !planResult.data?.content) {
      setError(planResult.error || "Could not generate plan content from AI.");
    } else {
      try {
        // Assuming planResult.data.content is a JSON string representing the plan
        const parsedPlan = JSON.parse(planResult.data.content) as Partial<ESGPlan>;
        setPlan(prev => ({
            title: parsedPlan.title || prev.title || "Generated ESG Action Plan",
            description: parsedPlan.description || prev.description || "AI-generated plan based on materiality assessment.",
            recommendations: parsedPlan.recommendations?.map((r, i) => ({ ...r, id: r.id || `rec-${Date.now()}-${i}`})) || [],
            implementationPhases: parsedPlan.implementationPhases?.map((p, i) => ({
                ...p,
                id: p.id || `phase-${Date.now()}-${i}`,
                tasks: p.tasks?.map((t, j) => ({ ...t, id: t.id || `task-${Date.now()}-${i}-${j}`, status: t.status || 'not_started'})) || []
            })) || [],
        }));
        toast({ title: "AI Plan Generated", description: "Review and customize the AI-generated plan.", variant: "default" });
      } catch (e) {
        logger.error("Failed to parse generated plan JSON from AI", { error: e, content: planResult.data.content });
        setError("Error processing AI-generated plan. The format was unexpected.");
      }
    }
    setIsGenerating(false);
    setIsGeneratingAIRecs(false);
  }, [appContext.materialityTopics, handleAsync, toast]);

  const handleSavePlan = useCallback(async () => {
    setIsSaving(true);
    setError(null);
    const result = await handleAsync(
      async () => {
        if (!plan.title || plan.recommendations?.length === 0) {
          throw new Error("Plan title and at least one recommendation are required.");
        }
        const finalPlan: ESGPlan = {
          id: plan.id || `plan-${Date.now()}`,
          title: plan.title!,
          description: plan.description || "",
          recommendations: plan.recommendations!.map((r, i) => ({ ...r, id: r.id || `rec-save-${Date.now()}-${i}`})),
          implementationPhases: (plan.implementationPhases || []).map((p, i) => ({
            ...p,
            id: p.id || `phase-save-${Date.now()}-${i}`,
            tasks: (p.tasks || []).map((t, j) => ({...t, id: t.id || `task-save-${Date.now()}-${i}-${j}`}))
          }))
        };
        appContext.updateESGPlan(finalPlan);
        await appContext.saveESGPlan(); 
        return finalPlan;
      },
      { 
        errorMessage: "Failed to save ESG plan.",
        successMessage: "ESG Action Plan saved successfully!" ,
        showErrorToast: true,
        showSuccessToast: true,
      }
    );
    if (result.data) {
      setPlan(result.data);
      setActiveTab("view-plan");
    }
    setIsSaving(false);
  }, [plan, appContext, handleAsync]);
  
  const handlePlanDetailsChange = useCallback((field: keyof Pick<ESGPlan, 'title' | 'description'>, value: string) => {
    setPlan(prev => ({ ...prev, [field]: value }));
  }, []);

  // Recommendation Modal Handlers
  const openRecommendationModal = useCallback((rec?: ESGRecommendation) => {
    setEditingRec(rec || null);
    setIsRecModalOpen(true);
  }, []);

  const closeRecommendationModal = useCallback(() => {
    setIsRecModalOpen(false);
    setEditingRec(null);
  }, []);

  const handleSaveRecommendation = useCallback((savedRec: ESGRecommendation) => {
    setPlan(prevPlan => {
      const recommendations = prevPlan.recommendations ? [...prevPlan.recommendations] : [];
      const existingIndex = recommendations.findIndex(r => r.id === savedRec.id);
      if (existingIndex > -1) {
        recommendations[existingIndex] = savedRec;
      } else {
        recommendations.push(savedRec);
      }
      return { ...prevPlan, recommendations };
    });
  }, []);

  const handleDeleteRecommendation = useCallback((recId: string) => {
    setPlan(p => ({ ...p, recommendations: p.recommendations?.filter(r => r.id !== recId) }));
  }, []);

  // Phase Modal Handlers
  const openPhaseModal = useCallback((phase?: ImplementationPhase) => {
    setEditingPhase(phase || null);
    setIsPhaseModalOpen(true);
  }, []);

  const closePhaseModal = useCallback(() => {
    setIsPhaseModalOpen(false);
    setEditingPhase(null);
  }, []);

  const handleSavePhase = useCallback((savedPhase: ImplementationPhase) => {
    setPlan(prevPlan => {
      const phases = prevPlan.implementationPhases ? [...prevPlan.implementationPhases] : [];
      const existingIndex = phases.findIndex(p => p.id === savedPhase.id);
      if (existingIndex > -1) {
        phases[existingIndex] = savedPhase;
      } else {
        phases.push(savedPhase);
      }
      return { ...prevPlan, implementationPhases: phases };
    });
    toast({ title: editingPhase ? "Phase Updated" : "Phase Added", variant: "default" });
    closePhaseModal();
  }, [editingPhase, closePhaseModal, toast]);

  const closeTaskModal = useCallback(() => {
    setIsTaskModalOpen(false);
    setEditingTask(null);
    setCurrentPhaseIdForTask(null);
  }, []);

  const handleDeletePhase = useCallback((phaseId: string) => {
    setPlan(p => ({ ...p, implementationPhases: p.implementationPhases?.filter(ph => ph.id !== phaseId) }));
    toast({ title: editingTask ? "Task Updated" : "Task Added", variant: "default" });
    closeTaskModal();
  }, [editingTask, closeTaskModal, toast]);

  // Task Modal Handlers
  const openTaskModal = useCallback((task: ImplementationTask | undefined, phaseId: string) => {
    setCurrentPhaseIdForTask(phaseId);
    setEditingTask(task || null);
    setIsTaskModalOpen(true);
  }, []);

  const handleSaveTask = useCallback((savedTask: ImplementationTask, phaseId: string) => {
    setPlan(prevPlan => {
      const phases = prevPlan.implementationPhases ? prevPlan.implementationPhases.map(p => {
        if (p.id === phaseId) {
          const tasks = p.tasks ? [...p.tasks] : [];
          const existingIndex = tasks.findIndex(t => t.id === savedTask.id);
          if (existingIndex > -1) {
            tasks[existingIndex] = savedTask;
          } else {
            tasks.push(savedTask);
          }
          return { ...p, tasks };
        }
        return p;
      }) : [];
      return { ...prevPlan, implementationPhases: phases };
    });
    toast({ title: editingTask ? "Task Updated" : "Task Added", variant: "default" });
    closeTaskModal();
  }, [editingTask, closeTaskModal, toast]);

  const handleDeleteTask = useCallback((taskId: string, phaseId: string) => {
    setPlan(p => ({
      ...p,
      implementationPhases: p.implementationPhases?.map(ph =>
        ph.id === phaseId ? { ...ph, tasks: ph.tasks?.filter(t => t.id !== taskId) } : ph
      )
    }));
  }, []);
  
  const handleUpdateTaskStatus = useCallback((taskId: string, phaseId: string, status: TaskStatus) => {
    setPlan(p => ({
      ...p,
      implementationPhases: p.implementationPhases?.map(ph =>
        ph.id === phaseId ? { ...ph, tasks: ph.tasks?.map(t => t.id === taskId ? { ...t, status } : t) } : ph
      )
    }));
  }, []);

  const planRecommendations = useMemo(() => plan.recommendations || [], [plan.recommendations]);
  const planPhases = useMemo(() => plan.implementationPhases || [], [plan.implementationPhases]);
  const canSave = useMemo(() => plan.title && (plan.recommendations?.length || 0) > 0, [plan.title, plan.recommendations]);

  const handleDownloadPlanPDF = useCallback(() => {
    if (!plan.id) {
      toast({
        title: "Cannot Download",
        description: "Please save the plan before downloading.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "PDF Generation Started",
      description: "Your plan PDF is being generated and will download shortly.",
      variant: "default",
    });

    const toastWrapper = (options: CustomToastOptions) => {
      toast(options);
    };

    exportToPDFWithWorker(
      "plan-print-area",
      `${plan.title?.replace(/\s+/g, '-').toLowerCase() || 'esg-plan'}.pdf`,
      toastWrapper,
    );
  }, [plan.id, plan.title, toast]);

  if (appContext.loading && !appContext.esgPlan) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">Loading your ESG plan...</p>
      </div>
    );
  }

  return (
    <div id="plan-print-area" className="container mx-auto p-4 md:p-8">
      <div className="flex justify-between items-center mb-6 print-hide">
        <Button variant="outline" onClick={() => navigate(-1)} size="sm">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
          {activeTab === "edit-plan" ? "ESG Action Plan Generator" : plan.title || "View ESG Action Plan"}
        </h1>
        <div className="space-x-2">
            {activeTab === "view-plan" && (
                <Button onClick={() => setActiveTab("edit-plan")} variant="outline" size="sm">
                    <Edit className="mr-2 h-4 w-4" /> Edit Plan
                </Button>
            )}
             {activeTab === "edit-plan" && (
                <Button onClick={handleSavePlan} disabled={isSaving || isGenerating || !canSave} size="sm">
                    {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    Save Plan
                </Button>
            )}
            <Button onClick={handleDownloadPlanPDF} variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" /> Download PDF
            </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="grid w-full grid-cols-2 md:w-1/2">
          <TabsTrigger value="edit-plan">
            <Edit className="mr-2 h-4 w-4" /> Edit Mode
          </TabsTrigger>
          <TabsTrigger value="view-plan" disabled={!plan.id}>
            <Eye className="mr-2 h-4 w-4" /> View Mode
          </TabsTrigger>
        </TabsList>
      </Tabs>
      
      {activeTab === "edit-plan" && appContext.materialityTopics.length === 0 && !appContext.esgPlan && (
         <Card className="mb-6 text-center">
            <CardHeader>
                <CardTitle>Start with Materiality Assessment</CardTitle>
            </CardHeader>
            <CardContent>
                <Info className="mx-auto h-12 w-12 text-blue-500 mb-4" />
                <p className="mb-4 text-muted-foreground">
                    To generate an effective ESG action plan, please complete your materiality assessment first.
                    This will provide the foundation for AI-powered recommendations.
                </p>
                <Button onClick={() => navigate("/materiality")}>Go to Materiality Assessment</Button>
            </CardContent>
         </Card>
      )}

      {activeTab === "edit-plan" && appContext.materialityTopics.length > 0 && (!plan.recommendations || plan.recommendations.length === 0) && !isGenerating &&(
        <Card className="mb-6 text-center">
            <CardHeader>
                <CardTitle>Generate Your ESG Action Plan</CardTitle>
            </CardHeader>
            <CardContent>
                <Info className="mx-auto h-12 w-12 text-blue-500 mb-4" />
                <p className="mb-4 text-muted-foreground">
                    Use your materiality assessment to generate an initial ESG action plan with AI.
                    You can then customize it to fit your specific needs.
                </p>
                <Button onClick={handleGeneratePlanWithAI} disabled={isGenerating || isGeneratingAIRecs}>
                    {isGenerating || isGeneratingAIRecs ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                    Generate Plan with AI
                </Button>
            </CardContent>
        </Card>
      )}
      
      {(isGenerating || isGeneratingAIRecs) && (
         <Card className="mb-6 text-center">
            <CardContent className="p-10">
                <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary mb-4" />
                <p className="text-lg font-medium">Generating your ESG Action Plan...</p>
                <p className="text-sm text-muted-foreground">This may take a moment. Please wait.</p>
            </CardContent>
         </Card>
      )}

      {((activeTab === "edit-plan" && (plan.recommendations?.length || 0) > 0) || activeTab === "view-plan") && (
        <>
            <PlanMetaDataForm 
                planDetails={{ title: plan.title, description: plan.description }}
                onDetailsChange={handlePlanDetailsChange}
                isEditing={activeTab === 'edit-plan'}
            />

            <PlanRecommendations
                recommendations={planRecommendations}
                onAddRecommendation={() => openRecommendationModal()}
                onEditRecommendation={openRecommendationModal}
                onDeleteRecommendation={handleDeleteRecommendation}
                onGenerateAIRecs={handleGeneratePlanWithAI}
                isGeneratingAIRecs={isGeneratingAIRecs}
                isEditing={activeTab === 'edit-plan'}
            />

            <PlanImplementationPhases
                phases={planPhases}
                onAddPhase={() => openPhaseModal()}
                onEditPhase={openPhaseModal}
                onDeletePhase={handleDeletePhase}
                onAddTaskToPhase={(phaseId) => openTaskModal(undefined, phaseId)}
                onEditTask={openTaskModal}
                onDeleteTask={handleDeleteTask}
                onUpdateTaskStatus={handleUpdateTaskStatus}
                isEditing={activeTab === 'edit-plan'}
            />
        </>
      )}

      <RecommendationModal 
        isOpen={isRecModalOpen}
        onClose={closeRecommendationModal}
        onSave={handleSaveRecommendation}
        initialData={editingRec}
      />
      <PhaseModal 
        isOpen={isPhaseModalOpen}
        onClose={closePhaseModal}
        onSave={handleSavePhase}
        initialData={editingPhase}
      />
      <TaskModal 
        isOpen={isTaskModalOpen}
        onClose={closeTaskModal}
        onSave={handleSaveTask}
        initialData={editingTask}
        phaseId={currentPhaseIdForTask}
      />
    </div>
  );
};

export default PlanGenerator;
