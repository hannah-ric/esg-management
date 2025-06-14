import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft, ChevronRight, Save } from "lucide-react";

export interface Question {
  id: string;
  type:
    | "text"
    | "radio"
    | "checkbox"
    | "slider"
    | "textarea"
    | "select"
    | "multi-select";
  question: string;
  description?: string;
  options?: { value: string; label: string }[];
  required?: boolean;
  min?: number;
  max?: number;
  step?: number;
  conditional?: {
    dependsOn: string;
    showWhen: string | string[];
  };
  placeholder?: string;
}

// Define a type for the answers of a single step
type StepAnswers = Record<string, unknown>; 

export interface QuestionnaireStepProps {
  title?: string;
  description?: string;
  questions?: Question[];
  currentStep?: number;
  totalSteps?: number;
  onNext?: (answers: StepAnswers) => void; // Typed answers
  onPrevious?: () => void;
  onSave?: (answers: StepAnswers) => void; // Typed answers
  initialAnswers?: StepAnswers; // Typed initialAnswers
}

const QuestionnaireStep: React.FC<QuestionnaireStepProps> = ({
  title = "Questionnaire Step",
  description = "Please answer the following questions to continue.",
  questions = [],
  currentStep = 1,
  totalSteps = 1,
  onNext = () => {},
  onPrevious = () => {},
  onSave = () => {},
  initialAnswers = {},
}) => {
  const [answers, setAnswers] = useState<StepAnswers>(initialAnswers); // Typed answers state
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (id: string, value: unknown) => { // Changed value to unknown from any
    setAnswers((prev) => ({
      ...prev,
      [id]: value,
    }));

    // Clear error when field is filled
    if (errors[id]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[id];
        return newErrors;
      });
    }
  };

  const validateAnswers = () => {
    const newErrors: Record<string, string> = {};

    questions.forEach((question) => {
      if (
        question.required &&
        (answers[question.id] === undefined ||
          answers[question.id] === "" ||
          (Array.isArray(answers[question.id]) &&
            (answers[question.id] as unknown[]).length === 0))
      ) {
        newErrors[question.id] = "This field is required";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateAnswers()) {
      onNext(answers);
    }
  };

  const handleSave = () => {
    onSave(answers);
  };

  const shouldShowQuestion = (question: Question): boolean => {
    if (!question.conditional) return true;

    const { dependsOn, showWhen } = question.conditional;
    const dependentAnswer = answers[dependsOn];

    if (Array.isArray(showWhen)) {
      return showWhen.includes(dependentAnswer as string);
    }

    return dependentAnswer === showWhen;
  };

  const renderQuestion = (question: Question) => {
    if (!shouldShowQuestion(question)) return null;

    const {
      id,
      type,
      question: questionText,
      description,
      options,
      required,
      min,
      max,
      step,
      placeholder,
    } = question;
    const error = errors[id];

    switch (type) {
      case "text":
        return (
          <div className="space-y-2" key={id}>
            <Label htmlFor={id}>
              {questionText}
              {required && <span className="text-red-500">*</span>}
            </Label>
            {description && (
              <p className="text-sm text-muted-foreground">{description}</p>
            )}
            <Input
              id={id}
              type={type}
              placeholder={questionText}
              value={String(answers[id] || "")}
              onChange={(e) => handleChange(id, e.target.value)}
              required={required}
              className={error ? "border-red-500" : ""}
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
        );

      case "textarea":
        return (
          <div className="space-y-2" key={id}>
            <Label htmlFor={id}>
              {questionText}
              {required && <span className="text-red-500">*</span>}
            </Label>
            {description && (
              <p className="text-sm text-muted-foreground">{description}</p>
            )}
            <Textarea
              id={id}
              placeholder={questionText}
              value={String(answers[id] || "")}
              onChange={(e) => handleChange(id, e.target.value)}
              required={required}
              className={error ? "border-red-500" : ""}
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
        );

      case "radio":
        return (
          <div className="space-y-2" key={id}>
            <Label>
              {questionText}
              {required && <span className="text-red-500">*</span>}
            </Label>
            {description && (
              <p className="text-sm text-muted-foreground">{description}</p>
            )}
            <RadioGroup
              key={id}
              id={id}
              value={answers[id] as string || ""}
              onValueChange={(value) => handleChange(id, value)}
              required={required}
              className="mt-1 space-y-2"
            >
              {options?.map((option) => (
                <div className="flex items-center space-x-2" key={option.value}>
                  <RadioGroupItem
                    value={option.value}
                    id={`${id}-${option.value}`}
                  />
                  <Label htmlFor={`${id}-${option.value}`}>
                    {option.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
        );

      case "checkbox":
        return (
          <div className="space-y-2" key={id}>
            <Label>
              {questionText}
              {required && <span className="text-red-500">*</span>}
            </Label>
            {description && (
              <p className="text-sm text-muted-foreground">{description}</p>
            )}
            <div
              className={`space-y-2 ${error ? "border border-red-500 p-2 rounded-md" : ""}`}
            >
              {options?.map((option) => {
                const isChecked =
                  Array.isArray(answers[id]) &&
                  answers[id]?.includes(option.value);
                return (
                  <div
                    className="flex items-center space-x-2"
                    key={option.value}
                  >
                    <Checkbox
                      id={`${id}-${option.value}`}
                      checked={isChecked}
                      onCheckedChange={(checked) => {
                        const currentValues = Array.isArray(answers[id])
                          ? [...answers[id]]
                          : [];
                        if (checked) {
                          handleChange(id, [...currentValues, option.value]);
                        } else {
                          handleChange(
                            id,
                            currentValues.filter((v) => v !== option.value),
                          );
                        }
                      }}
                    />
                    <Label htmlFor={`${id}-${option.value}`}>
                      {option.label}
                    </Label>
                  </div>
                );
              })}
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
        );

      case "slider":
        return (
          <div key={id} className="space-y-2">
            <Label htmlFor={id}>
              {questionText}
              {required && <span className="text-red-500">*</span>}
            </Label>
            {description && (
              <p className="text-sm text-muted-foreground">{description}</p>
            )}
            <Slider
              id={id}
              min={min}
              max={max}
              step={step}
              value={[typeof answers[id] === 'number' ? answers[id] as number : (typeof min === 'number' ? min : 0)]}
              onValueChange={(value) => handleChange(id, value[0])}
              className={`mt-1 ${error ? "border-red-500" : ""}`}
            />
            <div className="text-sm text-center text-muted-foreground">
              <span>{typeof answers[id] === 'number' || typeof answers[id] === 'string' ? String(answers[id]) : String(min || 0)}</span> / {max}
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
        );

      case "select":
        return (
          <div className="space-y-2" key={id}>
            <Label htmlFor={id}>
              {questionText}
              {required && <span className="text-red-500">*</span>}
            </Label>
            {description && (
              <p className="text-sm text-muted-foreground">{description}</p>
            )}
            <Select
              key={id}
              value={answers[id] as string || ""}
              onValueChange={(value) => handleChange(id, value)}
              required={required}
            >
              <SelectTrigger id={id} className="mt-1">
                <SelectValue placeholder={question.placeholder || "Select an option"} />
              </SelectTrigger>
              <SelectContent>
                {options?.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="w-full bg-background"
    >
      <Card className="w-full">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
          <div className="mt-2">
            <Progress
              value={(currentStep / totalSteps) * 100}
              className="h-2"
            />
            <p className="text-sm text-muted-foreground mt-1">
              Step {currentStep} of {totalSteps}
            </p>
          </div>
        </CardHeader>

        <CardContent>
          <div className="space-y-6">{questions.map(renderQuestion)}</div>
        </CardContent>

        <CardFooter className="flex justify-between">
          <div>
            <Button
              variant="outline"
              onClick={onPrevious}
              disabled={currentStep === 1}
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>
          </div>

          <div className="flex space-x-2">
            <Button variant="outline" onClick={handleSave}>
              <Save className="mr-2 h-4 w-4" />
              Save Progress
            </Button>

            <Button onClick={handleNext}>
              {currentStep === totalSteps ? "Submit" : "Next"}
              {currentStep !== totalSteps && (
                <ChevronRight className="ml-2 h-4 w-4" />
              )}
            </Button>
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default QuestionnaireStep;
