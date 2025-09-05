import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Target, Trophy, DollarSign, Star, Gift, Plane } from "lucide-react";

interface SetGoalsModalProps {
  children: React.ReactNode;
}

const SetGoalsModal = ({ children }: SetGoalsModalProps) => {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const [goals, setGoals] = useState(() => {
    if (user) {
      return JSON.parse(localStorage.getItem(`bilt_goals_${user.id}`) || '[]');
    }
    return [];
  });

  const [newGoal, setNewGoal] = useState({
    title: "",
    targetPoints: "",
    targetDate: "",
    category: ""
  });

  const currentPoints = user ? parseInt(localStorage.getItem(`bilt_points_${user.id}`) || '0') : 0;

  const goalTemplates = [
    { title: "Weekend Getaway", points: 15000, category: "travel", icon: Plane },
    { title: "Cash Back Goal", points: 10000, category: "cash", icon: DollarSign },
    { title: "Premium Rewards", points: 25000, category: "membership", icon: Star },
    { title: "Shopping Spree", points: 5000, category: "shopping", icon: Gift }
  ];

  const handleCreateGoal = () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to create goals.",
        variant: "destructive"
      });
      return;
    }

    if (!newGoal.title || !newGoal.targetPoints || !newGoal.targetDate) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    const goal = {
      id: Date.now(),
      title: newGoal.title,
      targetPoints: parseInt(newGoal.targetPoints),
      targetDate: newGoal.targetDate,
      category: newGoal.category || 'other',
      currentPoints: 0,
      createdAt: new Date().toISOString(),
      status: 'active'
    };

    const updatedGoals = [...goals, goal];
    setGoals(updatedGoals);
    localStorage.setItem(`bilt_goals_${user.id}`, JSON.stringify(updatedGoals));

    toast({
      title: "Goal Created!",
      description: `Your goal "${goal.title}" has been set successfully.`,
      variant: "default"
    });

    // Reset form
    setNewGoal({
      title: "",
      targetPoints: "",
      targetDate: "",
      category: ""
    });
  };

  const handleDeleteGoal = (goalId: number) => {
    const updatedGoals = goals.filter((goal: any) => goal.id !== goalId);
    setGoals(updatedGoals);
    localStorage.setItem(`bilt_goals_${user.id}`, JSON.stringify(updatedGoals));

    toast({
      title: "Goal Deleted",
      description: "Your goal has been removed.",
      variant: "default"
    });
  };

  const handleTemplateSelect = (template: typeof goalTemplates[0]) => {
    setNewGoal({
      title: template.title,
      targetPoints: template.points.toString(),
      targetDate: "",
      category: template.category
    });
  };

  const getProgressPercentage = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'travel': return Plane;
      case 'cash': return DollarSign;
      case 'membership': return Star;
      case 'shopping': return Gift;
      default: return Target;
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Set Reward Goals
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Create New Goal */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Create New Goal</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="goal-title">Goal Title</Label>
                  <Input
                    id="goal-title"
                    placeholder="e.g., Vacation Fund"
                    value={newGoal.title}
                    onChange={(e) => setNewGoal(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="target-points">Target Points</Label>
                  <Input
                    id="target-points"
                    type="number"
                    placeholder="15000"
                    value={newGoal.targetPoints}
                    onChange={(e) => setNewGoal(prev => ({ ...prev, targetPoints: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="target-date">Target Date</Label>
                  <Input
                    id="target-date"
                    type="date"
                    value={newGoal.targetDate}
                    onChange={(e) => setNewGoal(prev => ({ ...prev, targetDate: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select value={newGoal.category} onValueChange={(value) => setNewGoal(prev => ({ ...prev, category: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="travel">Travel</SelectItem>
                      <SelectItem value="cash">Cash Back</SelectItem>
                      <SelectItem value="shopping">Shopping</SelectItem>
                      <SelectItem value="membership">Membership</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button onClick={handleCreateGoal} className="w-full" variant="hero">
                  Create Goal
                </Button>
              </CardContent>
            </Card>

            {/* Goal Templates */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Templates</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  {goalTemplates.map((template) => {
                    const IconComponent = template.icon;
                    return (
                      <Button
                        key={template.title}
                        variant="outline"
                        size="sm"
                        className="h-auto p-3 flex flex-col items-center gap-1"
                        onClick={() => handleTemplateSelect(template)}
                      >
                        <IconComponent className="w-4 h-4" />
                        <span className="text-xs">{template.title}</span>
                        <span className="text-xs text-muted-foreground">{template.points.toLocaleString()} pts</span>
                      </Button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Current Goals */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Your Goals</h3>
            
            {goals.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <Trophy className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No goals set yet</p>
                  <p className="text-sm text-muted-foreground">Create your first goal to start tracking progress</p>
                </CardContent>
              </Card>
            ) : (
              goals.map((goal: any) => {
                const IconComponent = getCategoryIcon(goal.category);
                const progress = getProgressPercentage(currentPoints, goal.targetPoints);
                const isCompleted = currentPoints >= goal.targetPoints;
                
                return (
                  <Card key={goal.id} className={`transition-all duration-300 ${isCompleted ? 'border-success/20 bg-success/5' : ''}`}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <IconComponent className="w-4 h-4 text-primary" />
                          <CardTitle className="text-base">{goal.title}</CardTitle>
                        </div>
                        <div className="flex items-center gap-2">
                          {isCompleted && <Badge className="bg-success text-success-foreground">Completed!</Badge>}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteGoal(goal.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>{currentPoints.toLocaleString()} / {goal.targetPoints.toLocaleString()} pts</span>
                      </div>
                      
                      <Progress value={progress} className="h-2" />
                      
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{progress.toFixed(0)}% complete</span>
                        <span>Target: {new Date(goal.targetDate).toLocaleDateString()}</span>
                      </div>

                      {isCompleted && (
                        <div className="p-2 bg-success/10 rounded border border-success/20">
                          <p className="text-sm text-success font-medium">🎉 Goal achieved! Time to redeem your rewards!</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SetGoalsModal;