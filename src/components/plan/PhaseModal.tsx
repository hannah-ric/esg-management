import React, { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ImplementationPhase } from "@/components/AppContext"; // Adjust path
import { sanitizeInput, sanitizeObject } from "@/lib/error-utils";
import { useToast } from "@/components/ui/use-toast";

interface PhaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (phase: ImplementationPhase) => void;
  initialData?: ImplementationPhase | null;
}

const defaultPhase: Partial<ImplementationPhase> = {
  title: "",
  description: "",
  duration: "",
  tasks: [], // Tasks will be managed within the phase or by a separate TaskModal
};

// Create a type intersection to make ImplementationPhase indexable
type IndexableImplementationPhase = ImplementationPhase & Record<string, unknown>;

const PhaseModal: React.FC<PhaseModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  const [phase, setPhase] =
    useState<Partial<ImplementationPhase>>(defaultPhase);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      // Keep existing tasks if editing, otherwise start with empty tasks for a new phase
      setPhase(
        initialData ? { ...initialData } : { ...defaultPhase, tasks: [] },
      );
    }
  }, [isOpen, initialData]);

  const handleChange = useCallback(
    (field: keyof Omit<ImplementationPhase, "id" | "tasks">, value: string) => {
      setPhase((prev) => ({ ...prev, [field]: sanitizeInput(value) }));
    },
    [],
  );

  const handleSubmit = useCallback(() => {
    // Validate required fields with proper error messages
    const trimmedTitle = phase.title?.trim() || "";
    const trimmedDuration = phase.duration?.trim() || "";

    if (!trimmedTitle && !trimmedDuration) {
      toast({
        title: "Missing Fields",
        description: "Both Title and Duration are required for a phase.",
        variant: "destructive",
      });
      return;
    } else if (!trimmedTitle) {
      toast({
        title: "Missing Field",
        description: "Title is required for a phase.",
        variant: "destructive",
      });
      return;
    } else if (!trimmedDuration) {
      toast({
        title: "Missing Field",
        description: "Duration is required for a phase.",
        variant: "destructive",
      });
      return;
    }

    // Create the phase with validated data
    const finalPhase: ImplementationPhase = {
      id: phase.id || `phase-${Date.now()}`,
      title: phase.title || "New Phase",
      description: phase.description || "",
      duration: phase.duration || "",
      tasks: phase.tasks || [],
    };

    // Save and close - sanitize and cast to the correct type
    onSave(sanitizeObject(finalPhase as IndexableImplementationPhase) as ImplementationPhase);
    onClose();
  }, [phase, onSave, onClose, toast]);

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>
            {initialData ? "Edit Phase" : "Add New Phase"}
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="phase-title" className="text-right">
              Title
            </Label>
            <Input
              id="phase-title"
              value={phase.title}
              onChange={(e) => handleChange("title", e.target.value)}
              className="col-span-3"
              placeholder="E.g., Initial Setup & Assessment"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="phase-description" className="text-right">
              Description
            </Label>
            <Textarea
              id="phase-description"
              value={phase.description}
              onChange={(e) => handleChange("description", e.target.value)}
              className="col-span-3"
              placeholder="Detailed description of the phase objectives"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="phase-duration" className="text-right">
              Duration
            </Label>
            <Input
              id="phase-duration"
              value={phase.duration}
              onChange={(e) => handleChange("duration", e.target.value)}
              className="col-span-3"
              placeholder="E.g., 1-2 Months, Q1 2024"
            />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </DialogClose>
          <Button type="button" onClick={handleSubmit}>
            Save Phase
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PhaseModal;
