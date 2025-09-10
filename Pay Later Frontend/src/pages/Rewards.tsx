import Header from "@/components/Header";
import RewardsOverview from "@/components/ReawrdsOverview";
import RedeemPointsModal from "@/components/RedeemPointsModal";
import SetGoalsModal from "@/components/SetGoalsModal";
import BillRemindersModal from "@/components/BillRemindersModal";
import MobileDownloadModal from "@/components/MobileDownloadModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Gift, Star, Trophy, Target, Calendar, Smartphone } from "lucide-react";
import RewardsDashboardOverview from "@/components/RewardsDashboardOverView";

const Rewards = () => {
  const achievements = [
    {
      id: 1,
      title: "First Bill Paid",
      description: "Complete your first bill payment",
      points: 500,
      completed: true,
      icon: Star
    },
    {
      id: 2,
      title: "Streak Master",
      description: "Pay bills on time for 3 months",
      points: 2000,
      completed: true,
      icon: Calendar
    },
    {
      id: 3,
      title: "Power User",
      description: "Connect 10 different bills",
      points: 1500,
      completed: false,
      progress: 60,
      icon: Target
    },
    {
      id: 4,
      title: "Reward Champion",
      description: "Earn 50,000 total points",
      points: 5000,
      completed: false,
      progress: 78,
      icon: Trophy
    }
  ];

  const rewardTiers = [
    { name: "Bronze", min: 0, max: 10000, current: true },
    { name: "Silver", min: 10000, max: 25000, current: false },
    { name: "Gold", min: 25000, max: 50000, current: false },
    { name: "Platinum", min: 50000, max: 100000, current: false }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="py-8">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Rewards</h1>
            <p className="text-muted-foreground font-normal text-base leading-6 align-middle">Track your progress and claim rewards</p>
          </div>

          <RewardsDashboardOverview />

          <section className="my-12">
            <h2 className="text-2xl font-bold mb-6">Your Rewards Tier</h2>
            <Card className="bg-gradient-to-r from-primary/5 to-primary-glow/5 border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-primary" />
                  Bronze Member
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Progress to Silver</span>
                  <span className="text-sm font-medium">24,580 / 25,000 points</span>
                </div>
                <Progress value={98} className="h-2" />
                <p className="text-sm text-muted-foreground">
                  Just 420 more points to reach Silver tier and unlock exclusive benefits!
                </p>
              </CardContent>
            </Card>
          </section>

          {/* Achievements */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Achievements</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {achievements.map((achievement) => {
                const IconComponent = achievement.icon;
                return (
                  <Card key={achievement.id} className={`transition-all duration-300 hover:shadow-soft border-primary`}>
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-lg ${achievement.completed ? 'bg-primary text-success-foreground' : 'bg-muted text-muted-foreground'}`}>
                            <IconComponent className="w-5 h-5" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">{achievement.title}</CardTitle>
                            <p className="text-sm text-muted-foreground">{achievement.description}</p>
                          </div>
                        </div>
                        {achievement.completed ? (
                          <Badge className="bg-primary text-success-foreground">Completed</Badge>
                        ) : (
                          <Badge variant="outline">{achievement.progress}%</Badge>
                        )}
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      {!achievement.completed && achievement.progress && (
                        <Progress value={achievement.progress} className="h-2" />
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-primary font-bold">+{achievement.points} points</span>
                        {achievement.completed ? (
                          <Button size="sm" disabled className="bg-primary text-success-foreground">
                            ✓ Claimed
                          </Button>
                        ) : (
                          <Button size="sm" variant="outline" disabled>
                            In Progress
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </section>

          {/* Quick Actions */}
          <section>
            <h2 className="text-2xl font-bold mb-6">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="group hover:shadow-soft transition-all duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Gift className="w-5 h-5 text-primary" />
                    Redeem Points
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Convert your points to cash, gift cards, or travel rewards
                  </p>
                  <RedeemPointsModal>
                    <Button className="w-full">Browse Rewards</Button>
                  </RedeemPointsModal>
                </CardContent>
              </Card>

<Card className="group hover:shadow-soft transition-all duration-300 flex flex-col">
  <CardHeader>
    <CardTitle className="flex items-center gap-2">
      <Target className="w-5 h-5 text-primary" />
      Set Goals
    </CardTitle>
  </CardHeader>
  <CardContent className="flex flex-col flex-1">
    <p className="text-sm text-muted-foreground mb-4">
      Set savings goals and track your progress
    </p>
    <div className="mt-auto">
      <SetGoalsModal>
        <Button variant="outline" className="w-full">
          Create Goal
        </Button>
      </SetGoalsModal>
    </div>
  </CardContent>
</Card>


              <Card className="group hover:shadow-soft transition-all duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-primary" />
                    Bill Reminders
                  </CardTitle>
                </CardHeader>
                <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Never miss a payment with smart notifications
                </p>
                <BillRemindersModal>
                  <Button variant="outline" className="w-full">Set Reminders</Button>
                </BillRemindersModal>
                </CardContent>
              </Card>

              <Card className="group hover:shadow-soft transition-all duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Smartphone className="w-5 h-5 text-primary" />
                    Mobile App
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Get our mobile app for bill payments on the go
                  </p>
                  <MobileDownloadModal>
                    <Button variant="outline" className="w-full">Get Mobile App</Button>
                  </MobileDownloadModal>
                </CardContent>
              </Card>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default Rewards;