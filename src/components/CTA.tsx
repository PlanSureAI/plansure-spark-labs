import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2 } from "lucide-react";

const benefits = [
  "No credit card required",
  "Free site analysis included",
  "Access to full feature set",
  "Cancel anytime"
];

export const CTA = () => {
  return (
    <section id="pricing" className="py-32 relative overflow-hidden">
      <div className="absolute inset-0 bg-[var(--gradient-primary)] opacity-5" />
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="text-center space-y-8 p-16 rounded-3xl bg-card border-2 border-border shadow-2xl">
            <div className="space-y-6">
              <h2 className="text-4xl lg:text-6xl font-bold">
                Ready to make{" "}
                <span className="gradient-text">data-driven</span>
                {" "}decisions?
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Join leading property developers transforming their investment analysis
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="text-lg h-14 px-8 shadow-lg hover:shadow-xl transition-all">
                Start Your Free Analysis
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button size="lg" variant="outline" className="text-lg h-14 px-8">
                Schedule Demo
              </Button>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-8">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center gap-2 justify-center sm:justify-start">
                  <CheckCircle2 className="w-5 h-5 text-accent flex-shrink-0" />
                  <span className="text-sm text-muted-foreground">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
