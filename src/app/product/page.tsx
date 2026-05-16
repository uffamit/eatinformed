import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, ScanText, HeartPulse, UserCircle, ShieldCheck, Activity, BrainCircuit } from "lucide-react";

export default function ProductPage() {
  return (
    <div className="min-h-screen bg-background">
      <main className="pt-32 pb-20">
        <div className="container mx-auto px-4">
          {/* Hero Section */}
          <div className="max-w-4xl mx-auto mb-20 text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 text-balance">
              Nutritional Intelligence at Your Fingertips
            </h1>
            <p className="text-xl text-gray-300 mb-8 text-balance max-w-3xl mx-auto">
              EatInformed uses advanced AI to analyze food labels, extracting complex nutritional data and evaluating health safety against your personalized dietary profile.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/check">
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground group">
                  Scan a Label Now
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Key Capabilities */}
          <div className="max-w-6xl mx-auto mb-24">
            <h2 className="text-3xl font-bold text-white mb-12 text-center">Key Capabilities</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-card/50 backdrop-blur-sm border border-border/30 rounded-xl p-8 hover:border-border/60 hover:bg-card/70 transition-all duration-300 group">
                <ScanText className="w-12 h-12 text-primary mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-xl font-bold text-white mb-3">AI Vision Extraction</h3>
                <p className="text-gray-400">Instantly extract ingredients, macros, and allergens from any photo of a food label using our state of the art Vision models.</p>
              </div>

              <div className="bg-card/50 backdrop-blur-sm border border-border/30 rounded-xl p-8 hover:border-border/60 hover:bg-card/70 transition-all duration-300 group">
                <HeartPulse className="w-12 h-12 text-primary mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-xl font-bold text-white mb-3">Health Safety Analysis</h3>
                <p className="text-gray-400">Advanced AI analyzes the extracted data to identify hidden additives, risky ingredients, and nutritional balance.</p>
              </div>

              <div className="bg-card/50 backdrop-blur-sm border border-border/30 rounded-xl p-8 hover:border-border/60 hover:bg-card/70 transition-all duration-300 group">
                <UserCircle className="w-12 h-12 text-primary mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-xl font-bold text-white mb-3">Personalized Profiles</h3>
                <p className="text-gray-400">Tailor the analysis to your specific dietary requirements, allergies, and long-term health goals.</p>
              </div>

              <div className="bg-card/50 backdrop-blur-sm border border-border/30 rounded-xl p-8 hover:border-border/60 hover:bg-card/70 transition-all duration-300 group">
                <Activity className="w-12 h-12 text-primary mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-xl font-bold text-white mb-3">Scoring System</h3>
                <p className="text-gray-400">Receive a comprehensive health score and color-coded safety indicators for every product you scan.</p>
              </div>

              <div className="bg-card/50 backdrop-blur-sm border border-border/30 rounded-xl p-8 hover:border-border/60 hover:bg-card/70 transition-all duration-300 group">
                <ShieldCheck className="w-12 h-12 text-primary mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-xl font-bold text-white mb-3">Allergen Detection</h3>
                <p className="text-gray-400">Automatically flag cross-contamination risks and hidden allergens based on your specific profile settings.</p>
              </div>

              <div className="bg-card/50 backdrop-blur-sm border border-border/30 rounded-xl p-8 hover:border-border/60 hover:bg-card/70 transition-all duration-300 group">
                <BrainCircuit className="w-12 h-12 text-primary mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-xl font-bold text-white mb-3">Continuous Learning</h3>
                <p className="text-gray-400">Our models are constantly updated with the latest nutritional science to provide the most accurate assessments.</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
