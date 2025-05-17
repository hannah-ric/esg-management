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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ImplementationTask, TaskStatus } from "@/components/AppContext"; // Adjust path
import { sanitizeInput, sanitizeObject } from "@/lib/error-utils";
import { useToast } from "@/components/ui/use-toast";

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: ImplementationTask, phaseId: string) => void;
  initialData?: ImplementationTask | null;
  phaseId: string | null; // ID of the phase this task belongs to
}

const defaultTask: Partial<ImplementationTask> = {
  title: "",
  description: "",
  status: "not_started",
};

// Create a type intersection to make ImplementationTask indexable
type IndexableImplementationTask = ImplementationTask & Record<string, unknown>;

const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  phaseId,
}) => {
  const [task, setTask] = useState<Partial<ImplementationTask>>(defaultTask);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      setTask(initialData ? { ...initialData } : defaultTask);
    }
  }, [isOpen, initialData]);

  const handleChange = useCallback(
    (field: keyof Omit<ImplementationTask, "id">, value: string) => {
      setTask((prev: Partial<ImplementationTask>) => ({ ...prev, [field]: sanitizeInput(value) }));
    },
    [],
  );

  const handleStatusChange = useCallback((value: TaskStatus) => {
    setTask((prev: Partial<ImplementationTask>) => ({ ...prev, status: value }));
  }, []);

  const handleSubmit = useCallback(() => {
    if (!phaseId) {
      toast({
        title: "Error",
        description: "Phase ID is missing. Cannot save task.",
        variant: "destructive",
      });
      return;
    }

    // Validate required fields
    const trimmedTitle = task.title?.trim() || "";
    if (!trimmedTitle) {
      toast({
        title: "Missing Fields",
        description: "Task Title is required.",
        variant: "destructive",
      });
      return;
    }

    // Create the task with validated data
    const finalTask: ImplementationTask = {
      id:
        initialData?.id ||
        `task-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      title: trimmedTitle,
      description: (task.description || "").trim(),
      status: task.status || "not_started",
    };

    // Save and close
    onSave(sanitizeObject(finalTask as IndexableImplementationTask) as ImplementationTask, phaseId);
    onClose();
  }, [task, initialData, phaseId, onSave, onClose, toast]);

  if (!isOpen || !phaseId) return null; // Don't render if not open or no phaseId

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>
            {initialData ? "Edit Task" : "Add New Task"}
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="task-title" className="text-right">
              Title
            </Label>
            <Input
              id="task-title"
              value={task.title}
              onChange={(e) => handleChange("title", e.target.value)}
              className="col-span-3"
              placeholder="E.g., Develop data collection protocol"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="task-description" className="text-right">
              Description
            </Label>
            <Textarea
              id="task-description"
              value={task.description}
              onChange={(e) => handleChange("description", e.target.value)}
              className="col-span-3"
              placeholder="Detailed description of the task"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="task-status" className="text-right">
              Status
            </Label>
            <Select
              value={task.status}
              onValueChange={(val) => handleStatusChange(val as TaskStatus)}
            >
              <SelectTrigger id="task-status" className="col-span-3">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="not_started">Not Started</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="blocked">Blocked</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </DialogClose>
          <Button type="button" onClick={handleSubmit}>
            Save Task
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TaskModal;
