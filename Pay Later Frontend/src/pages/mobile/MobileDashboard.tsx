import { useState, useEffect } from "react";
import { MobileLayout } from "@/components/mobile/MobileLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  DollarSign, 
  Receipt, 
  Gift, 
  TrendingUp, 
  Bell, 
  Plus,
  Calendar,
  Scan
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface UserStats {
  totalPoints: number;
  totalBills: number;
  monthlyPoints: number;
  pendingBills: number;
}

export default function MobileDashboard() {
  const { user } = useAuth();
  const [userStats, setUserStats] = useState<UserStats>({
    totalPoints: 0,
    totalBills: 0,
    monthlyPoints: 0,
    pendingBills: 0,
  });

  useEffect(() => {
    const savedStats = localStorage.getItem(`userStats_${user?.id}`);
    if (savedStats) {
      setUserStats(JSON.parse(savedStats));
    } else {
      const defaultStats = {
        totalPoints: 1250,
        totalBills: 12,
        monthlyPoints: 185,
        pendingBills: 3,
      };
      setUserStats(defaultStats);
      localStorage.setItem(`userStats_${user?.id}`, JSON.stringify(defaultStats));
    }
  }, [user]);

  const getTierInfo = (points: number) => {
    if (points >= 5000) return { tier: "Platinum", next: null, progress: 100, color: "bg-purple-500" };
    if (points >= 2500) return { tier: "Gold", next: 5000, progress: ((points - 2500) / 2500) * 100, color: "bg-yellow-500" };
    if (points >= 1000) return { tier: "Silver", next: 2500, progress: ((points - 1000) / 1500) * 100, color: "bg-gray-400" };
    return { tier: "Bronze", next: 1000, progress: (points / 1000) * 100, color: "bg-orange-600" };
  };

  const tierInfo = getTierInfo(userStats.totalPoints);
  const cashBack = (userStats.totalPoints * 0.01).toFixed(2);

  const quickActions = [
    { icon: Plus, label: "Add Bill", color: "text-primary" },
    { icon: Scan, label: "Scan Receipt", color: "text-success" },
    { icon: Bell, label: "Reminders", color: "text-orange-500" },
    { icon: Gift, label: "Redeem", color: "text-purple-500" },
  ];

  return (
    <MobileLayout title="Dashboard">
      <div className="p-4 space-y-6">
        {/* Welcome Section */}
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-foreground">
            Welcome back, {user?.name?.split(' ')[0]}!
          </h2>
          <p className="text-muted-foreground">
            Keep earning rewards with every bill payment
          </p>
        </div>

        {/* Points Overview Card */}
        <Card className="bg-gradient-to-br from-primary/10 to-primary-glow/5 border-primary/20">
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <div>
                <div className="text-3xl font-bold text-primary">
                  {userStats.totalPoints.toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">Total Points</div>
              </div>
              
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Cash Value</span>
                <span className="font-semibold text-success">${cashBack}</span>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">{tierInfo.tier} Member</span>
                  {tierInfo.next && (
                    <span className="text-muted-foreground">
                      {tierInfo.next - userStats.totalPoints} to {
                        tierInfo.next === 1000 ? "Silver" :
                        tierInfo.next === 2500 ? "Gold" : "Platinum"
                      }
                    </span>
                  )}
                </div>
                <Progress value={tierInfo.progress} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <Card>
            <CardContent className="p-4 text-center">
              <Receipt className="w-6 h-6 text-primary mx-auto mb-2" />
              <div className="text-lg font-semibold">{userStats.totalBills}</div>
              <div className="text-xs text-muted-foreground">Total Bills</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <TrendingUp className="w-6 h-6 text-success mx-auto mb-2" />
              <div className="text-lg font-semibold">+{userStats.monthlyPoints}</div>
              <div className="text-xs text-muted-foreground">This Month</div>
            </CardContent>
          </Card>
        </div>

        {/* Pending Bills Alert */}
        {userStats.pendingBills > 0 && (
          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-orange-500" />
                <div className="flex-1">
                  <div className="font-medium text-orange-900">
                    {userStats.pendingBills} bills due soon
                  </div>
                  <div className="text-sm text-orange-700">
                    Don't miss out on reward points!
                  </div>
                </div>
                <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                  {userStats.pendingBills}
                </Badge>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map((action, index) => (
              <Button
                key={index}
                variant="outline"
                className="h-16 flex-col gap-2 bg-card hover:bg-muted/50"
              >
                <action.icon className={`w-5 h-5 ${action.color}`} />
                <span className="text-sm">{action.label}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Recent Activity Preview */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-success/10 flex items-center justify-center">
                  <DollarSign className="w-4 h-4 text-success" />
                </div>
                <div>
                  <div className="font-medium text-sm">Electric Bill Paid</div>
                  <div className="text-xs text-muted-foreground">2 hours ago</div>
                </div>
              </div>
              <Badge className="bg-success/10 text-success border-success/20">
                +25 pts
              </Badge>
            </div>
            
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Gift className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <div className="font-medium text-sm">Bonus Points</div>
                  <div className="text-xs text-muted-foreground">Yesterday</div>
                </div>
              </div>
              <Badge className="bg-primary/10 text-primary border-primary/20">
                +50 pts
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </MobileLayout>
  );
}