import React, { lazy, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { ArrowRight, BarChart3, FileText, Shield } from "lucide-react";

const Home = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Simplify Your ESG Reporting Journey
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-8">
              Generate tailored ESG management plans aligned with major
              frameworks based on your company's unique profile and industry
              requirements.
            </p>
            <Button
              size="lg"
              className="px-8 py-6 text-lg"
              onClick={() => navigate("/questionnaire")}
            >
              Start Your Assessment <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="relative rounded-xl overflow-hidden shadow-xl"
          >
            <img
              src="https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1200&q=80"
              alt="ESG Dashboard Preview"
              className="w-full h-auto rounded-xl"
              loading="lazy"
            />
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">
              Comprehensive ESG Management Solution
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Our platform streamlines the complex process of ESG reporting and
              management with powerful features.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<FileText className="h-10 w-10 text-primary" />}
              title="Smart Questionnaire System"
              description="Dynamic question paths tailored to your industry with progress tracking and save functionality."
            />
            <FeatureCard
              icon={<Shield className="h-10 w-10 text-primary" />}
              title="Framework Mapping Engine"
              description="Cross-references GRI, SASB, TCFD and more, filtering by materiality for your specific needs."
            />
            <FeatureCard
              icon={<BarChart3 className="h-10 w-10 text-primary" />}
              title="Interactive Dashboard"
              description="Visualize your materiality matrix and track framework coverage with intuitive metrics."
            />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">How It Works</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Generate your ESG management plan in four simple steps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <StepCard
              number="1"
              title="Company Profile"
              description="Enter basic information about your company, industry, and size."
            />
            <StepCard
              number="2"
              title="Answer Questionnaire"
              description="Complete our smart questionnaire tailored to your specific industry."
            />
            <StepCard
              number="3"
              title="Review Results"
              description="Examine your materiality assessment and framework recommendations."
            />
            <StepCard
              number="4"
              title="Download Plan"
              description="Get your customized ESG management plan with implementation roadmap."
            />
          </div>

          <div className="text-center mt-12">
            <Button size="lg" onClick={() => navigate("/questionnaire")}>
              Start Your ESG Journey <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-primary text-primary-foreground">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Transform Your ESG Reporting?
          </h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Join hundreds of companies already using our platform to streamline
            their ESG management and reporting process.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button variant="secondary" size="lg">
              Schedule a Demo
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="bg-transparent border-white hover:bg-white hover:text-primary"
            >
              Learn More
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

const FeatureCard = ({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) => {
  return (
    <Card className="h-full">
      <CardHeader>
        <div className="mb-4">{icon}</div>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription className="text-base">{description}</CardDescription>
      </CardContent>
      <CardFooter>
        <Button variant="ghost" className="p-0 h-auto">
          Learn more <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};

const StepCard = ({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) => {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold mb-4">
        {number}
      </div>
      <h3 className="text-xl font-medium mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
};

export default Home;
