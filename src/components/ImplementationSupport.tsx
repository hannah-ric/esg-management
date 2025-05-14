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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import {
  CheckCircle2,
  ArrowRight,
  ClipboardCheck,
  Database,
  LineChart,
  Users2,
} from "lucide-react";

const ImplementationSupport = () => {
  return (
    <div className="container mx-auto py-12 px-4 bg-background">
      <div className="max-w-4xl mx-auto mb-12 text-center">
        <h1 className="text-4xl font-bold tracking-tight mb-4">
          ESG Implementation Support
        </h1>
        <p className="text-xl text-muted-foreground mb-6">
          Comprehensive assistance to turn your ESG strategy into actionable
          results
        </p>
        <Button size="lg" className="mt-2">
          Request Implementation Support
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>

      <Tabs defaultValue="data" className="max-w-5xl mx-auto mb-16">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="data">Data Collection</TabsTrigger>
          <TabsTrigger value="systems">Systems Integration</TabsTrigger>
          <TabsTrigger value="reporting">Reporting</TabsTrigger>
          <TabsTrigger value="training">Training</TabsTrigger>
        </TabsList>

        <TabsContent value="data" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center mb-2">
                <Database className="h-6 w-6 text-primary mr-2" />
                <CardTitle>ESG Data Collection & Management</CardTitle>
              </div>
              <CardDescription>
                Establish robust processes for collecting, validating, and
                managing ESG data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium text-lg mb-3">Our Approach</h3>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <CheckCircle2 className="h-5 w-5 text-primary mr-2 mt-0.5" />
                      <span>Data inventory assessment</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle2 className="h-5 w-5 text-primary mr-2 mt-0.5" />
                      <span>Collection methodology development</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle2 className="h-5 w-5 text-primary mr-2 mt-0.5" />
                      <span>Data validation protocols</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle2 className="h-5 w-5 text-primary mr-2 mt-0.5" />
                      <span>Storage and security solutions</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-medium text-lg mb-3">Key Benefits</h3>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <CheckCircle2 className="h-5 w-5 text-primary mr-2 mt-0.5" />
                      <span>Improved data accuracy and reliability</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle2 className="h-5 w-5 text-primary mr-2 mt-0.5" />
                      <span>Streamlined collection processes</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle2 className="h-5 w-5 text-primary mr-2 mt-0.5" />
                      <span>Reduced reporting burden</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle2 className="h-5 w-5 text-primary mr-2 mt-0.5" />
                      <span>Audit-ready documentation</span>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full">
                Learn More About Data Collection Support
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="systems" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center mb-2">
                <ClipboardCheck className="h-6 w-6 text-primary mr-2" />
                <CardTitle>ESG Systems Integration</CardTitle>
              </div>
              <CardDescription>
                Integrate ESG data collection and reporting into your existing
                business systems
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium text-lg mb-3">Our Approach</h3>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <CheckCircle2 className="h-5 w-5 text-primary mr-2 mt-0.5" />
                      <span>Systems assessment and gap analysis</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle2 className="h-5 w-5 text-primary mr-2 mt-0.5" />
                      <span>Integration planning and architecture</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle2 className="h-5 w-5 text-primary mr-2 mt-0.5" />
                      <span>Implementation support</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle2 className="h-5 w-5 text-primary mr-2 mt-0.5" />
                      <span>Testing and quality assurance</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-medium text-lg mb-3">Key Benefits</h3>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <CheckCircle2 className="h-5 w-5 text-primary mr-2 mt-0.5" />
                      <span>Seamless data flow between systems</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle2 className="h-5 w-5 text-primary mr-2 mt-0.5" />
                      <span>Reduced manual data handling</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle2 className="h-5 w-5 text-primary mr-2 mt-0.5" />
                      <span>Real-time ESG performance monitoring</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle2 className="h-5 w-5 text-primary mr-2 mt-0.5" />
                      <span>Enhanced data governance</span>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full">
                Learn More About Systems Integration
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="reporting" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center mb-2">
                <LineChart className="h-6 w-6 text-primary mr-2" />
                <CardTitle>ESG Reporting Implementation</CardTitle>
              </div>
              <CardDescription>
                Develop and implement effective ESG reporting processes and
                templates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium text-lg mb-3">Our Approach</h3>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <CheckCircle2 className="h-5 w-5 text-primary mr-2 mt-0.5" />
                      <span>Framework-specific report templates</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle2 className="h-5 w-5 text-primary mr-2 mt-0.5" />
                      <span>Reporting process development</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle2 className="h-5 w-5 text-primary mr-2 mt-0.5" />
                      <span>Data visualization design</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle2 className="h-5 w-5 text-primary mr-2 mt-0.5" />
                      <span>Quality control procedures</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-medium text-lg mb-3">Key Benefits</h3>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <CheckCircle2 className="h-5 w-5 text-primary mr-2 mt-0.5" />
                      <span>Framework-compliant reporting</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle2 className="h-5 w-5 text-primary mr-2 mt-0.5" />
                      <span>Streamlined reporting cycles</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle2 className="h-5 w-5 text-primary mr-2 mt-0.5" />
                      <span>Compelling data storytelling</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle2 className="h-5 w-5 text-primary mr-2 mt-0.5" />
                      <span>Stakeholder-focused communication</span>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full">
                Learn More About Reporting Implementation
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="training" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center mb-2">
                <Users2 className="h-6 w-6 text-primary mr-2" />
                <CardTitle>ESG Training & Capacity Building</CardTitle>
              </div>
              <CardDescription>
                Develop internal capabilities to manage and improve ESG
                performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium text-lg mb-3">Our Approach</h3>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <CheckCircle2 className="h-5 w-5 text-primary mr-2 mt-0.5" />
                      <span>Skills gap assessment</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle2 className="h-5 w-5 text-primary mr-2 mt-0.5" />
                      <span>Customized training programs</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle2 className="h-5 w-5 text-primary mr-2 mt-0.5" />
                      <span>Role-specific guidance</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle2 className="h-5 w-5 text-primary mr-2 mt-0.5" />
                      <span>Knowledge transfer protocols</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-medium text-lg mb-3">Key Benefits</h3>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <CheckCircle2 className="h-5 w-5 text-primary mr-2 mt-0.5" />
                      <span>Enhanced internal ESG expertise</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle2 className="h-5 w-5 text-primary mr-2 mt-0.5" />
                      <span>Improved employee engagement</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle2 className="h-5 w-5 text-primary mr-2 mt-0.5" />
                      <span>Sustainable ESG management</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle2 className="h-5 w-5 text-primary mr-2 mt-0.5" />
                      <span>Reduced dependency on external support</span>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full">
                Learn More About ESG Training Programs
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="max-w-3xl mx-auto bg-muted p-8 rounded-lg">
        <h2 className="text-2xl font-bold mb-4">
          Ready to implement your ESG strategy?
        </h2>
        <p className="mb-6">
          Our implementation support services help you turn ESG plans into
          action. Our team of experts will work with you to develop practical
          solutions tailored to your organization's specific needs and
          challenges.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            size="lg"
            className="flex-1"
            onClick={() => window.open("#/contact", "_blank")}
          >
            Request Implementation Support
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="flex-1"
            onClick={() => window.open("#/contact?type=discovery", "_blank")}
          >
            Schedule a Discovery Call
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ImplementationSupport;
