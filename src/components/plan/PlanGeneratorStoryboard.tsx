import React, { useState } from "react";
import PlanMetaDataForm from "./PlanMetaDataForm";
import PlanRecommendations from "./PlanRecommendations";
import PlanImplementationPhases from "./PlanImplementationPhases";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { generateAIRecommendations } from "@/lib/plan-enhancement";
import { useToast } from "@/components/ui/use-toast";
import RecommendationModal from "./RecommendationModal";
import PhaseModal from "./PhaseModal";
import TaskModal from "./TaskModal";
import {
  ESGPlan,
  ESGRecommendation,
  ImplementationPhase,
  ImplementationTask,
  TaskStatus,
} from "@/components/AppContext";

const PlanGeneratorStoryboard: React.FC = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("details");
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingAIRecs, setIsGeneratingAIRecs] = useState(false);

  // Plan state
  const [planDetails, setPlanDetails] = useState<
    Partial<Pick<ESGPlan, "title" | "description">>
  >({
    title: "ESG Implementation Plan 2024",
    description:
      "A comprehensive plan to improve our environmental, social, and governance performance.",
  });
  const [recommendations, setRecommendations] = useState<ESGRecommendation[]>([
    {
      id: "rec-1",
      title: "Implement Carbon Footprint Tracking",
      description:
        "Establish a system to measure and track carbon emissions across all operations.",
      framework: "GRI",
      indicator: "305-1",
      priority: "high",
      effort: "medium",
      impact: "high",
    },
    {
      id: "rec-2",
      title: "Develop Supplier Code of Conduct",
      description:
        "Create and implement a code of conduct for suppliers that includes ESG criteria.",
      framework: "SASB",
      indicator: "CG-AA-430a.1",
      priority: "medium",
      effort: "low",
      impact: "medium",
    },
  ]);
  const [phases, setPhases] = useState<ImplementationPhase[]>([
    {
      id: "phase-1",
      title: "Initial Assessment & Planning",
      description:
        "Conduct baseline assessment and develop detailed implementation roadmap.",
      duration: "Q1 2024",
      tasks: [
        {
          id: "task-1",
          title: "Conduct ESG Materiality Assessment",
          description:
            "Identify and prioritize ESG topics most relevant to the business and stakeholders.",
          status: "completed",
        },
        {
          id: "task-2",
          title: "Develop Implementation Timeline",
          description:
            "Create detailed timeline with milestones for all ESG initiatives.",
          status: "in_progress",
        },
      ],
    },
    {
      id: "phase-2",
      title: "Data Collection & Reporting Infrastructure",
      description:
        "Establish systems and processes for ESG data collection and reporting.",
      duration: "Q2 2024",
      tasks: [
        {
          id: "task-3",
          title: "Select ESG Data Management Software",
          description:
            "Research and implement software solution for ESG data collection and reporting.",
          status: "not_started",
        },
        {
          id: "task-4",
          title: "Develop Data Collection Protocols",
          description:
            "Create standardized protocols for collecting ESG metrics across the organization.",
          status: "not_started",
        },
      ],
    },
  ]);

  // Modal states
  const [isRecommendationModalOpen, setIsRecommendationModalOpen] =
    useState(false);
  const [isPhaseModalOpen, setIsPhaseModalOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [currentRecommendation, setCurrentRecommendation] =
    useState<ESGRecommendation | null>(null);
  const [currentPhase, setCurrentPhase] = useState<ImplementationPhase | null>(
    null,
  );
  const [currentTask, setCurrentTask] = useState<ImplementationTask | null>(
    null,
  );
  const [currentPhaseId, setCurrentPhaseId] = useState<string | null>(null);

  // Handlers for plan details
  const handleDetailsChange = (
    field: keyof Pick<ESGPlan, "title" | "description">,
    value: string,
  ) => {
    setPlanDetails((prev) => ({ ...prev, [field]: value }));
  };

  // Handlers for recommendations
  const handleAddRecommendation = () => {
    setCurrentRecommendation(null);
    setIsRecommendationModalOpen(true);
  };

  const handleEditRecommendation = (recommendation: ESGRecommendation) => {
    setCurrentRecommendation(recommendation);
    setIsRecommendationModalOpen(true);
  };

  const handleSaveRecommendation = (recommendation: ESGRecommendation) => {
    if (currentRecommendation) {
      // Edit existing
      setRecommendations((prev) =>
        prev.map((rec) =>
          rec.id === recommendation.id ? recommendation : rec,
        ),
      );
    } else {
      // Add new
      setRecommendations((prev) => [...prev, recommendation]);
    }
    setIsRecommendationModalOpen(false);
  };

  const handleDeleteRecommendation = (recommendationId: string) => {
    setRecommendations((prev) =>
      prev.filter((rec) => rec.id !== recommendationId),
    );
  };

  // Handlers for phases
  const handleAddPhase = () => {
    setCurrentPhase(null);
    setIsPhaseModalOpen(true);
  };

  const handleEditPhase = (phase: ImplementationPhase) => {
    setCurrentPhase(phase);
    setIsPhaseModalOpen(true);
  };

  const handleSavePhase = (phase: ImplementationPhase) => {
    if (currentPhase) {
      // Edit existing
      setPhases((prev) => prev.map((p) => (p.id === phase.id ? phase : p)));
    } else {
      // Add new
      setPhases((prev) => [...prev, phase]);
    }
    setIsPhaseModalOpen(false);
  };

  const handleDeletePhase = (phaseId: string) => {
    setPhases((prev) => prev.filter((phase) => phase.id !== phaseId));
  };

  // Handlers for tasks
  const handleAddTaskToPhase = (phaseId: string) => {
    setCurrentTask(null);
    setCurrentPhaseId(phaseId);
    setIsTaskModalOpen(true);
  };

  const handleEditTask = (task: ImplementationTask, phaseId: string) => {
    setCurrentTask(task);
    setCurrentPhaseId(phaseId);
    setIsTaskModalOpen(true);
  };

  const handleSaveTask = (task: ImplementationTask, phaseId: string) => {
    setPhases((prev) =>
      prev.map((phase) => {
        if (phase.id === phaseId) {
          if (currentTask) {
            // Edit existing task
            return {
              ...phase,
              tasks: phase.tasks.map((t) => (t.id === task.id ? task : t)),
            };
          } else {
            // Add new task
            return {
              ...phase,
              tasks: [...phase.tasks, task],
            };
          }
        }
        return phase;
      }),
    );
    setIsTaskModalOpen(false);
  };

  const handleDeleteTask = (taskId: string, phaseId: string) => {
    setPhases((prev) =>
      prev.map((phase) => {
        if (phase.id === phaseId) {
          return {
            ...phase,
            tasks: phase.tasks.filter((task) => task.id !== taskId),
          };
        }
        return phase;
      }),
    );
  };

  const handleUpdateTaskStatus = (
    taskId: string,
    phaseId: string,
    status: TaskStatus,
  ) => {
    setPhases((prev) =>
      prev.map((phase) => {
        if (phase.id === phaseId) {
          return {
            ...phase,
            tasks: phase.tasks.map((task) =>
              task.id === taskId ? { ...task, status } : task,
            ),
          };
        }
        return phase;
      }),
    );
  };

  // AI recommendation generation
  const handleGenerateAIRecs = async () => {
    setIsGeneratingAIRecs(true);
    try {
      // Sample company and industry data - in a real app, this would come from user input or profile
      const companyName = "Acme Sustainable Solutions";
      const industry = "Manufacturing";
      const materialityTopics = [
        { name: "Carbon Emissions", importance: "high" },
        { name: "Water Management", importance: "medium" },
        { name: "Diversity & Inclusion", importance: "high" },
        { name: "Supply Chain Management", importance: "medium" },
      ];

      // Create ESG plan object from current state
      const esgPlan = {
        title: planDetails.title,
        description: planDetails.description,
        recommendations,
        phases,
      };

      const result = await generateAIRecommendations(
        companyName,
        industry,
        materialityTopics,
        esgPlan,
      );

      if (result.success && result.data) {
        // Add AI-generated recommendations to the existing ones
        if (
          result.data.frameworks &&
          Array.isArray(result.data.frameworks.recommendations)
        ) {
          const aiRecs = result.data.frameworks.recommendations.map(
            (rec: any) => ({
              id: `rec-ai-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
              title: rec.title || "AI Recommendation",
              description: rec.description || "",
              framework: rec.framework || "AI Generated",
              indicator: rec.indicator || "N/A",
              priority: (rec.priority || "medium").toLowerCase() as Priority,
              effort: (rec.effort || "medium").toLowerCase() as Effort,
              impact: (rec.impact || "medium").toLowerCase() as Impact,
            }),
          );

          setRecommendations((prev) => [...prev, ...aiRecs]);
          toast({
            title: "AI Recommendations Generated",
            description: `Added ${aiRecs.length} new recommendations to your plan.`,
          });
        } else {
          toast({
            title: "AI Generation Issue",
            description:
              "Received response but couldn't parse recommendations.",
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "AI Generation Failed",
          description: result.error || "Failed to generate AI recommendations.",
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: "Error",
        description:
          err instanceof Error ? err.message : "An unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingAIRecs(false);
    }
  };

  // Save plan
  const handleSavePlan = async () => {
    setIsLoading(true);
    try {
      // In a real app, this would save to your backend
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call

      toast({
        title: "Plan Saved",
        description: "Your ESG plan has been saved successfully.",
      });
    } catch (err) {
      toast({
        title: "Error Saving Plan",
        description:
          err instanceof Error ? err.message : "An unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-6 bg-background min-h-screen">
      <h1 className="text-3xl font-bold mb-6">ESG Plan Generator</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="details">Plan Details</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          <TabsTrigger value="implementation">Implementation</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="mt-6">
          <PlanMetaDataForm
            planDetails={planDetails}
            onDetailsChange={handleDetailsChange}
          />
        </TabsContent>

        <TabsContent value="recommendations" className="mt-6">
          <PlanRecommendations
            recommendations={recommendations}
            onAddRecommendation={handleAddRecommendation}
            onEditRecommendation={handleEditRecommendation}
            onDeleteRecommendation={handleDeleteRecommendation}
            onGenerateAIRecs={handleGenerateAIRecs}
            isGeneratingAIRecs={isGeneratingAIRecs}
          />
        </TabsContent>

        <TabsContent value="implementation" className="mt-6">
          <PlanImplementationPhases
            phases={phases}
            onAddPhase={handleAddPhase}
            onEditPhase={handleEditPhase}
            onDeletePhase={handleDeletePhase}
            onAddTaskToPhase={handleAddTaskToPhase}
            onEditTask={handleEditTask}
            onDeleteTask={handleDeleteTask}
            onUpdateTaskStatus={handleUpdateTaskStatus}
          />
        </TabsContent>
      </Tabs>

      <Card className="mt-6">
        <CardContent className="pt-6 flex justify-end">
          <Button onClick={handleSavePlan} disabled={isLoading}>
            {isLoading ? "Saving..." : "Save Plan"}
          </Button>
        </CardContent>
      </Card>

      {/* Modals */}
      <RecommendationModal
        isOpen={isRecommendationModalOpen}
        onClose={() => setIsRecommendationModalOpen(false)}
        onSave={handleSaveRecommendation}
        initialData={currentRecommendation}
      />

      <PhaseModal
        isOpen={isPhaseModalOpen}
        onClose={() => setIsPhaseModalOpen(false)}
        onSave={handleSavePhase}
        initialData={currentPhase}
      />

      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSave={handleSaveTask}
        initialData={currentTask}
        phaseId={currentPhaseId}
      />
    </div>
  );
};

export default PlanGeneratorStoryboard;
