import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, Save } from "lucide-react";
import QuestionnaireStep from "./QuestionnaireStep";
import { useAppContext } from "./AppContext";
import { saveQuestionnaireData } from "@/lib/services";

interface QuestionnaireProps {
  onComplete?: (data: any) => void;
  initialData?: any;
}

const Questionnaire = ({
  onComplete = () => {},
  initialData = {},
}: QuestionnaireProps) => {
  const navigate = useNavigate();
  const { setQuestionnaireData } = useAppContext();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState(initialData);
  const [isSaving, setIsSaving] = useState(false);

  // Define the steps in the questionnaire
  const steps = [
    {
      id: "company-profile",
      title: "Company Profile",
      description: "Tell us about your organization",
      fields: [
        {
          id: "companyName",
          type: "text",
          label: "Company Name",
          required: true,
        },
        {
          id: "employeeCount",
          type: "select",
          label: "Number of Employees",
          options: [
            { value: "1-50", label: "1-50" },
            { value: "51-250", label: "51-250" },
            { value: "251-1000", label: "251-1000" },
            { value: "1001-5000", label: "1001-5000" },
            { value: "5000+", label: "5000+" },
          ],
          required: true,
        },
        {
          id: "companyType",
          type: "select",
          label: "Company Type",
          options: [
            { value: "public", label: "Publicly Traded" },
            { value: "private", label: "Privately Held" },
            { value: "nonprofit", label: "Non-Profit" },
            { value: "government", label: "Government" },
          ],
          required: true,
        },
        {
          id: "annualRevenue",
          type: "select",
          label: "Annual Revenue",
          options: [
            { value: "under1m", label: "Under $1 million" },
            { value: "1m-10m", label: "$1-10 million" },
            { value: "10m-100m", label: "$10-100 million" },
            { value: "100m-1b", label: "$100 million - $1 billion" },
            { value: "over1b", label: "Over $1 billion" },
          ],
          required: true,
        },
      ],
    },
    {
      id: "industry-selection",
      title: "Industry Selection",
      description: "Select your primary industry and sector",
      fields: [
        {
          id: "industry",
          type: "select",
          label: "Primary Industry",
          options: [
            { value: "energy", label: "Energy" },
            { value: "materials", label: "Materials" },
            { value: "industrials", label: "Industrials" },
            {
              value: "consumer-discretionary",
              label: "Consumer Discretionary",
            },
            { value: "consumer-staples", label: "Consumer Staples" },
            { value: "healthcare", label: "Healthcare" },
            { value: "financials", label: "Financials" },
            {
              value: "information-technology",
              label: "Information Technology",
            },
            {
              value: "communication-services",
              label: "Communication Services",
            },
            { value: "utilities", label: "Utilities" },
            { value: "real-estate", label: "Real Estate" },
          ],
          required: true,
        },
        {
          id: "sector",
          type: "text",
          label: "Specific Sector",
          placeholder: "e.g., Renewable Energy, Commercial Banking",
          required: true,
        },
      ],
    },
    {
      id: "regulatory-requirements",
      title: "Regulatory Requirements",
      description: "Tell us about your regulatory environment",
      fields: [
        {
          id: "primaryRegion",
          type: "select",
          label: "Primary Operating Region",
          options: [
            { value: "north-america", label: "North America" },
            { value: "europe", label: "Europe" },
            { value: "asia-pacific", label: "Asia-Pacific" },
            { value: "latin-america", label: "Latin America" },
            { value: "middle-east-africa", label: "Middle East & Africa" },
          ],
          required: true,
        },
        {
          id: "applicableRegulations",
          type: "checkbox",
          label: "Applicable Regulations",
          options: [
            {
              value: "eu-csrd",
              label: "EU Corporate Sustainability Reporting Directive (CSRD)",
            },
            {
              value: "eu-sfdr",
              label: "EU Sustainable Finance Disclosure Regulation (SFDR)",
            },
            {
              value: "uk-mandatory-reporting",
              label: "UK Mandatory Climate-related Financial Disclosures",
            },
            {
              value: "sec-climate-disclosure",
              label: "SEC Climate Disclosure Rules",
            },
            { value: "none", label: "None of the above" },
          ],
          required: true,
        },
        {
          id: "currentReporting",
          type: "checkbox",
          label: "Current ESG Reporting",
          options: [
            { value: "gri", label: "Global Reporting Initiative (GRI)" },
            {
              value: "sasb",
              label: "Sustainability Accounting Standards Board (SASB)",
            },
            {
              value: "tcfd",
              label:
                "Task Force on Climate-related Financial Disclosures (TCFD)",
            },
            { value: "cdp", label: "Carbon Disclosure Project (CDP)" },
            { value: "none", label: "Not currently reporting" },
          ],
          required: true,
        },
      ],
    },
    {
      id: "esg-maturity",
      title: "ESG Maturity Assessment",
      description: "Assess your current ESG initiatives and capabilities",
      fields: [
        {
          id: "esgStrategy",
          type: "radio",
          label: "ESG Strategy Development",
          options: [
            { value: "none", label: "No formal ESG strategy" },
            { value: "early", label: "Early stages of development" },
            {
              value: "established",
              label: "Established strategy but limited implementation",
            },
            {
              value: "advanced",
              label: "Advanced strategy with active implementation",
            },
            {
              value: "integrated",
              label: "Fully integrated into business strategy",
            },
          ],
          required: true,
        },
        {
          id: "dataCollection",
          type: "radio",
          label: "ESG Data Collection Capabilities",
          options: [
            { value: "minimal", label: "Minimal or ad-hoc data collection" },
            {
              value: "partial",
              label: "Partial data collection for key metrics",
            },
            {
              value: "systematic",
              label: "Systematic data collection process",
            },
            { value: "automated", label: "Automated data collection systems" },
            {
              value: "integrated",
              label: "Integrated data management platform",
            },
          ],
          required: true,
        },
        {
          id: "resourceAllocation",
          type: "radio",
          label: "Resource Allocation for ESG",
          options: [
            { value: "none", label: "No dedicated resources" },
            { value: "limited", label: "Limited part-time resources" },
            { value: "dedicated", label: "Dedicated ESG personnel" },
            { value: "team", label: "Dedicated ESG team" },
            {
              value: "department",
              label: "Full ESG department with specialized roles",
            },
          ],
          required: true,
        },
        {
          id: "implementationTimeline",
          type: "select",
          label: "Expected Implementation Timeline",
          options: [
            { value: "immediate", label: "Immediate (0-3 months)" },
            { value: "short", label: "Short-term (3-6 months)" },
            { value: "medium", label: "Medium-term (6-12 months)" },
            { value: "long", label: "Long-term (1-2 years)" },
            { value: "phased", label: "Phased approach over 2+ years" },
          ],
          required: true,
        },
      ],
    },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Save data to context and navigate to materiality matrix
      setQuestionnaireData(formData);
      onComplete(formData);
      navigate("/materiality-matrix");
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Save questionnaire data to Supabase
      const { user } = useAppContext();
      if (!user) {
        throw new Error("You must be logged in to save your progress");
      }

      // Prepare data for saving
      const dataToSave = {
        user_id: user.id,
        data: formData,
      };

      // Save to Supabase using the service
      await saveQuestionnaireData(dataToSave);

      // Update context
      setQuestionnaireData(formData);
    } catch (error) {
      console.error("Error saving questionnaire data:", error);
      // You could add a toast notification here
    } finally {
      setIsSaving(false);
    }
  };

  const handleStepDataChange = (stepId: string, data: any) => {
    setFormData({
      ...formData,
      [stepId]: data,
    });
  };

  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="bg-background min-h-screen p-4 md:p-8">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">
            ESG Management Plan Questionnaire
          </CardTitle>
          <CardDescription>
            Complete the following steps to generate your customized ESG
            management plan.
          </CardDescription>
          <div className="mt-4">
            <div className="flex justify-between text-sm mb-1">
              <span>
                Step {currentStep + 1} of {steps.length}
              </span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </CardHeader>

        <CardContent>
          <motion.div
            key={steps[currentStep].id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <QuestionnaireStep
              title={steps[currentStep].title}
              description={steps[currentStep].description}
              questions={steps[currentStep].fields.map((field) => ({
                id: field.id,
                type: field.type,
                question: field.label,
                options: field.options,
                required: field.required,
              }))}
              currentStep={currentStep + 1}
              totalSteps={steps.length}
              onNext={(answers) => {
                handleStepDataChange(steps[currentStep].id, answers);
                handleNext();
              }}
              onPrevious={handlePrevious}
              onSave={() => handleSave()}
              initialAnswers={formData[steps[currentStep].id] || {}}
            />
          </motion.div>
        </CardContent>

        <CardFooter className="flex justify-between">
          <div>
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 0}
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Previous
            </Button>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={handleSave} disabled={isSaving}>
              <Save className="mr-2 h-4 w-4" />
              {isSaving ? "Saving..." : "Save Progress"}
            </Button>
            <Button onClick={handleNext}>
              {currentStep < steps.length - 1 ? (
                <>
                  Next <ArrowRight className="ml-2 h-4 w-4" />
                </>
              ) : (
                "Complete"
              )}
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Questionnaire;
