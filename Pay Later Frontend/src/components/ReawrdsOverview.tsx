import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, Gift, DollarSign, Star, Zap, Trophy, ArrowRight, HouseIcon, Shield, SubscriptIcon, VideoIcon, Youtube } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { FaYoutube } from "react-icons/fa";

const RewardsOverview = () => {
  const { user } = useAuth();
  const [totalPoints, setTotalPoints] = useState(24580);
  const [monthlyPoints, setMonthlyPoints] = useState(1850);
  const [cashBack, setCashBack] = useState(342.50);

  useEffect(() => {
    // Load points from localStorage
    const savedPoints = localStorage.getItem('totalPoints');
    if (savedPoints) {
      setTotalPoints(parseInt(savedPoints));
    }

    // Simulate real-time updates
    const interval = setInterval(() => {
      const currentPoints = parseInt(localStorage.getItem('totalPoints') || '24580');
      if (currentPoints !== totalPoints) {
        setTotalPoints(currentPoints);
        setCashBack(currentPoints * 0.0139);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [totalPoints]);

  const pointsThisMonth = 1240;
  const cashBackThisMonth = 28.30;

  return (
    <section className="py-16 bg-[linear-gradient(180deg,#F7F7F8_0%,rgba(231,240,253,0.3)_100%)]">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="font-inter text-[#21222C] font-semibold text-4xl leading-[36px] tracking-normal text-center align-middle">Your Rewards Dashboard</h2>
          <p className="text-muted-foreground mx-auto font-light mb-4 mt-3 text-2xl">
            Track your earnings, redeem points, and discover new ways to maximize your rewards
          </p>

          {user ? (
            <Link to="/rewards">
              <Button variant="customBlue" size="lg" className="gap-2">
                View Full Rewards Dashboard
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          ) : (
            <Link to="/auth">
              <Button variant="customBlue" size="lg" className="gap-2">
                Sign In to View Rewards
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {/* Total Points */}
          <Card
            className="relative -top-1 gap-4 
             opacity-100 pr-[0.8px] pb-[0.8px] pl-[0.8px] 
             rounded-[12px] border border-[#6161FF] bg-white 
             shadow-[0px_1px_2px_0px_#0000000D] overflow-hidden"
          >
            <CardHeader className="pb-2 relative">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Star className="w-4 h-4" />
                Total Points
              </CardTitle>
            </CardHeader>
            <CardContent className="relative">
              <div className="text-2xl font-bold text-primary flex items-center gap-2">
                {totalPoints.toLocaleString()}
                {totalPoints > 24580 && (
                  <Zap className="w-4 h-4 text-yellow-500 animate-pulse" />
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                <span className="text-success">+{pointsThisMonth}</span> this month
              </p>
            </CardContent>
          </Card>

          {/* Cash Back */}
          <Card
            className="relative -top-1 gap-4 
             opacity-100 pr-[0.8px] pb-[0.8px] pl-[0.8px] 
             rounded-[12px] border border-[#6161FF] bg-white 
             shadow-[0px_1px_2px_0px_#0000000D] overflow-hidden"
          >
            <CardHeader className="pb-2 relative">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Cash Back Value
              </CardTitle>
            </CardHeader>
            <CardContent className="relative">
              <div className="text-2xl text-primary font-bold">
                ${cashBack.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">
                <span className="text-success">+${cashBackThisMonth}</span> this month
              </p>
            </CardContent>
          </Card>

          {/* This Month */}
          <Card
            className="relative -top-1 gap-4 
             opacity-100 pr-[0.8px] pb-[0.8px] pl-[0.8px] 
             rounded-[12px] border border-[#6161FF] bg-white 
             shadow-[0px_1px_2px_0px_#0000000D] overflow-hidden"
          >
            <CardHeader className="pb-2 relative">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                This Month
              </CardTitle>
            </CardHeader>
            <CardContent className="relative">
              <div className="text-2xl font-bold text-primary">{monthlyPoints.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Points earned</p>
            </CardContent>
          </Card>

          {/* Reward Tier */}
          <Card
            className="relative -top-1 gap-4 
             opacity-100 pr-[0.8px] pb-[0.8px] pl-[0.8px] 
             rounded-[12px] border border-[#6161FF] bg-white 
             shadow-[0px_1px_2px_0px_#0000000D] overflow-hidden"
          >
            <CardHeader className="pb-2 relative">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Trophy className="w-4 h-4" />
                Tier Status
              </CardTitle>
            </CardHeader>
            <CardContent className="relative">
              <div className="text-2xl font-bold text-primary">
                {totalPoints >= 50000
                  ? "Gold"
                  : totalPoints >= 25000
                    ? "Silver"
                    : "Bronze"}
              </div>
              <p className="text-xs text-muted-foreground">
                {totalPoints < 25000 &&
                  `${(25000 - totalPoints).toLocaleString()} to Silver`}
                {totalPoints >= 25000 &&
                  totalPoints < 50000 &&
                  `${(50000 - totalPoints).toLocaleString()} to Gold`}
                {totalPoints >= 50000 && "Maximum tier reached!"}
              </p>
            </CardContent>
          </Card>

        </div>

        {/* Real-time Points Activity */}
        <Card
          className="gap-6 
             opacity-100 pr-[0.8px] pb-[0.8px] pl-[0.8px] 
             rounded-[12px] border border-[#6161FF] bg-white 
             shadow-[0px_1px_2px_0px_#0000000D] overflow-hidden mb-8"
        >
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Zap className="w-5 h-5 text-primary" />
                Points Activity
              </CardTitle>
              <Badge className="bg-primary text-primary-foreground">
                Live
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-md text-muted-foreground mb-6">
              Earn points by adding and paying bills. Points are calculated based on bill amount and category:
            </div>
            <div className="mt-3 grid grid-cols-1 lg:grid-cols-5 gap-2 text-xs">
              <div className="p-2 bg-background rounded border flex flex-col gap-2 justify-around">
                <div className="flex items-center justify-between mb-3">
                  <CardTitle className="flex items-center gap-2">
                    <div className="w-7 h-7 bg-accent rounded-full opacity-100 flex items-center justify-center">
                      <HouseIcon className="w-5 h-5 text-success opacity-100" />
                    </div>
                    <span className="font-inter font-medium text-lg leading-4">
                      Housing
                    </span>
                  </CardTitle>

                  <span className="font-inter font-smiebold text-xs py-1 px-2 leading-4 bg-secondary text-secondary-foreground rounded-full">
                    Popular
                  </span>
                </div>

                <div className="font-inter text-primary font-normal text-xl leading-4">3x points</div>
                <div className="font-inter font-light text-lg leading-5 text-muted-foreground">Earn 3x rewards on housing bills</div>
              </div>

              <div className="p-2 bg-background rounded border flex flex-col gap-2 justify-around">
                <div className="flex items-center justify-between mb-3">
                  <CardTitle className="flex items-center gap-2">
                    <div className="w-7 h-7 bg-yellow-500/10 rounded-full opacity-100 flex items-center justify-center">
                      <Zap className="w-5 h-5 text-yellow-500 opacity-100" />
                    </div>
                    <span className="font-inter font-semibold text-lg leading-4">
                      Utilities
                    </span>
                  </CardTitle>
                </div>

                <div className="font-inter text-primary font-normal text-xl leading-4">
                  2.5x points
                </div>
                <div className="font-inter font-light text-lg leading-5 text-muted-foreground">
                  Earn 2.5x rewards on utilities bills
                </div>
              </div>

              {/* Insurance */}
              <div className="p-2 bg-background rounded border flex flex-col gap-2 justify-around">
                <div className="flex items-center justify-between mb-3">
                  <CardTitle className="flex items-center gap-2">
                    <div className="w-7 h-7 bg-blue-500/10 rounded-full flex items-center justify-center">
                      <Shield className="w-5 h-5 text-blue-500 opacity-100" />
                    </div>
                    <span className="font-inter font-semibold text-lg leading-4">
                      Insurance
                    </span>
                  </CardTitle>
                </div>

                <div className="font-inter text-primary font-normal text-xl leading-4">
                  2x points
                </div>
                <div className="font-inter font-light text-lg leading-5 text-muted-foreground">
                  Earn 2x rewards on insurance payments
                </div>
              </div>

              {/* Subscriptions */}
              <div className="p-2 bg-background rounded border flex flex-col gap-2 justify-around">
                <div className="flex items-center justify-between mb-3">
                  <CardTitle className="flex items-center gap-2">
                    <div className="w-7 h-7 bg-green-500/10 rounded-full opacity-100 flex items-center justify-center">
                      <FaYoutube className="w-5 h-5 text-success opacity-100" />
                    </div>
                    <span className="font-inter font-semibold text-lg leading-4">
                      Subscriptions
                    </span>
                  </CardTitle>
                </div>

                <div className="font-inter text-primary font-normal text-xl leading-4">
                  1.5x points
                </div>
                <div className="font-inter font-light text-lg leading-5 text-muted-foreground">
                  Earn 1.5x rewards on subscriptions
                </div>
              </div>

              {/* Other */}
              <div className="p-2 bg-background rounded border flex flex-col gap-2 justify-around">
                <div className="flex items-center justify-between mb-3">
                  <CardTitle className="flex items-center gap-2">
                    <div className="w-7 h-7 bg-red-500/10 rounded-full opacity-100 flex items-center justify-center">
                      <DollarSign className="w-5 h-5 text-red-500 opacity-100" />
                    </div>
                    <span className="font-inter font-semibold text-lg leading-4">
                      Other
                    </span>
                  </CardTitle>
                </div>

                <div className="font-inter text-primary font-normal text-xl leading-4">
                  1x points
                </div>
                <div className="font-inter font-light text-lg leading-5 text-muted-foreground">
                  Earn 1x rewards on other categories
                </div>
              </div>

            </div>
          </CardContent>
        </Card>

      </div>
    </section>
  );
};

export default RewardsOverview;
