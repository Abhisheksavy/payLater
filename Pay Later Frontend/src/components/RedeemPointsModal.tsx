import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Gift, Star, DollarSign, Plane, ShoppingBag, Coffee, Smartphone } from "lucide-react";

interface RedeemPointsModalProps {
  children: React.ReactNode;
}

const RedeemPointsModal = ({ children }: RedeemPointsModalProps) => {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const [userPoints, setUserPoints] = useState(() => {
    if (user) {
      return parseInt(localStorage.getItem(`bilt_points_${user.id}`) || '0');
    }
    return 0;
  });

  const rewardOptions = [
    {
      id: 1,
      title: "Cash Back",
      description: "Instant cash back to your account",
      points: 10000,
      value: "$100",
      icon: DollarSign,
      type: "cash",
      available: true
    },
    {
      id: 2,
      title: "Travel Credit",
      description: "Flight bookings and hotel stays",
      points: 15000,
      value: "$150",
      icon: Plane,
      type: "travel",
      available: userPoints >= 15000
    },
    {
      id: 3,
      title: "Amazon Gift Card",
      description: "Perfect for online shopping",
      points: 5000,
      value: "$50",
      icon: ShoppingBag,
      type: "giftcard",
      available: userPoints >= 5000
    },
    {
      id: 4,
      title: "Starbucks Credit",
      description: "Your daily coffee fix",
      points: 2500,
      value: "$25",
      icon: Coffee,
      type: "giftcard",
      available: userPoints >= 2500
    },
    {
      id: 5,
      title: "Apple Store Credit",
      description: "Latest tech and accessories",
      points: 20000,
      value: "$200",
      icon: Smartphone,
      type: "giftcard",
      available: userPoints >= 20000
    },
    {
      id: 6,
      title: "Premium Membership",
      description: "Upgrade to premium tier benefits",
      points: 25000,
      value: "1 Year",
      icon: Star,
      type: "membership",
      available: userPoints >= 25000
    }
  ];

  const handleRedeem = (reward: typeof rewardOptions[0]) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to redeem rewards.",
        variant: "destructive"
      });
      return;
    }

    if (userPoints < reward.points) {
      toast({
        title: "Insufficient Points",
        description: `You need ${reward.points.toLocaleString()} points but only have ${userPoints.toLocaleString()}.`,
        variant: "destructive"
      });
      return;
    }

    // Deduct points
    const newPoints = userPoints - reward.points;
    localStorage.setItem(`bilt_points_${user.id}`, newPoints.toString());
    setUserPoints(newPoints);

    // Add to redemption history
    const redemptionHistory = JSON.parse(localStorage.getItem(`bilt_redemptions_${user.id}`) || '[]');
    const newRedemption = {
      id: Date.now(),
      reward: reward.title,
      points: reward.points,
      value: reward.value,
      date: new Date().toISOString(),
      status: 'pending'
    };
    redemptionHistory.push(newRedemption);
    localStorage.setItem(`bilt_redemptions_${user.id}`, JSON.stringify(redemptionHistory));

    toast({
      title: "Reward Redeemed!",
      description: `Successfully redeemed ${reward.title} for ${reward.points.toLocaleString()} points. You'll receive confirmation within 24 hours.`,
      variant: "default"
    });

    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Gift className="w-5 h-5" />
            Redeem Your Points
          </DialogTitle>
          <div className="text-sm text-muted-foreground">
            You have <span className="font-bold text-primary">{userPoints.toLocaleString()} points</span> available
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          {rewardOptions.map((reward) => {
            const IconComponent = reward.icon;
            return (
              <Card key={reward.id} className={`transition-all duration-300 ${reward.available ? 'hover:shadow-soft cursor-pointer' : 'opacity-60'}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <IconComponent className="w-4 h-4 text-primary" />
                      </div>
                      <CardTitle className="text-base">{reward.title}</CardTitle>
                    </div>
                    {reward.available ? (
                      <Badge className="bg-success text-success-foreground">Available</Badge>
                    ) : (
                      <Badge variant="outline">Locked</Badge>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">{reward.description}</p>
                  
                  <div className="flex items-center justify-between">
                    <div className="text-lg font-bold text-primary">{reward.value}</div>
                    <div className="text-sm text-muted-foreground">{reward.points.toLocaleString()} pts</div>
                  </div>

                  <Button 
                    className="w-full" 
                    variant={reward.available ? "default" : "outline"}
                    disabled={!reward.available}
                    onClick={() => handleRedeem(reward)}
                  >
                    {reward.available ? "Redeem Now" : `Need ${reward.points.toLocaleString()} pts`}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-6 p-4 bg-muted/50 rounded-lg">
          <h4 className="font-semibold mb-2">Redemption Tips:</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Rewards are typically processed within 24-48 hours</li>
            <li>• Cash back is deposited directly to your linked account</li>
            <li>• Gift cards are sent via email with redemption codes</li>
            <li>• Points cannot be refunded once redeemed</li>
          </ul>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RedeemPointsModal;
