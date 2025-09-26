import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, Gift, DollarSign, Star, Zap, Trophy, ArrowRight, HouseIcon, Shield, SubscriptIcon, VideoIcon, Youtube, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/lib/axios";

interface DashboardSummary {
  totalPoints: number;
  cashBack: number;
  activeBills: number;
  totalBills: number;
  monthlyPoints: number;
}

const RewardsDashboardOverview = () => {
  const { user } = useAuth();

  const {
    data: dashboardData,
    isLoading,
    error,
    refetch
  } = useQuery<DashboardSummary>({
    queryKey: ['dashboardSummary'],
    queryFn: async () => {
      const response = await api.post('/user/dashboardSummary');
      return response.data;
    },
    enabled: !!user,
    refetchInterval: 30000,
    staleTime: 10000,
  });

  const totalPoints = dashboardData?.totalPoints || 0;
  const monthlyPoints = dashboardData?.monthlyPoints || 0;
  const activeBills = dashboardData?.activeBills || 0;
  const totalBills = dashboardData?.totalBills || 0;

  const pointsThisMonth = monthlyPoints;
  
  if (isLoading && user) {
    return (
      <section className="py-16 bg-gradient-to-b from-background to-secondary/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-inter text-[#21222C] font-semibold text-4xl leading-[36px] tracking-normal text-center align-middle">Your Rewards Dashboard</h2>
            <p className="text-muted-foreground mx-auto font-light mb-4 mt-3 text-base leading-6 text-center align-middle">
              Track your earnings, redeem points, and discover new ways to maximize your rewards
            </p>
          </div>
          <div className="flex justify-center items-center min-h-[300px]">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        </div>
      </section>
    );
  }

  if (error && user) {
    return (
      <section className="py-16 bg-gradient-to-b from-background to-secondary/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-inter text-[#21222C] font-semibold text-4xl leading-[36px] tracking-normal text-center align-middle">Your Rewards Dashboard</h2>
            <p className="text-muted-foreground mx-auto font-light mb-4 mt-3 text-base leading-6 text-center align-middle">
              Track your earnings, redeem points, and discover new ways to maximize your rewards
            </p>
          </div>
          <div className="flex flex-col justify-center items-center min-h-[300px] gap-4">
            <p className="text-destructive">Failed to load dashboard data</p>
            <Button onClick={() => refetch()} variant="outline">
              Try Again
            </Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gradient-to-b from-background to-secondary/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="font-inter text-[#21222C] font-semibold text-4xl leading-[36px] tracking-normal text-center align-middle">Your Rewards Dashboard</h2>
          <p className="text-muted-foreground mx-auto font-light mb-4 mt-3 text-base leading-6 text-center align-middle">
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {/* Total Points */}
          <Card className="relative overflow-hidden hover:shadow-soft transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent"></div>
            <CardHeader className="pb-2 relative">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Star className="w-4 h-4" />
                Total Points
              </CardTitle>
            </CardHeader>
            <CardContent className="relative">
              <div className="text-2xl font-bold text-primary flex items-center gap-2">
                {totalPoints.toLocaleString()}
                {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                <span className="text-primary">+{pointsThisMonth.toLocaleString()}</span> this month
              </p>
            </CardContent>
          </Card>

          {/* Cash Back */}
          <Card className="relative overflow-hidden hover:shadow-soft transition-all duration-300">
            <div className="absolute inset-0"></div>
            <CardHeader className="pb-2 relative">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Cash Back Value
              </CardTitle>
            </CardHeader>
            <CardContent className="relative">
              <div className="text-2xl font-bold text-primary">
                ${ (totalPoints / 100).toFixed(2) }
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                <span className="text-primary">+${ (monthlyPoints / 100).toFixed(2) }</span> this month
              </p>
            </CardContent>
          </Card>

          {/* This Month */}
          <Card className="hover:shadow-soft transition-all duration-300">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                This Month
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{monthlyPoints.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Points earned
              </p>
            </CardContent>
          </Card>

          {/* Reward Tier */}
          <Card className="hover:shadow-soft transition-all duration-300">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Trophy className="w-4 h-4" />
                Tier Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold text-primary">
                {totalPoints >= 5000 ? "Gold" : totalPoints >= 2000 ? "Silver" : "Bronze"}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {totalPoints < 2000 && `${(2000 - totalPoints).toLocaleString()} to Silver`}
                {totalPoints >= 2000 && totalPoints < 5000 && `${(5000 - totalPoints).toLocaleString()} to Gold`}
                {totalPoints >= 5000 && "Maximum tier reached!"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Real-time Points Activity */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Zap className="w-5 h-5 text-primary" />
                Points Activity
              </CardTitle>
              <Badge className="bg-primary text-primary-foreground flex items-center gap-1">
                {isLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
                Live
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground font-normal mb-2">
              Earn points by adding and paying bills. Points are calculated based on bill amount and category:
            </div>
            {user && (
              <div className="text-xs text-muted-foreground mb-3">
                Active Bills: <span className="text-primary font-medium">{activeBills}</span> | 
                Total Bills: <span className="text-primary font-medium">{totalBills}</span>
              </div>
            )}
            <div className="mt-3 grid grid-cols-2 md:grid-cols-5 gap-2 text-xs">
              <div className="p-2 bg-background rounded border">
                <div className="font-medium">Housing</div>
                <div className="text-primary">3x points</div>
              </div>
              <div className="p-2 bg-background rounded border">
                <div className="font-medium">Utilities</div>
                <div className="text-primary">2.5x points</div>
              </div>
              <div className="p-2 bg-background rounded border">
                <div className="font-medium">Insurance</div>
                <div className="text-primary">2x points</div>
              </div>
              <div className="p-2 bg-background rounded border">
                <div className="font-medium">Subscriptions</div>
                <div className="text-primary">1.5x points</div>
              </div>
              <div className="p-2 bg-background rounded border">
                <div className="font-medium">Other</div>
                <div className="text-primary">1x points</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Featured Rewards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="group hover:shadow-soft transition-all duration-300">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Travel Rewards</CardTitle>
                <Badge variant="secondary">Popular</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Earn 3x points on travel bookings and get exclusive hotel discounts
              </p>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">15,000 points</span>
                <Badge className={totalPoints >= 15000 ? "default" : "locked"}>
                  {totalPoints >= 15000 ? "Available" : "Locked"}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-soft transition-all duration-300">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Cash Back Bonus</CardTitle>
                <Badge className="default">Available</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Convert your points to cash back with no minimum redemption
              </p>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">10,000 points = $100</span>
                <Badge className="default">Ready</Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-soft transition-all duration-300">
            <CardHeader>
              <CardTitle className="text-lg">Gift Cards</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Redeem points for gift cards from your favorite brands
              </p>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">From 5,000 points</span>
                <Badge className="default">Available</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default RewardsDashboardOverview;
