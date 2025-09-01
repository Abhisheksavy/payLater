import { Button } from "@/components/ui/button";
import { ArrowRight, Star, TrendingUp } from "lucide-react";
import heroImage from "@/assets/hero-bills-rewards.jpg";

const HeroSection = () => {
  return (
    <section className="relative min-h-[60vh] flex items-center justify-center bg-gradient-to-br from-background via-secondary/30 to-accent/20 overflow-hidden pt-16">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-subtle opacity-50"></div>
      
      <div className="container mx-auto px-4 flex items-center justify-center relative z-10">
        {/* Content */}
        <div className="space-y-8 text-center max-w-4xl">
          <div className="space-y-4">
            <h1 className="text-6xl lg:text-7xl xl:text-8xl font-bold leading-tight">
              Earn rewards on{" "}
              <span className="bg-gradient-to-r from-primary via-primary-glow to-success bg-clip-text text-transparent">
                every bill
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Turn your monthly expenses into rewards. Get points, cashback, and exclusive perks 
              for paying rent, utilities, and everyday bills.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="hero" size="lg" className="gap-2">
              Get Started Free
              <ArrowRight className="w-5 h-5" />
            </Button>
            <Button variant="outline" size="lg" className="gap-2">
              <TrendingUp className="w-5 h-5" />
              View Rewards
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 pt-8 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">$2.4M+</div>
              <div className="text-sm text-muted-foreground">Rewards Earned</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">500K+</div>
              <div className="text-sm text-muted-foreground">Bills Paid</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">2.5%</div>
              <div className="text-sm text-muted-foreground">Avg. Cashback</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;