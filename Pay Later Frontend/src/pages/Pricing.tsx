import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/Header";
import KycModal from "@/components/KycModal";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { Check, Star, Zap, Crown, Gift, CheckCircle, CheckCircle2 } from "lucide-react";

const Pricing = () => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [showKycModal, setShowKycModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string>('');
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const plans = [
    {
      name: "Pro (Most Popular)",
      description: "Advanced features for serious financial management",
      monthlyPrice: 9.99,
      yearlyPrice: 95.90,
      features: [
        "Pay all everyday bills (rent, car, phone, internet, insurance, utilities).",
        "Earn cash back on every bill paid.",
        "Flexible due date scheduling & payment options.",
        "Instant payment confirmation with digital receipts.",
        "Smart bill reminders and alerts.",
        "Priority customer support.",
        "Monthly spending insights and detailed reports.",
        "Access to installment and split payment options."
      ],
      popular: true
    },
    {
      name: "Family Plan",
      description: "Share financial management with your family",
      monthlyPrice: 19.99,
      yearlyPrice: 191.90,
      features: [
        "Pay all your everyday bills (rent, car, phone, internet, utilities, insurance).",
        "Earn cashback and reward points on every payment.",
        "Flexible scheduling — pay on or before the due date.",
        "Instant payment confirmation and digital receipts.",
        "Smart reminders so you never miss a bill.",
        "Access to installment and “split payment” options.",
        "Monthly insights and spending reports.",
        "Priority customer support (Pro & Premium)."
      ],
      popular: false
    }
  ];

  const getPrice = (plan: typeof plans[0]) => {
    return billingCycle === 'monthly' ? parseFloat(plan.monthlyPrice.toFixed(2)) : parseFloat(plan.yearlyPrice.toFixed(2));
  };

  const getSavings = (plan: typeof plans[0]) => {
    if (plan.monthlyPrice === 0) return null;
    const monthlyCost = plan.monthlyPrice * 12;
    const yearlyCost = plan.yearlyPrice;
    const savings = monthlyCost - yearlyCost;
    const rounded = savings.toFixed(2)
    return rounded;
  };

  const handlePlanSelect = (planName: string) => {
    if (!isAuthenticated) {
      toast({
        title: "Sign In Required",
        description: "Please sign in to select a plan",
        variant: "destructive"
      });
      navigate('/auth');
      return;
    }

    if (planName === 'Basic') {
      // For free plan, just set subscription without KYC
      if (user) {
        localStorage.setItem(`bilt_subscription_${user.id}`, JSON.stringify({
          plan: planName,
          status: 'active',
          startDate: new Date().toISOString()
        }));
      }
      toast({
        title: "Plan Activated!",
        description: "You're now on the Basic plan",
      });
      navigate('/dashboard');
    } else {
      // For paid plans, start KYC process
      setSelectedPlan(planName);
      setShowKycModal(true);
    }
  };

  const handleKycComplete = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="py-16">
        <div className="container mx-auto px-4">
          {/* Header Section */}
          <div className="text-center mb-16 ">
            {/* Billing Toggle */}
            <div className="inline-flex items-center bg-muted p-1 rounded-lg mb-12 text-sm">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-6 py-2 rounded-sm transition-all font-medium leading-[115%] ${billingCycle === 'monthly'
                  ? 'bg-white text-foreground shadow-sm'
                  : 'text-[#170F49]'
                  }`}
              >
                Monthly billing
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                className={`px-6 py-1 rounded-md transition-all font-medium leading-[115%] ${billingCycle === 'yearly'
                  ? 'bg-white text-foreground shadow-sm'
                  : 'text-muted-foreground'
                  }`}
              >
                Annually billing
                <Badge variant="custom" className="ml-2 text-xs">Save 20%</Badge>
              </button>
            </div>
          </div>

          {/* Pricing Cards */}
          <div className="flex md:flex-row flex-col w-full justify-center items-center md:items-start gap-10">
            {plans.map((plan) => {
              const price = getPrice(plan);
              const savings = getSavings(plan);

              return (
                <Card
                  key={plan.name}
                  className="relative w-[370px] h-fit rounded-[32px] shadow-[0_2px_15px_0_rgba(25,33,61,0.1)]"
                >
                  <CardHeader
                    className={`
                    text-center
                    pb-6
                    px-10
                    ${plan.popular ? "rounded-[32px] bg-[linear-gradient(175.23deg,#F1F0FB_-80.34%,#FFFFFF_94.86%)]" : ""}
                    `}
                  >
                    <CardTitle
                      className="
                        text-center
                        font-medium
                        text-2xl
                        leading-[115%]
                        tracking-normal
                        font-[var(--font-primary)]
                        "
                    >
                      {plan.name}
                    </CardTitle>

                    <div className="pt-4">
                      <div className="flex">
                        <span
                          className="
                          text-center
                          font-bold
                          text-5xl
                          leading-[115%]
                          tracking-normal
                          font-[var(--font-primary)]
                          "
                        >
                          ${price}
                        </span>

                        {price > 0 && (
                          <span
                            className="
    ml-2
    flex
    flex-col
    items-start
    justify-end
    mb-2
    font-normal
    text-[#6F6C8F]
    leading-[115%]
    text-sm
  "
                          >
                            <p>per</p>
                            <p>{billingCycle === 'monthly' ? 'month' : 'year'}</p>
                          </span>

                        )}
                      </div>
                      {billingCycle === 'yearly' && savings && (
                        <p className="text-sm text-primary mt-1">
                          Save ${savings} per year
                        </p>
                      )}
                    </div>
                    <CardDescription
                      className="
    text-base
    text-start
    font-normal
    leading-[150%]
    tracking-normal
    text-sm
    text-[#514F6E]
  "
                    >
                      {plan.description}
                    </CardDescription>

                  </CardHeader>

                  <CardContent className="space-y-6 border-t border-t-2 px-8">
                    <p className="mt-6 ">
                      What&rsquo;s included:
                      {
                        plan.popular ? null : (
                          <p className="text-sm font-normal leading-[115%] tracking-normal text-[#6F6C8F] mt-2">
                            Everything in Pro Plan, plus:
                          </p>
                        )
                      }
                    </p>

                    <ul className="space-y-3">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-center gap-3 space-y-1">
                          <span className="flex items-center justify-center w-4 h-4 rounded-full bg-primary flex-shrink-0">
                            <Check className="w-3 h-3 text-white" />
                          </span>
                          <span
                            className="
    text-sm
    font-normal
    leading-[115%]
    tracking-normal
    text-[#6F6C8F]
  "
                          >
                            {feature}
                          </span>

                        </li>
                      ))}
                    </ul>

                    <Button
                      className="w-full"
                      variant="customBlue"
                      size="lg"
                      onClick={() => handlePlanSelect(plan.name)}
                    >
                      Subscribe
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>

        </div>
      </main>

      <KycModal
        isOpen={showKycModal}
        onClose={() => setShowKycModal(false)}
        selectedPlan={selectedPlan}
        onComplete={handleKycComplete}
      />
    </div>
  );
};

export default Pricing;
