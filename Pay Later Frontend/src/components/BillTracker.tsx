import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, DollarSign, Zap, Wifi, Car, Home } from "lucide-react";
import AddBillModal from "./AddBillModal";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

const BillTracker = () => {
  const [bills, setBills] = useState([]);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      // Load user-specific bills
      const userBillsKey = `bilt_bills_${user.id}`;
      const savedBills = localStorage.getItem(userBillsKey);
      if (savedBills) {
        const parsedBills = JSON.parse(savedBills);
        setBills(parsedBills.map((bill: any) => ({
          ...bill,
          icon: getIconForCategory(bill.category),
          color: getColorForCategory(bill.category)
        })));
      }
    }
  }, [user]);

  const getIconForCategory = (category: string) => {
    switch (category) {
      case 'utilities': return Zap;
      case 'housing': return Home;
      case 'insurance': return Car;
      default: return Wifi;
    }
  };

  const getColorForCategory = (category: string) => {
    switch (category) {
      case 'utilities': return 'text-yellow-500';
      case 'housing': return 'text-purple-500';
      case 'insurance': return 'text-green-500';
      default: return 'text-blue-500';
    }
  };

  const handleBillAdded = (newBill: any) => {
    setBills(prev => [...prev, { 
      ...newBill, 
      icon: getIconForCategory(newBill.category),
      color: getColorForCategory(newBill.category)
    }]);
  };

  const handlePayBill = (billId: number) => {
    if (!user) return;

    setBills(prev => prev.map((bill: any) => 
      bill.id === billId 
        ? { ...bill, status: "paid" }
        : bill
    ));
    
    const bill = bills.find((b: any) => b.id === billId);
    if (bill) {
      // Update localStorage
      const userBillsKey = `bilt_bills_${user.id}`;
      const updatedBills = bills.map((b: any) => 
        b.id === billId ? { ...b, status: "paid" } : b
      );
      localStorage.setItem(userBillsKey, JSON.stringify(updatedBills));

      toast({
        title: "Bill Paid Successfully!",
        description: `You earned ${bill.points} points for paying ${bill.name}`,
        variant: "default"
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-success text-success-foreground">Paid</Badge>;
      case 'pending':
        return <Badge variant="destructive">Due Soon</Badge>;
      case 'scheduled':
        return <Badge variant="secondary">Scheduled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold mb-2">Your Bills</h2>
            <p className="text-muted-foreground">Track and pay your bills to earn rewards</p>
          </div>
          <AddBillModal onBillAdded={handleBillAdded}>
            <Button variant="customBlue">Add New Bill</Button>
          </AddBillModal>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {bills.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <Home className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No bills yet</h3>
              <p className="text-muted-foreground mb-4">Add your first bill to start earning rewards!</p>
              <AddBillModal onBillAdded={handleBillAdded}>
                <Button variant="customBlue">Add Your First Bill</Button>
              </AddBillModal>
            </div>
          ) : (
            bills.map((bill: any) => {
              const IconComponent = bill.icon;
              return (
                <Card key={bill.id} className="group hover:shadow-soft transition-all duration-300">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg bg-secondary ${bill.color}`}>
                          <IconComponent className="w-5 h-5" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{bill.name}</CardTitle>
                          <p className="text-sm text-muted-foreground">{bill.company}</p>
                        </div>
                      </div>
                      {getStatusBadge(bill.status)}
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <DollarSign className="w-4 h-4 text-muted-foreground" />
                        <span className="text-2xl font-bold">${bill.amount}</span>
                      </div>
                      {bill.dueDate && (
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">Due {bill.dueDate}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between p-3 bg-primary/5 rounded-lg border border-primary/10">
                      <span className="text-sm font-medium">Rewards</span>
                      <span className="text-primary font-bold">+{bill.points} points</span>
                    </div>

                    <div className="flex space-x-2">
                      {bill.status === 'pending' && (
                        <Button 
                          className="flex-1" 
                          variant="default"
                          onClick={() => handlePayBill(bill.id)}
                        >
                          Pay Now
                        </Button>
                      )}
                      {bill.status === 'scheduled' && (
                        <Button className="flex-1" variant="outline">Edit Schedule</Button>
                      )}
                      {bill.status === 'paid' && (
                        <Button className="flex-1" variant="success" disabled>
                          ✓ Paid
                        </Button>
                      )}
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        {bills.length > 0 && (
          <div className="mt-8 text-center">
            <p className="text-muted-foreground mb-4">
              Total potential rewards: <span className="font-bold text-primary">
                +{bills.reduce((sum: number, bill: any) => sum + bill.points, 0)} points
              </span>
            </p>
            <Button variant="outline">View All Bills</Button>
          </div>
        )}
      </div>
    </section>
  );
};

export default BillTracker;