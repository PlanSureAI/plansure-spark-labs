import { Card } from "@/components/ui/card";
import { Upload, Zap, BarChart3, Download, ArrowRight } from "lucide-react";

const steps = [
  {
    icon: Upload,
    title: "Upload Site Address",
    description: "Enter location or draw boundary on interactive map",
    step: "01"
  },
  {
    icon: Zap,
    title: "AI Auto-Populates Data",
    description: "Zoning, infrastructure, demographics, and comps loaded instantly",
    step: "02"
  },
  {
    icon: BarChart3,
    title: "Generate Scenarios",
    description: "Three models (conservative, moderate, aggressive) with risk factors",
    step: "03"
  },
  {
    icon: Download,
    title: "Export & Decide",
    description: "Presentation-ready reports for stakeholders and lenders",
    step: "04"
  }
];

export const Workflow = () => {
  return (
    <section id="workflow" className="py-32 bg-muted/20">
      <div className="container mx-auto px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20 space-y-4">
            <h2 className="text-4xl lg:text-6xl font-bold">
              From site to decision in{" "}
              <span className="gradient-text">four simple steps</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              The fastest path from property data to investment intelligence
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={index} className="relative">
                  <Card className="p-6 h-full hover:shadow-xl transition-all duration-300 group border-2 hover:border-secondary/50">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="p-3 rounded-xl bg-secondary/10 group-hover:bg-secondary/20 transition-colors">
                          <Icon className="w-6 h-6 text-secondary" />
                        </div>
                        <span className="text-5xl font-bold text-muted/20 group-hover:text-secondary/30 transition-colors">
                          {step.step}
                        </span>
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-lg font-semibold">{step.title}</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  </Card>
                  
                  {index < steps.length - 1 && (
                    <div className="hidden lg:block absolute top-1/2 -right-3 -translate-y-1/2 z-10">
                      <ArrowRight className="w-6 h-6 text-muted-foreground/30" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
