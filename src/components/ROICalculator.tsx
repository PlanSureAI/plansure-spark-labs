import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Calculator, TrendingUp, Clock, CheckCircle2, ArrowRight } from "lucide-react";

type ProjectData = {
  projectValue: string;
  units: string;
  location: string;
  timeline: string;
};

type CalculationResults = {
  roi: number;
  npv: number;
  irr: number;
  timeSaved: number;
  carbonReduction: number;
};

export const ROICalculator = () => {
  const [step, setStep] = useState(1);
  const [projectData, setProjectData] = useState<ProjectData>({
    projectValue: "",
    units: "",
    location: "",
    timeline: "",
  });
  const [results, setResults] = useState<CalculationResults | null>(null);

  const totalSteps = 3;
  const progress = (step / totalSteps) * 100;

  const handleInputChange = (field: keyof ProjectData, value: string) => {
    setProjectData((prev) => ({ ...prev, [field]: value }));
  };

  const calculateROI = () => {
    // Demo calculation logic
    const baseValue = parseFloat(projectData.projectValue) || 0;
    const unitsCount = parseFloat(projectData.units) || 0;
    const timelineMonths = parseFloat(projectData.timeline) || 12;

    const roi = Math.round(18 + Math.random() * 7); // 18-25%
    const npv = Math.round(baseValue * 0.22);
    const irr = Math.round(15 + Math.random() * 5); // 15-20%
    const timeSaved = Math.round(timelineMonths * 0.35); // 35% time reduction
    const carbonReduction = Math.round(unitsCount * 2.8); // ~2.8 tonnes per unit

    setResults({ roi, npv, irr, timeSaved, carbonReduction });
    setStep(4);
  };

  const canProceedStep1 = projectData.projectValue && projectData.units;
  const canProceedStep2 = projectData.location;
  const canProceedStep3 = projectData.timeline;

  const resetCalculator = () => {
    setStep(1);
    setProjectData({ projectValue: "", units: "", location: "", timeline: "" });
    setResults(null);
  };

  return (
    <section className="py-24 relative bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12 space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-4">
              <Calculator className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">Interactive Demo</span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold">
              See your potential{" "}
              <span className="gradient-text">ROI in 60 seconds</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Get instant insights into how PlansureAI can optimize your development project
            </p>
          </div>

          <Card className="p-8 shadow-xl border-2">
            {step < 4 && (
              <div className="mb-8">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-muted-foreground">
                    Step {step} of {totalSteps}
                  </span>
                  <span className="text-sm font-medium text-primary">
                    {Math.round(progress)}% Complete
                  </span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            )}

            {/* Step 1: Project Basics */}
            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-2xl font-semibold mb-2">Project Overview</h3>
                  <p className="text-muted-foreground">
                    Tell us about your development project
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="projectValue">Total Project Value (£)</Label>
                    <Input
                      id="projectValue"
                      type="number"
                      placeholder="e.g., 5000000"
                      value={projectData.projectValue}
                      onChange={(e) => handleInputChange("projectValue", e.target.value)}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="units">Number of Units</Label>
                    <Input
                      id="units"
                      type="number"
                      placeholder="e.g., 24"
                      value={projectData.units}
                      onChange={(e) => handleInputChange("units", e.target.value)}
                      className="mt-2"
                    />
                  </div>
                </div>

                <Button
                  onClick={() => setStep(2)}
                  disabled={!canProceedStep1}
                  className="w-full"
                  size="lg"
                >
                  Continue
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </div>
            )}

            {/* Step 2: Location */}
            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-2xl font-semibold mb-2">Project Location</h3>
                  <p className="text-muted-foreground">
                    Location impacts market dynamics and compliance requirements
                  </p>
                </div>

                <div>
                  <Label htmlFor="location">City or Region</Label>
                  <Input
                    id="location"
                    type="text"
                    placeholder="e.g., Manchester"
                    value={projectData.location}
                    onChange={(e) => handleInputChange("location", e.target.value)}
                    className="mt-2"
                  />
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={() => setStep(1)}
                    variant="outline"
                    className="flex-1"
                    size="lg"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={() => setStep(3)}
                    disabled={!canProceedStep2}
                    className="flex-1"
                    size="lg"
                  >
                    Continue
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Timeline */}
            {step === 3 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-2xl font-semibold mb-2">Development Timeline</h3>
                  <p className="text-muted-foreground">
                    Expected project duration from planning to completion
                  </p>
                </div>

                <div>
                  <Label htmlFor="timeline">Timeline (months)</Label>
                  <Input
                    id="timeline"
                    type="number"
                    placeholder="e.g., 18"
                    value={projectData.timeline}
                    onChange={(e) => handleInputChange("timeline", e.target.value)}
                    className="mt-2"
                  />
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={() => setStep(2)}
                    variant="outline"
                    className="flex-1"
                    size="lg"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={calculateROI}
                    disabled={!canProceedStep3}
                    className="flex-1"
                    size="lg"
                  >
                    Calculate ROI
                    <Calculator className="ml-2 w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 4: Results */}
            {step === 4 && results && (
              <div className="space-y-8">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-accent/10 rounded-full mb-4">
                    <CheckCircle2 className="w-8 h-8 text-accent" />
                  </div>
                  <h3 className="text-2xl font-semibold mb-2">Your Projected Results</h3>
                  <p className="text-muted-foreground">
                    Based on AI analysis of {projectData.units} units in {projectData.location}
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <Card className="p-6 bg-primary/5 border-primary/20">
                    <div className="flex items-start gap-3">
                      <TrendingUp className="w-5 h-5 text-primary mt-1" />
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Expected ROI</p>
                        <p className="text-3xl font-bold text-primary">{results.roi}%</p>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-6 bg-secondary/5 border-secondary/20">
                    <div className="flex items-start gap-3">
                      <Calculator className="w-5 h-5 text-secondary mt-1" />
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Net Present Value</p>
                        <p className="text-3xl font-bold text-secondary">
                          £{results.npv.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-6 bg-accent/5 border-accent/20">
                    <div className="flex items-start gap-3">
                      <TrendingUp className="w-5 h-5 text-accent mt-1" />
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Internal Rate of Return</p>
                        <p className="text-3xl font-bold text-accent">{results.irr}%</p>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-6 bg-muted border-border">
                    <div className="flex items-start gap-3">
                      <Clock className="w-5 h-5 text-foreground mt-1" />
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Time Saved</p>
                        <p className="text-3xl font-bold">{results.timeSaved} months</p>
                      </div>
                    </div>
                  </Card>
                </div>

                <Card className="p-6 bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
                  <div className="flex items-center gap-3 mb-2">
                    <CheckCircle2 className="w-5 h-5 text-accent" />
                    <p className="font-semibold">Future Homes Standard Compliance</p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Projected carbon reduction: <span className="font-bold text-accent">{results.carbonReduction} tonnes CO₂e</span> through optimized heat pump installations and enhanced fabric efficiency
                  </p>
                </Card>

                <div className="space-y-3">
                  <Button className="w-full" size="lg">
                    Start Your Free Analysis
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    size="lg"
                    onClick={resetCalculator}
                  >
                    Calculate Another Project
                  </Button>
                </div>
              </div>
            )}
          </Card>

          {step < 4 && (
            <p className="text-center text-sm text-muted-foreground mt-6">
              🔒 Your data is secure and never shared. This is a demo calculation.
            </p>
          )}
        </div>
      </div>
    </section>
  );
};
