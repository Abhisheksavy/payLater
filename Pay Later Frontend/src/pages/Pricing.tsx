import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/Header";
import KycModal from "@/components/KycModal";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { Check, Star, Zap, Crown, Gift } from "lucide-react";

const Pricing = () => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [showKycModal, setShowKycModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string>('');
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const plans = [
    {
      name: "Basic",
      description: "Perfect for getting started with bill management",
      monthlyPrice: 0,
      yearlyPrice: 0,
      icon: Star,
      features: [
        "Track up to 5 bills",
        "Basic reminders",
        "Earn 1 point per $1 spent",
        "Email support",
        "Mobile app access"
      ],
      popular: false,
      cta: "Get Started Free"
    },
    {
      name: "Pro",
      description: "Ideal for active bill payers who want more rewards",
      monthlyPrice: 9.99,
      yearlyPrice: 99.99,
      icon: Zap,
      features: [
        "Unlimited bill tracking",
        "Smart notifications",
        "Earn 2 points per $1 spent",
        "Priority support",
        "Advanced analytics",
        "Custom categories",
        "Auto-pay setup assistance"
      ],
      popular: true,
      cta: "Start Pro Trial"
    },
    {
      name: "Premium",
      description: "Maximum rewards and features for power users",
      monthlyPrice: 19.99,
      yearlyPrice: 199.99,
      icon: Crown,
      features: [
        "Everything in Pro",
        "Earn 3 points per $1 spent",
        "Exclusive premium rewards",
        "Personal account manager",
        "Custom integrations",
        "Advanced reporting",
        "Early access to new features",
        "Cashback bonuses"
      ],
      popular: false,
      cta: "Go Premium"
    }
  ];

  const getPrice = (plan: typeof plans[0]) => {
    return billingCycle === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice;
  };

  const getSavings = (plan: typeof plans[0]) => {
    if (plan.monthlyPrice === 0) return null;
    const monthlyCost = plan.monthlyPrice * 12;
    const yearlyCost = plan.yearlyPrice;
    const savings = monthlyCost - yearlyCost;
    return savings;
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
    <div className="min-h-screen bg-background">
      <Header />
      <main className="py-16">
        <div className="container mx-auto px-4">
          {/* Header Section */}
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
              Choose Your Plan
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Unlock more rewards, features, and benefits as you level up your bill paying experience
            </p>
            
            {/* Billing Toggle */}
            <div className="inline-flex items-center bg-muted p-1 rounded-lg mb-12">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-6 py-2 rounded-md transition-all ${
                  billingCycle === 'monthly'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                className={`px-6 py-2 rounded-md transition-all ${
                  billingCycle === 'yearly'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground'
                }`}
              >
                Yearly
                <Badge variant="secondary" className="ml-2 text-xs">Save 20%</Badge>
              </button>
            </div>
          </div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {plans.map((plan) => {
              const Icon = plan.icon;
              const price = getPrice(plan);
              const savings = getSavings(plan);
              
              return (
                <Card 
                  key={plan.name} 
                  className={`relative ${
                    plan.popular 
                      ? 'border-primary shadow-lg ring-1 ring-primary/20' 
                      : ''
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-primary text-primary-foreground px-4 py-1">
                        Most Popular
                      </Badge>
                    </div>
                  )}
                  
                  <CardHeader className="text-center pb-6">
                    <div className="flex justify-center mb-4">
                      <div className="p-3 rounded-full bg-primary/10">
                        <Icon className="w-6 h-6 text-primary" />
                      </div>
                    </div>
                    <CardTitle className="text-2xl">{plan.name}</CardTitle>
                    <CardDescription className="text-base">
                      {plan.description}
                    </CardDescription>
                    <div className="pt-4">
                      <div className="flex items-baseline justify-center">
                        <span className="text-4xl font-bold">
                          ${price}
                        </span>
                        {price > 0 && (
                          <span className="text-muted-foreground ml-2">
                            /{billingCycle === 'monthly' ? 'month' : 'year'}
                          </span>
                        )}
                      </div>
                      {billingCycle === 'yearly' && savings && (
                        <p className="text-sm text-primary mt-1">
                          Save ${savings} per year
                        </p>
                      )}
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-6">
                    <ul className="space-y-3">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-center gap-3">
                          <Check className="w-4 h-4 text-primary flex-shrink-0" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    
                    <Button 
                      className="w-full" 
                      variant={plan.popular ? "default" : "outline"}
                      size="lg"
                      onClick={() => handlePlanSelect(plan.name)}
                    >
                      {plan.cta}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Additional Benefits */}
          <div className="text-center bg-muted/50 rounded-lg p-8">
            <Gift className="w-12 h-12 text-primary mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-4">All Plans Include</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
              <div>
                <h4 className="font-semibold mb-2">Secure & Private</h4>
                <p className="text-muted-foreground">Bank-level encryption and privacy protection</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">24/7 Access</h4>
                <p className="text-muted-foreground">Manage your bills anytime, anywhere</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">No Hidden Fees</h4>
                <p className="text-muted-foreground">Transparent pricing with no surprises</p>
              </div>
            </div>
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