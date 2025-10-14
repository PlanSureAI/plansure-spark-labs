import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import heroDashboard from "@/assets/hero-dashboard.jpg";

export const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-[var(--gradient-hero)]" />
      
      {/* Animated Glow Effect */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full opacity-30 blur-3xl"
           style={{ background: 'var(--glow-accent)' }} />

      <div className="relative z-10 container mx-auto px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border">
                <Sparkles className="w-4 h-4 text-secondary" />
                <span className="text-sm font-medium">AI-Powered Investment Intelligence</span>
              </div>
              
              <h1 className="text-5xl lg:text-7xl font-bold leading-tight">
                Cut feasibility to{" "}
                <span className="gradient-text">2 hours</span>
              </h1>
              
              <p className="text-xl text-muted-foreground leading-relaxed max-w-xl">
                PlansureAI's Development ROI Predictor transforms weeks of manual analysis into instant, 
                data-driven investment decisions. Predict returns with 40% higher accuracy using real-time 
                market intelligence.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="text-lg h-14 px-8 shadow-lg hover:shadow-xl transition-all">
                  Start Free Analysis
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
                <Button size="lg" variant="outline" className="text-lg h-14 px-8">
                  Watch Demo
                </Button>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-3 gap-6 pt-8 border-t border-border">
                <div>
                  <div className="text-3xl font-bold text-accent">40%</div>
                  <div className="text-sm text-muted-foreground">Higher accuracy</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-accent">2 hrs</div>
                  <div className="text-sm text-muted-foreground">vs 2 weeks</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-accent">10M+</div>
                  <div className="text-sm text-muted-foreground">Transactions analyzed</div>
                </div>
              </div>
            </div>

            {/* Right Content - Dashboard Preview */}
            <div className="relative">
              <div className="absolute -inset-4 rounded-2xl opacity-50 blur-2xl"
                   style={{ background: 'var(--glow-primary)' }} />
              <div className="relative rounded-2xl overflow-hidden border-2 border-border shadow-2xl transform hover:scale-105 transition-transform duration-500">
                <img 
                  src={heroDashboard} 
                  alt="PlansureAI Analytics Dashboard showing ROI predictions and market analysis"
                  className="w-full h-auto"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
