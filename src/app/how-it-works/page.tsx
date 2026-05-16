import { Camera, ScanLine, BrainCircuit, Activity, CheckCircle, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HowItWorksPage() {
  const steps = [
    {
      id: 1,
      Icon: Camera,
      title: "Capture the Label",
      description: "Take a clear photo of the nutritional facts and ingredients list on any packaged food."
    },
    {
      id: 2,
      Icon: ScanLine,
      title: "AI Extraction",
      description: "Our vision model precisely extracts all text, categorizing macros, vitamins, and individual ingredients."
    },
    {
      id: 3,
      Icon: BrainCircuit,
      title: "Profile Matching",
      description: "The extracted data is cross-referenced with your personal health profile and dietary restrictions."
    },
    {
      id: 4,
      Icon: Activity,
      title: "Deep Analysis",
      description: "Our reasoning engine evaluates the health impact of specific additives and nutritional ratios."
    },
    {
      id: 5,
      Icon: CheckCircle,
      title: "Actionable Insights",
      description: "Receive a clear verdict, a health score, and detailed warnings to make an informed decision."
    }
  ];

  return (
    <div className="min-h-screen bg-background pt-32 pb-20">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="text-center mb-20">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">How EatInformed Works</h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            From scanning a label to receiving a personalized health verdict, here is how our dual-engine AI pipeline operates.
          </p>
        </div>

        <div className="space-y-12 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-white/20 before:to-transparent">
          {steps.map((step) => (
            <div key={step.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white/50 bg-background text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                <step.Icon className="w-5 h-5 text-primary" />
              </div>
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-card/50 backdrop-blur-sm border border-border/30 p-6 rounded-2xl hover:border-primary/50 transition-colors">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-sm font-bold text-primary">Step {step.id}</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{step.title}</h3>
                <p className="text-gray-400">{step.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-20 text-center">
          <Link href="/check">
             <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground group">
                Try It Yourself
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
             </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
