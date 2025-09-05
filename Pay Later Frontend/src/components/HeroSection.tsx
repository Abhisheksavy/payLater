import { Button } from "@/components/ui/button";
import { ArrowRight, Star, TrendingUp } from "lucide-react";
import heroImage from "@/assets/hero-bills-rewards.jpg";

const HeroSection = () => {
  return (
    <section className="relative min-h-[60vh] flex items-center justify-center pt-16 mb-20">
      {/* Background Pattern */}
      <div className="absolute"></div>

      <div className="container mx-auto px-4 flex items-center justify-center relative z-10">
        {/* Content */}
        <div className="space-y-8 text-center max-w-3xl">
          <div className="space-y-4">
            <h1 className="text-6xl lg:text-7xl xl:text-9xl font-bold leading-tight text-center">
  <span className="whitespace-nowrap">Earn Rewards</span>{" "}
  <span className="whitespace-nowrap">On</span><span className="text-primary"> Every Bill</span>
</h1>

            <p className="font-inter font-light text-lg lg:text-xl xl:text-2xl leading-[150%] tracking-normal text-center align-middle">
              Turn your monthly expenses into rewards. Get points, cashback, and exclusive perks
              for paying rent, utilities, and everyday bills.
            </p>
          </div>

          <div className="flex gap-4 justify-center">
            <Button variant="custom" className="gap-4 h-[71px]">
              <span className="text-xl">
                Get Started
              </span>
            </Button>
          </div>

        </div>
      </div>
    </section>
  );
};

export default HeroSection;
