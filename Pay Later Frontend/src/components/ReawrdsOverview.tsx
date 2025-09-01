import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, Gift, DollarSign, Star, Zap, Trophy, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

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
        setCashBack(currentPoints * 0.0139); // ~1.39 cents per point
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [totalPoints]);

  const pointsThisMonth = 1240;
  const cashBackThisMonth = 28.30;

  return (
    <section className="py-16 bg-gradient-to-b from-background to-secondary/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Your Rewards Dashboard</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-6">
            Track your earnings, redeem points, and discover new ways to maximize your rewards
          </p>
          {user ? (
            <Link to="/rewards">
              <Button variant="hero" size="lg" className="gap-2">
                View Full Rewards Dashboard
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          ) : (
            <Link to="/auth">
              <Button variant="hero" size="lg" className="gap-2">
                Sign In to View Rewards
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {/* Total Points */}
          <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20 relative overflow-hidden">
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
                {totalPoints > 24580 && <Zap className="w-4 h-4 text-yellow-500 animate-pulse" />}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                <span className="text-success">+{pointsThisMonth}</span> this month
              </p>
            </CardContent>
          </Card>

          {/* Cash Back */}
          <Card className="bg-gradient-to-br from-success/5 to-success/10 border-success/20 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-success/5 to-transparent"></div>
            <CardHeader className="pb-2 relative">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Cash Back Value
              </CardTitle>
            </CardHeader>
            <CardContent className="relative">
              <div className="text-2xl font-bold text-success">
                ${cashBack.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                <span className="text-success">+${cashBackThisMonth}</span> this month
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
              </div>
                {totalPoints >= 50000 ? "Gold" : totalPoints >= 25000 ? "Silver" : "Bronze"}
              <p className="text-xs text-muted-foreground mt-1">
                {totalPoints < 25000 && `${(25000 - totalPoints).toLocaleString()} to Silver`}
                {totalPoints >= 25000 && totalPoints < 50000 && `${(50000 - totalPoints).toLocaleString()} to Gold`}
                {totalPoints >= 50000 && "Maximum tier reached!"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Real-time Points Activity */}
        <Card className="mb-8 bg-gradient-to-r from-primary/5 via-transparent to-success/5 border-primary/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Zap className="w-5 h-5 text-primary" />
                Points Activity
              </CardTitle>
              <Badge className="bg-primary text-primary-foreground animate-pulse">Live</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              Earn points by adding and paying bills. Points are calculated based on bill amount and category:
            </div>
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
                <Badge className={totalPoints >= 15000 ? "bg-success text-success-foreground" : "bg-muted text-muted-foreground"}>
                  {totalPoints >= 15000 ? "Available" : "Locked"}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-soft transition-all duration-300">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Cash Back Bonus</CardTitle>
                <Badge className="bg-success text-success-foreground">Available</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Convert your points to cash back with no minimum redemption
              </p>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">10,000 points = $100</span>
                <Badge className="bg-success text-success-foreground">Ready</Badge>
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
                <Badge className="bg-success text-success-foreground">Available</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default RewardsOverview;