import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import RewardsOverview from "@/components/ReawrdsOverview";

import BillTypesSection from "@/components/BillTypesSection";
import FAQSection from "@/components/FAQSection";
import Footer from "@/components/ui/footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>
        <HeroSection />
        <RewardsOverview />
        <BillTypesSection />
        <FAQSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
