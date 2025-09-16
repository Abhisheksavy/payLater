import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Bell, Calendar, Clock, Trash2, Plus } from "lucide-react";

interface BillRemindersModalProps {
  children: React.ReactNode;
}

const BillRemindersModal = ({ children }: BillRemindersModalProps) => {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const [reminders, setReminders] = useState([]);
  const [userBills, setUserBills] = useState([]);

  const [newReminder, setNewReminder] = useState({
    billId: "",
    reminderDays: "3",
    reminderTime: "09:00",
    enabled: true
  });

  useEffect(() => {
    if (user) {
      // Load user's bills
      const bills = JSON.parse(localStorage.getItem(`bilt_bills_${user.id}`) || '[]');
      setUserBills(bills);

      // Load user's reminders
      const savedReminders = JSON.parse(localStorage.getItem(`bilt_reminders_${user.id}`) || '[]');
      setReminders(savedReminders);
    }
  }, [user]);

  const handleCreateReminder = () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to set reminders.",
        variant: "destructive"
      });
      return;
    }

    if (!newReminder.billId) {
      toast({
        title: "Select a Bill",
        description: "Please select a bill to set a reminder for.",
        variant: "destructive"
      });
      return;
    }

    const selectedBill = userBills.find((bill: any) => bill.id.toString() === newReminder.billId);
    if (!selectedBill) return;

    const reminder = {
      id: Date.now(),
      billId: parseInt(newReminder.billId),
      billName: selectedBill.name,
      billCompany: selectedBill.company,
      reminderDays: parseInt(newReminder.reminderDays),
      reminderTime: newReminder.reminderTime,
      enabled: newReminder.enabled,
      createdAt: new Date().toISOString()
    };

    const updatedReminders = [...reminders, reminder];
    setReminders(updatedReminders);
    localStorage.setItem(`bilt_reminders_${user.id}`, JSON.stringify(updatedReminders));

    // Simulate setting up notification (in real app, this would integrate with browser notifications)
    if ('Notification' in window) {
      Notification.requestPermission();
    }

    toast({
      title: "Reminder Set!",
      description: `You'll be reminded ${reminder.reminderDays} days before ${reminder.billName} is due at ${reminder.reminderTime}.`,
      variant: "default"
    });

    // Reset form
    setNewReminder({
      billId: "",
      reminderDays: "3",
      reminderTime: "09:00",
      enabled: true
    });
  };

  const handleToggleReminder = (reminderId: number, enabled: boolean) => {
    const updatedReminders = reminders.map((reminder: any) =>
      reminder.id === reminderId ? { ...reminder, enabled } : reminder
    );
    setReminders(updatedReminders);
    localStorage.setItem(`bilt_reminders_${user.id}`, JSON.stringify(updatedReminders));

    toast({
      title: enabled ? "Reminder Enabled" : "Reminder Disabled",
      description: `Your reminder has been ${enabled ? 'activated' : 'deactivated'}.`,
      variant: "default"
    });
  };

  const handleDeleteReminder = (reminderId: number) => {
    const updatedReminders = reminders.filter((reminder: any) => reminder.id !== reminderId);
    setReminders(updatedReminders);
    localStorage.setItem(`bilt_reminders_${user.id}`, JSON.stringify(updatedReminders));

    toast({
      title: "Reminder Deleted",
      description: "Your reminder has been removed.",
      variant: "default"
    });
  };

  const testNotification = () => {
    if ('Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification('Everyday Bill Reminder Test', {
          body: 'Your bill reminder system is working!',
          icon: '/favicon.ico'
        });
        toast({
          title: "Test Notification Sent",
          description: "Check your browser notifications!",
          variant: "default"
        });
      } else {
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            new Notification('Everyday Bill Reminder Test', {
              body: 'Your bill reminder system is working!',
              icon: '/favicon.ico'
            });
          } else {
            toast({
              title: "Notifications Blocked",
              description: "Please enable notifications in your browser settings.",
              variant: "destructive"
            });
          }
        });
      }
    } else {
      toast({
        title: "Notifications Not Supported",
        description: "Your browser doesn't support notifications.",
        variant: "destructive"
      });
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
            <Bell className="w-5 h-5" />
            Bill Reminders
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Create New Reminder */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Set New Reminder
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="bill-select">Select Bill</Label>
                  <Select value={newReminder.billId} onValueChange={(value) => setNewReminder(prev => ({ ...prev, billId: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a bill" />
                    </SelectTrigger>
                    <SelectContent>
                      {userBills.map((bill: any) => (
                        <SelectItem key={bill.id} value={bill.id.toString()}>
                          {bill.name} - {bill.company}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reminder-days">Remind me how many days before?</Label>
                  <Select value={newReminder.reminderDays} onValueChange={(value) => setNewReminder(prev => ({ ...prev, reminderDays: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 day before</SelectItem>
                      <SelectItem value="3">3 days before</SelectItem>
                      <SelectItem value="7">1 week before</SelectItem>
                      <SelectItem value="14">2 weeks before</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reminder-time">Reminder Time</Label>
                  <Input
                    id="reminder-time"
                    type="time"
                    value={newReminder.reminderTime}
                    onChange={(e) => setNewReminder(prev => ({ ...prev, reminderTime: e.target.value }))}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={newReminder.enabled}
                    onCheckedChange={(checked) => setNewReminder(prev => ({ ...prev, enabled: checked }))}
                  />
                  <Label htmlFor="reminder-enabled">Enable reminder</Label>
                </div>

                <Button onClick={handleCreateReminder} className="w-full" variant="customBlue">
                  Create Reminder
                </Button>
              </CardContent>
            </Card>

            {/* Test Notification */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Test Notifications</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Test if notifications are working properly on your device.
                </p>
                <Button onClick={testNotification} variant="outline" className="w-full">
                  Send Test Notification
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Current Reminders */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Your Reminders</h3>
            
            {userBills.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <Calendar className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No bills to remind about</p>
                  <p className="text-sm text-muted-foreground">Add some bills first to set up reminders</p>
                </CardContent>
              </Card>
            ) : reminders.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <Bell className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No reminders set</p>
                  <p className="text-sm text-muted-foreground">Create your first reminder to never miss a payment</p>
                </CardContent>
              </Card>
            ) : (
              reminders.map((reminder: any) => (
                <Card key={reminder.id} className="transition-all duration-300">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-base">{reminder.billName}</CardTitle>
                        <p className="text-sm text-muted-foreground">{reminder.billCompany}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={reminder.enabled ? "default" : "outline"}>
                          {reminder.enabled ? "Active" : "Disabled"}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteReminder(reminder.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span>{reminder.reminderDays} days before</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span>{reminder.reminderTime}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm">Enable notifications</span>
                      <Switch
                        checked={reminder.enabled}
                        onCheckedChange={(checked) => handleToggleReminder(reminder.id, checked)}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>

        <div className="mt-6 p-4 bg-muted/50 rounded-lg">
          <h4 className="font-semibold mb-2">Reminder Tips:</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Allow browser notifications for the best experience</li>
            <li>• Reminders are sent at the time you specify</li>
            <li>• You can edit or disable reminders anytime</li>
            <li>• Multiple reminders can be set for the same bill</li>
          </ul>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BillRemindersModal;