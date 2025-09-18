import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Header from "@/components/Header";
import AddBillModal from "@/components/AddBillModal";
import BillRemindersModal from "@/components/BillRemindersModal";
import RedeemPointsModal from "@/components/RedeemPointsModal";
import { LinkBankButton } from "@/LinkBankButton";
import { useQuilttSession } from "@/QuilttProviderGate";
import api from "@/lib/axios";
import {
  Trophy,
  CreditCard,
  DollarSign,
  Calendar,
  TrendingUp,
  Star,
  Gift,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  Eye,
  PieChart,
  Target,
  Award,
  BarChart3,
  CalendarDays,
  Zap,
  Unlink,
  Trash2,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Bill {
  id: string;
  name: string;
  company: string;
  amount: number;
  dueDate: string;
  category: string;
  status: "pending" | "paid" | "overdue";
  rewards: number;
}

const Dashboard = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { refreshSession } = useQuilttSession();
  const [bills, setBills] = useState<Bill[]>([]);
  const [totalPoints, setTotalPoints] = useState(0);
  const [monthlyPoints, setMonthlyPoints] = useState(0);
  const [cashBack, setCashBack] = useState(0);

  // Fetch connected banks from Quiltt
  const { data: connectionsData, isLoading: connectionsLoading } = useQuery({
    queryKey: ["userConnections"],
    queryFn: async () => {
      const { data } = await api.get("/quiltt/user-connections");
      return data;
    },
    enabled: !!user,
  });

  // Mutation to disconnect a bank connection
  const disconnectMutation = useMutation({
    mutationFn: async (connectionId: string) => {
      const { data } = await api.delete(`/quiltt/connections/${connectionId}`);
      return data;
    },
    onSuccess: () => {
      // Refresh session to get a fresh token after disconnection
      refreshSession();
      queryClient.invalidateQueries({ queryKey: ["userConnections"] });
      toast({
        title: "Bank Disconnected",
        description: "Your bank connection has been removed successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Disconnection Failed",
        description:
          error.response?.data?.message ||
          "Failed to disconnect bank. Please try again.",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (user) {
      // Load bills
      const savedBills = localStorage.getItem(`bills_${user.id}`);
      if (savedBills) {
        setBills(JSON.parse(savedBills));
      }

      // Load points
      const savedPoints = localStorage.getItem(`points_${user.id}`);
      if (savedPoints) {
        const points = parseInt(savedPoints, 10);
        setTotalPoints(points);
        setCashBack(points * 0.01);
      }

      // Calculate monthly points (simplified calculation)
      const currentMonth = new Date().getMonth();
      const monthlyEarnings = Math.floor(Math.random() * 500) + 100;
      setMonthlyPoints(monthlyEarnings);
    }
  }, [user]);

  const getTierInfo = (points: number) => {
    if (points >= 10000)
      return {
        tier: "Platinum",
        progress: 100,
        nextTier: null,
        pointsNeeded: 0,
      };
    if (points >= 5000)
      return {
        tier: "Gold",
        progress: ((points - 5000) / 5000) * 100,
        nextTier: "Platinum",
        pointsNeeded: 10000 - points,
      };
    if (points >= 2000)
      return {
        tier: "Silver",
        progress: ((points - 2000) / 3000) * 100,
        nextTier: "Gold",
        pointsNeeded: 5000 - points,
      };
    return {
      tier: "Bronze",
      progress: (points / 2000) * 100,
      nextTier: "Silver",
      pointsNeeded: 2000 - points,
    };
  };

  const tierInfo = getTierInfo(totalPoints);
  const upcomingBills = bills
    .filter((bill) => bill.status === "pending")
    .slice(0, 3);
  const recentActivity = bills
    .filter((bill) => bill.status === "paid")
    .slice(0, 3);

  // Additional dashboard data
  const categorySpending = bills.reduce((acc, bill) => {
    if (bill.status === "paid") {
      acc[bill.category] = (acc[bill.category] || 0) + bill.amount;
    }
    return acc;
  }, {} as Record<string, number>);

  const achievements = [
    // { id: 1, title: "First Payment", description: "Made your first bill payment", earned: bills.some(b => b.status === 'paid'), icon: Zap },
    // { id: 2, title: "On Time", description: "Paid 5 bills on time", earned: bills.filter(b => b.status === 'paid').length >= 5, icon: Clock },
    // { id: 3, title: "Point Collector", description: "Earned 1000+ points", earned: totalPoints >= 1000, icon: Trophy },
    // { id: 4, title: "Category Master", description: "Paid bills in 3+ categories", earned: Object.keys(categorySpending).length >= 3, icon: Target }
    {
      id: 1,
      title: "First Payment",
      description: "Made your first bill payment",
      earned: true,
      icon: Zap,
    },
    {
      id: 2,
      title: "On Time",
      description: "Paid 5 bills on time",
      earned: true,
      icon: Clock,
    },
    {
      id: 3,
      title: "Point Collector",
      description: "Earned 1000+ points",
      earned: true,
      icon: Trophy,
    },
    {
      id: 4,
      title: "Category Master",
      description: "Paid bills in 3+ categories",
      earned: true,
      icon: Target,
    },
  ];

  const monthlySpending = bills
    .filter((bill) => bill.status === "paid")
    .reduce((total, bill) => total + bill.amount, 0);

  const upcomingDueDates = bills
    .filter((bill) => bill.status === "pending")
    .sort(
      (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
    )
    .slice(0, 5);

  const handlePayBill = (billId: string) => {
    const updatedBills = bills.map((bill) => {
      if (bill.id === billId) {
        const newPoints = totalPoints + bill.rewards;
        setTotalPoints(newPoints);
        setCashBack(newPoints * 0.01);
        localStorage.setItem(`points_${user?.id}`, newPoints.toString());

        toast({
          title: "Bill Paid!",
          description: `You earned ${bill.rewards} points!`,
        });

        return { ...bill, status: "paid" as const };
      }
      return bill;
    });

    setBills(updatedBills);
    if (user) {
      localStorage.setItem(`bills_${user.id}`, JSON.stringify(updatedBills));
    }
  };

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
      })
    : "Recently";

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="py-8">
        <div className="container mx-auto px-4">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
              Welcome back, {user?.name}!
            </h1>
            <p className="text-muted-foreground">Member since {memberSince}</p>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Points
                </CardTitle>
                <Trophy className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {totalPoints.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  +{monthlyPoints} this month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Cash Value
                </CardTitle>
                <DollarSign className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${cashBack.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">Ready to redeem</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Active Bills
                </CardTitle>
                <CreditCard className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {bills.filter((b) => b.status === "pending").length}
                </div>
                <p className="text-xs text-muted-foreground">
                  {bills.length} total bills
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  This Month
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{monthlyPoints}</div>
                <p className="text-xs text-muted-foreground">Points earned</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-8">
              {/* Membership Tier */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-primary" />
                    Membership Tier
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary" className="text-lg px-4 py-2">
                        {tierInfo.tier} Member
                      </Badge>
                      {tierInfo.nextTier && (
                        <span className="text-sm text-muted-foreground">
                          {tierInfo.pointsNeeded} points to {tierInfo.nextTier}
                        </span>
                      )}
                    </div>
                    {tierInfo.nextTier && (
                      <div className="space-y-2">
                        <Progress value={tierInfo.progress} className="h-2" />
                        <p className="text-xs text-muted-foreground">
                          Progress to {tierInfo.nextTier} tier
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Spending Analytics */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="w-5 h-5 text-primary" />
                    Spending by Category
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {Object.keys(categorySpending).length > 0 ? (
                    <div className="space-y-4">
                      {Object.entries(categorySpending).map(
                        ([category, amount]) => {
                          const percentage = (amount / monthlySpending) * 100;
                          return (
                            <div key={category} className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span className="capitalize">{category}</span>
                                <span className="font-medium">
                                  ${amount.toFixed(2)}
                                </span>
                              </div>
                              <div className="w-full bg-muted rounded-full h-2">
                                <div
                                  className="bg-primary h-2 rounded-full transition-all duration-300"
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                            </div>
                          );
                        }
                      )}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-8">
                      No spending data available
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Upcoming Bills */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-primary" />
                    Upcoming Bills
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {upcomingBills.length > 0 ? (
                    <div className="space-y-4">
                      {upcomingBills.map((bill) => (
                        <div
                          key={bill.id}
                          className="flex items-center justify-between p-4 border rounded-lg"
                        >
                          <div>
                            <h4 className="font-medium">{bill.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {bill.company}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Due: {new Date(bill.dueDate).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">${bill.amount}</p>
                            <p className="text-sm text-primary">
                              +{bill.rewards} points
                            </p>
                            <Button
                              size="sm"
                              onClick={() => handlePayBill(bill.id)}
                              className="mt-2"
                            >
                              Pay Now
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <CheckCircle2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground mb-4">
                        No upcoming bills
                      </p>
                      <AddBillModal>
                        <Button variant="outline" size="sm">
                          <Plus className="w-4 h-4 mr-2" />
                          Add First Bill
                        </Button>
                      </AddBillModal>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Achievements */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-primary" />
                    Achievements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {achievements.map((achievement) => {
                      const Icon = achievement.icon;
                      return (
                        <div
                          key={achievement.id}
                          className={`p-4 rounded-lg border ${
                            achievement.earned
                              ? "bg-primary/5 border-primary/20"
                              : "bg-muted/50 border-muted"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`p-2 rounded-full ${
                                achievement.earned
                                  ? "bg-primary/10"
                                  : "bg-muted"
                              }`}
                            >
                              <Icon
                                className={`w-4 h-4 ${
                                  achievement.earned
                                    ? "text-primary"
                                    : "text-muted-foreground"
                                }`}
                              />
                            </div>
                            <div>
                              <h4
                                className={`font-medium ${
                                  achievement.earned
                                    ? "text-foreground"
                                    : "text-muted-foreground"
                                }`}
                              >
                                {achievement.title}
                              </h4>
                              <p className="text-xs text-muted-foreground">
                                {achievement.description}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Connected Banks */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-primary" />
                    Connected Banks
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {connectionsLoading ? (
                    <div className="text-center py-8">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center mx-auto mb-4 animate-pulse">
                        <div className="w-4 h-4 bg-primary-foreground rounded"></div>
                      </div>
                      <p className="text-muted-foreground">
                        Loading connected banks...
                      </p>
                    </div>
                  ) : connectionsData?.connections?.length > 0 ? (
                    <div className="space-y-4">
                      {connectionsData.connections.map((connection: any) => (
                        <div
                          key={connection.id}
                          className="flex items-center justify-between p-4 border rounded-lg"
                        >
                          <div>
                            <h4 className="font-medium">Bank Connection</h4>
                            <p className="text-sm text-muted-foreground">
                              Status:{" "}
                              <Badge
                                variant={
                                  ["CONNECTED", "SYNCING", "SYNCED"].includes(
                                    connection.status
                                  )
                                    ? "default"
                                    : "secondary"
                                }
                              >
                                {connection.status}
                              </Badge>
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Connection ID: {connection.id.slice(0, 8)}...
                            </p>
                          </div>
                          <div className="text-right space-y-2">
                            <p className="text-sm font-medium text-primary">
                              {connectionsData.accounts?.filter(
                                (account: any) =>
                                  account.connection?.id === connection.id
                              ).length || 0}{" "}
                              accounts
                            </p>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() =>
                                disconnectMutation.mutate(connection.id)
                              }
                              disabled={disconnectMutation.isPending}
                            >
                              {disconnectMutation.isPending ? (
                                <>
                                  <div className="w-4 h-4 animate-spin rounded-full border-2 border-transparent border-t-current mr-2" />
                                  Unlinking...
                                </>
                              ) : (
                                <>
                                  <Unlink className="w-4 h-4 mr-2" />
                                  Unlink Bank
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      ))}
                      {connectionsData.accounts?.length > 0 && (
                        <div className="mt-4 pt-4 border-t">
                          <h5 className="font-medium mb-3">Your Accounts</h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {connectionsData.accounts.map((account: any) => (
                              <div
                                key={account.id}
                                className="p-3 bg-muted/50 rounded-lg"
                              >
                                <p className="font-medium">{account.name}</p>
                                <p className="text-sm text-muted-foreground">
                                  {account.kind || account.type} ••••{" "}
                                  {account.mask}
                                </p>
                                {account.balance && (
                                  <p className="text-sm font-medium text-primary">
                                    $
                                    {account.balance.current?.toFixed(2) ||
                                      "0.00"}
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <CreditCard className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground mb-4">
                        No banks connected yet
                      </p>
                      <p className="text-sm text-muted-foreground mb-4">
                        Connect your bank account to start tracking bills and
                        earning rewards
                      </p>
                      <LinkBankButton
                        onSuccess={() => {
                          // Refresh session and connections data when a bank is successfully connected
                          refreshSession();
                          queryClient.invalidateQueries({
                            queryKey: ["userConnections"],
                          });
                        }}
                        onError={(error) => {
                          // If it's a session token error, refresh and retry
                          if (error.message?.includes("Session token")) {
                            refreshSession();
                          }
                          toast({
                            title: "Connection Failed",
                            description:
                              error.message ||
                              "Failed to connect bank. Please try again.",
                            variant: "destructive",
                          });
                        }}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right Column */}
            <div className="space-y-8">
              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <RedeemPointsModal>
                    <Button className="w-full" variant="default">
                      <Gift className="w-4 h-4 mr-2" />
                      Redeem Points
                    </Button>
                  </RedeemPointsModal>

                  <BillRemindersModal>
                    <Button className="w-full" variant="outline">
                      <AlertCircle className="w-4 h-4 mr-2" />
                      Set Reminders
                    </Button>
                  </BillRemindersModal>

                  <Button className="w-full" variant="outline">
                    <Eye className="w-4 h-4 mr-2" />
                    View Activity
                  </Button>

                  <AddBillModal>
                    <Button className="w-full" variant="outline">
                      <Plus className="w-4 h-4 mr-2" />
                      Add New Bill
                    </Button>
                  </AddBillModal>
                </CardContent>
              </Card>

              {/* Monthly Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-primary" />
                    Monthly Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      Total Spent
                    </span>
                    <span className="font-medium">
                      ${monthlySpending.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      Points Earned
                    </span>
                    <span className="font-medium text-primary">
                      {monthlyPoints}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      Bills Paid
                    </span>
                    <span className="font-medium">
                      {bills.filter((b) => b.status === "paid").length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      Categories
                    </span>
                    <span className="font-medium">
                      {Object.keys(categorySpending).length}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Calendar */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CalendarDays className="w-5 h-5 text-primary" />
                    Upcoming Due Dates
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {upcomingDueDates.length > 0 ? (
                    <div className="space-y-3">
                      {upcomingDueDates.map((bill) => {
                        const dueDate = new Date(bill.dueDate);
                        const isUrgent =
                          dueDate.getTime() - Date.now() <
                          3 * 24 * 60 * 60 * 1000; // 3 days

                        return (
                          <div
                            key={bill.id}
                            className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                          >
                            <div>
                              <p className="font-medium text-sm">{bill.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {dueDate.toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                })}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium">
                                ${bill.amount}
                              </p>
                              {isUrgent && (
                                <Badge
                                  variant="destructive"
                                  className="text-xs"
                                >
                                  Due Soon
                                </Badge>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-sm">
                      No upcoming bills
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-primary" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {recentActivity.length > 0 ? (
                    <div className="space-y-3">
                      {recentActivity.map((bill) => (
                        <div
                          key={bill.id}
                          className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                        >
                          <div>
                            <p className="font-medium text-sm">{bill.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {bill.company}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium">
                              +{bill.rewards} pts
                            </p>
                            <Badge variant="secondary" className="text-xs">
                              Paid
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-sm">
                      No recent activity
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
