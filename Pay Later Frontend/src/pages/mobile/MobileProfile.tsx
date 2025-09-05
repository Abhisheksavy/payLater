import { useState } from "react";
import { MobileLayout } from "@/components/mobile/MobileLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { 
  User, 
  Bell, 
  Shield, 
  CreditCard, 
  HelpCircle, 
  Settings,
  LogOut,
  Crown,
  Star,
  ChevronRight,
  Moon,
  Sun
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const profileStats = {
  totalPoints: 1250,
  billsPaid: 24,
  memberSince: "January 2024",
  currentTier: "Silver"
};

const settingsSections = [
  {
    title: "Account",
    items: [
      { icon: User, label: "Personal Information", value: "", action: true },
      { icon: CreditCard, label: "Payment Methods", value: "3 methods", action: true },
      { icon: Shield, label: "Security", value: "2FA enabled", action: true },
    ]
  },
  {
    title: "Preferences",
    items: [
      { icon: Bell, label: "Notifications", value: "", toggle: true, enabled: true },
      { icon: Moon, label: "Dark Mode", value: "", toggle: true, enabled: false },
    ]
  },
  {
    title: "Support",
    items: [
      { icon: HelpCircle, label: "Help Center", value: "", action: true },
      { icon: Settings, label: "App Settings", value: "", action: true },
    ]
  }
];

export default function MobileProfile() {
  const { user, logout } = useAuth();
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  const handleLogout = () => {
    logout();
  };

  const getTierColor = (tier: string) => {
    switch (tier.toLowerCase()) {
      case "bronze": return "text-orange-600";
      case "silver": return "text-gray-500";
      case "gold": return "text-yellow-500";
      case "platinum": return "text-purple-500";
      default: return "text-gray-500";
    }
  };

  return (
    <MobileLayout title="Profile">
      <div className="p-4 space-y-6">
        {/* Profile Header */}
        <Card className="bg-gradient-to-br from-primary/10 to-primary-glow/5 border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <Avatar className="w-16 h-16">
                <AvatarImage src="" />
                <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-bold text-foreground">{user?.name}</h2>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Crown className={`w-4 h-4 ${getTierColor(profileStats.currentTier)}`} />
                  <span className="text-sm font-medium">{profileStats.currentTier} Member</span>
                  <Badge variant="outline" className="text-xs">
                    Since {profileStats.memberSince}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3">
          <Card>
            <CardContent className="p-3 text-center">
              <Star className="w-5 h-5 text-primary mx-auto mb-1" />
              <div className="text-lg font-semibold">{profileStats.totalPoints.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground">Points</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-3 text-center">
              <CreditCard className="w-5 h-5 text-success mx-auto mb-1" />
              <div className="text-lg font-semibold">{profileStats.billsPaid}</div>
              <div className="text-xs text-muted-foreground">Bills Paid</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-3 text-center">
              <Crown className="w-5 h-5 text-orange-500 mx-auto mb-1" />
              <div className="text-lg font-semibold">$12.50</div>
              <div className="text-xs text-muted-foreground">Cash Back</div>
            </CardContent>
          </Card>
        </div>

        {/* Settings Sections */}
        {settingsSections.map((section, sectionIndex) => (
          <Card key={sectionIndex}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">{section.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-0">
              {section.items.map((item, itemIndex) => (
                <div key={itemIndex}>
                  <div className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-3">
                      <item.icon className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <div className="font-medium text-sm">{item.label}</div>
                        {item.value && (
                          <div className="text-xs text-muted-foreground">{item.value}</div>
                        )}
                      </div>
                    </div>
                    
                    {item.toggle ? (
                      <Switch
                        checked={item.label === "Notifications" ? notifications : darkMode}
                        onCheckedChange={item.label === "Notifications" ? setNotifications : setDarkMode}
                      />
                    ) : item.action ? (
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    ) : null}
                  </div>
                  
                  {itemIndex < section.items.length - 1 && (
                    <Separator />
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        ))}

        {/* App Info */}
        <Card>
          <CardContent className="p-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">App Version</span>
              <span className="text-sm font-medium">1.0.0</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Privacy Policy</span>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Terms of Service</span>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        {/* Logout Button */}
        <Button 
          variant="outline" 
          className="w-full gap-2 text-destructive border-destructive/20 hover:bg-destructive/10"
          onClick={handleLogout}
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </Button>

        {/* Bottom padding for safe area */}
        <div className="h-4"></div>
      </div>
    </MobileLayout>
  );
}