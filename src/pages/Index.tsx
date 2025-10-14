import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { Features } from "@/components/Features";
import { ROICalculator } from "@/components/ROICalculator";
import { Workflow } from "@/components/Workflow";
import { CTA } from "@/components/CTA";
import { Footer } from "@/components/Footer";

const Index = () => {
  return (
    <main className="min-h-screen">
      <Navbar />
      <Hero />
      <Features />
      <ROICalculator />
      <Workflow />
      <CTA />
      <Footer />
    </main>
  );
};

export default Index;
