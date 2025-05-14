import React from "react";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import {
  CheckCircle2,
  ArrowRight,
  Users,
  FileText,
  BarChart4,
  Calendar,
} from "lucide-react";

const AdvisoryServices = () => {
  return (
    <div className="container mx-auto py-12 px-4 bg-background">
      <div className="max-w-4xl mx-auto mb-12 text-center">
        <h1 className="text-4xl font-bold tracking-tight mb-4">
          ESG Advisory Services
        </h1>
        <p className="text-xl text-muted-foreground mb-6">
          Expert guidance to help your organization develop and implement
          effective ESG strategies
        </p>
        <Button size="lg" className="mt-2">
          Schedule a Consultation
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
        <Card className="border shadow-sm">
          <CardHeader>
            <div className="flex items-center mb-2">
              <Users className="h-6 w-6 text-primary mr-2" />
              <CardTitle>Stakeholder Engagement</CardTitle>
            </div>
            <CardDescription>
              Develop effective strategies for engaging with key stakeholders on
              ESG issues
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              <li className="flex items-start">
                <CheckCircle2 className="h-5 w-5 text-primary mr-2 mt-0.5" />
                <span>Stakeholder mapping and prioritization</span>
              </li>
              <li className="flex items-start">
                <CheckCircle2 className="h-5 w-5 text-primary mr-2 mt-0.5" />
                <span>Engagement strategy development</span>
              </li>
              <li className="flex items-start">
                <CheckCircle2 className="h-5 w-5 text-primary mr-2 mt-0.5" />
                <span>Communication planning and execution</span>
              </li>
              <li className="flex items-start">
                <CheckCircle2 className="h-5 w-5 text-primary mr-2 mt-0.5" />
                <span>Feedback collection and analysis</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full">
              Learn More
            </Button>
          </CardFooter>
        </Card>

        <Card className="border shadow-sm">
          <CardHeader>
            <div className="flex items-center mb-2">
              <FileText className="h-6 w-6 text-primary mr-2" />
              <CardTitle>Reporting & Disclosure</CardTitle>
            </div>
            <CardDescription>
              Expert guidance on ESG reporting frameworks and disclosure
              requirements
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              <li className="flex items-start">
                <CheckCircle2 className="h-5 w-5 text-primary mr-2 mt-0.5" />
                <span>Framework selection (GRI, SASB, TCFD)</span>
              </li>
              <li className="flex items-start">
                <CheckCircle2 className="h-5 w-5 text-primary mr-2 mt-0.5" />
                <span>Report structure and content development</span>
              </li>
              <li className="flex items-start">
                <CheckCircle2 className="h-5 w-5 text-primary mr-2 mt-0.5" />
                <span>Data collection methodology</span>
              </li>
              <li className="flex items-start">
                <CheckCircle2 className="h-5 w-5 text-primary mr-2 mt-0.5" />
                <span>Assurance readiness assessment</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full">
              Learn More
            </Button>
          </CardFooter>
        </Card>

        <Card className="border shadow-sm">
          <CardHeader>
            <div className="flex items-center mb-2">
              <BarChart4 className="h-6 w-6 text-primary mr-2" />
              <CardTitle>Materiality Assessment</CardTitle>
            </div>
            <CardDescription>
              Identify and prioritize the ESG topics most relevant to your
              business
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              <li className="flex items-start">
                <CheckCircle2 className="h-5 w-5 text-primary mr-2 mt-0.5" />
                <span>Industry-specific topic identification</span>
              </li>
              <li className="flex items-start">
                <CheckCircle2 className="h-5 w-5 text-primary mr-2 mt-0.5" />
                <span>Stakeholder importance analysis</span>
              </li>
              <li className="flex items-start">
                <CheckCircle2 className="h-5 w-5 text-primary mr-2 mt-0.5" />
                <span>Business impact assessment</span>
              </li>
              <li className="flex items-start">
                <CheckCircle2 className="h-5 w-5 text-primary mr-2 mt-0.5" />
                <span>Materiality matrix development</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full">
              Learn More
            </Button>
          </CardFooter>
        </Card>

        <Card className="border shadow-sm">
          <CardHeader>
            <div className="flex items-center mb-2">
              <Calendar className="h-6 w-6 text-primary mr-2" />
              <CardTitle>Strategy Development</CardTitle>
            </div>
            <CardDescription>
              Create a comprehensive ESG strategy aligned with your business
              objectives
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              <li className="flex items-start">
                <CheckCircle2 className="h-5 w-5 text-primary mr-2 mt-0.5" />
                <span>Current state assessment</span>
              </li>
              <li className="flex items-start">
                <CheckCircle2 className="h-5 w-5 text-primary mr-2 mt-0.5" />
                <span>Goal setting and KPI development</span>
              </li>
              <li className="flex items-start">
                <CheckCircle2 className="h-5 w-5 text-primary mr-2 mt-0.5" />
                <span>Initiative prioritization</span>
              </li>
              <li className="flex items-start">
                <CheckCircle2 className="h-5 w-5 text-primary mr-2 mt-0.5" />
                <span>Implementation roadmap creation</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full">
              Learn More
            </Button>
          </CardFooter>
        </Card>
      </div>

      <div className="max-w-3xl mx-auto bg-muted p-8 rounded-lg">
        <h2 className="text-2xl font-bold mb-4">
          Ready to enhance your ESG strategy?
        </h2>
        <p className="mb-6">
          Our team of ESG experts is ready to help you navigate the complex
          landscape of environmental, social, and governance requirements.
          Schedule a consultation today to discuss your specific needs.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            size="lg"
            className="flex-1"
            onClick={() => window.open("#/contact", "_blank")}
          >
            Schedule a Consultation
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="flex-1"
            onClick={() =>
              window.open(
                "/assets/esg-advisory-services-brochure.pdf",
                "_blank",
              )
            }
          >
            Download Services Brochure
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AdvisoryServices;
