import { Card } from "@/components/ui/card";
import { TrendingUp, MapPin, AlertCircle, FileText } from "lucide-react";

const features = [
  {
    icon: TrendingUp,
    title: "Automated Feasibility Analysis",
    description: "AI predicts ROI across multiple scenarios with IRR, NPV, and cash flow projections in minutes, not weeks.",
    color: "text-accent"
  },
  {
    icon: MapPin,
    title: "Real-Time Market Intelligence",
    description: "Live integration of zoning changes, demographic shifts, and comparable sales data for hyper-local insights.",
    color: "text-secondary"
  },
  {
    icon: AlertCircle,
    title: "Risk Scoring Dashboard",
    description: "Sensitivity analysis identifies key variables—construction costs, timeline delays, market absorption—before you invest.",
    color: "text-destructive"
  },
  {
    icon: FileText,
    title: "Instant Stakeholder Reports",
    description: "One-click export to presentation-ready formats for lenders, partners, and investment committees.",
    color: "text-primary"
  }
];

export const Features = () => {
  return (
    <section className="py-24 relative">
      <div className="container mx-auto px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl lg:text-5xl font-bold">
              Everything you need for{" "}
              <span className="gradient-text">confident decisions</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Four core capabilities that transform property development analysis from guesswork to certainty
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card 
                  key={index} 
                  className="p-8 hover:shadow-lg transition-all duration-300 border-2 group hover:border-primary/50"
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl bg-muted group-hover:bg-primary/10 transition-colors ${feature.color}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1 space-y-2">
                      <h3 className="text-xl font-semibold">{feature.title}</h3>
                      <p className="text-muted-foreground leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
