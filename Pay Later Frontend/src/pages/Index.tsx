import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import RewardsOverview from "@/components/ReawrdsOverview";

import BillTypesSection from "@/components/BillTypesSection";
import FAQSection from "@/components/FAQSection";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        <RewardsOverview />
        <BillTypesSection />
        <FAQSection />
      </main>
    </div>
  );
};

export default Index;
