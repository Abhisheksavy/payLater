import { useState } from "react";
import { MobileLayout } from "@/components/mobile/MobileLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Gift, 
  Star, 
  Trophy, 
  Target, 
  Crown,
  Coffee,
  ShoppingBag,
  Fuel,
  Utensils
} from "lucide-react";

const rewards = [
  { id: 1, name: "$5 Coffee Card", points: 500, category: "Food", icon: Coffee, available: 8 },
  { id: 2, name: "$10 Gas Card", points: 1000, category: "Fuel", icon: Fuel, available: 3 },
  { id: 3, name: "$15 Restaurant", points: 1500, category: "Dining", icon: Utensils, available: 12 },
  { id: 4, name: "$25 Shopping", points: 2500, category: "Retail", icon: ShoppingBag, available: 5 },
];

const achievements = [
  { 
    id: 1, 
    title: "First Payment", 
    description: "Complete your first bill payment", 
    progress: 100, 
    maxProgress: 100, 
    points: 50, 
    unlocked: true,
    icon: Star
  },
  { 
    id: 2, 
    title: "Monthly Streak", 
    description: "Pay 5 bills in one month", 
    progress: 3, 
    maxProgress: 5, 
    points: 100, 
    unlocked: false,
    icon: Target
  },
  { 
    id: 3, 
    title: "Point Collector", 
    description: "Earn 1000 total points", 
    progress: 750, 
    maxProgress: 1000, 
    points: 200, 
    unlocked: false,
    icon: Trophy
  },
];

const tierProgress = {
  current: "Silver",
  currentPoints: 1250,
  nextTier: "Gold",
  nextTierPoints: 2500,
  progress: 50
};

export default function MobileRewards() {
  const [activeTab, setActiveTab] = useState("rewards");
  const [userPoints] = useState(1250);

  const canRedeem = (requiredPoints: number) => userPoints >= requiredPoints;

  return (
    <MobileLayout title="Rewards">
      <div className="p-4 space-y-6">
        {/* Points Balance */}
        <Card className="bg-gradient-to-br from-primary/10 to-primary-glow/5 border-primary/20">
          <CardContent className="p-6 text-center">
            <div className="space-y-4">
              <div>
                <div className="text-3xl font-bold text-primary">{userPoints.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Available Points</div>
              </div>
              
              <div className="flex items-center justify-center gap-2">
                <Crown className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium">{tierProgress.current} Member</span>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress to {tierProgress.nextTier}</span>
                  <span>{tierProgress.nextTierPoints - tierProgress.currentPoints} points to go</span>
                </div>
                <Progress value={tierProgress.progress} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs for Rewards and Achievements */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="rewards">Rewards</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
          </TabsList>
          
          <TabsContent value="rewards" className="space-y-4 mt-4">
            <div className="grid gap-4">
              {rewards.map((reward) => (
                <Card key={reward.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <reward.icon className="w-6 h-6 text-primary" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="font-medium">{reward.name}</div>
                        <div className="text-sm text-muted-foreground">{reward.category}</div>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {reward.points} points
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {reward.available} available
                          </span>
                        </div>
                      </div>
                      
                      <Button 
                        size="sm" 
                        disabled={!canRedeem(reward.points)}
                        className="shrink-0"
                      >
                        {canRedeem(reward.points) ? "Redeem" : "Not enough"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            <Card className="bg-muted/50">
              <CardContent className="p-4 text-center">
                <Gift className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <div className="text-sm font-medium">More rewards coming soon!</div>
                <div className="text-xs text-muted-foreground mt-1">
                  Keep paying bills to unlock exclusive offers
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="achievements" className="space-y-4 mt-4">
            <div className="grid gap-4">
              {achievements.map((achievement) => (
                <Card key={achievement.id} className={`hover:shadow-md transition-shadow ${
                  achievement.unlocked ? 'bg-success/5 border-success/20' : ''
                }`}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        achievement.unlocked 
                          ? 'bg-success/10 text-success' 
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        <achievement.icon className="w-6 h-6" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <div className="font-medium">{achievement.title}</div>
                          {achievement.unlocked && (
                            <Badge className="bg-success/10 text-success border-success/20">
                              Unlocked
                            </Badge>
                          )}
                        </div>
                        
                        <div className="text-sm text-muted-foreground mt-1">
                          {achievement.description}
                        </div>
                        
                        <div className="mt-3 space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Progress</span>
                            <span>
                              {achievement.progress}/{achievement.maxProgress}
                            </span>
                          </div>
                          <Progress 
                            value={(achievement.progress / achievement.maxProgress) * 100} 
                            className="h-2"
                          />
                        </div>
                        
                        <div className="flex items-center justify-between mt-3">
                          <Badge variant="outline" className="text-xs">
                            +{achievement.points} points
                          </Badge>
                          {achievement.unlocked && (
                            <Button size="sm" variant="outline">
                              Claimed
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Tier Benefits */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Silver Member Benefits</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <div className="w-2 h-2 rounded-full bg-success"></div>
              <span>1.2x points multiplier</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-2 h-2 rounded-full bg-success"></div>
              <span>Priority customer support</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-2 h-2 rounded-full bg-success"></div>
              <span>Exclusive monthly offers</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="w-2 h-2 rounded-full bg-muted"></div>
              <span>Early access to new rewards (Gold+)</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </MobileLayout>
  );
}