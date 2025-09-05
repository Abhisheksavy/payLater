import { useState } from "react";
import { MobileLayout } from "@/components/mobile/MobileLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Plus, 
  Calendar, 
  DollarSign, 
  Zap, 
  Wifi, 
  Car, 
  Home,
  CreditCard,
  Phone,
  Scan
} from "lucide-react";

const billTypes = [
  { icon: Zap, name: "Electricity", color: "text-yellow-500", bills: 1 },
  { icon: Car, name: "Insurance", color: "text-blue-500", bills: 2 },
  { icon: Home, name: "Rent", color: "text-green-500", bills: 1 },
  { icon: Wifi, name: "Internet", color: "text-purple-500", bills: 1 },
  { icon: Phone, name: "Mobile", color: "text-orange-500", bills: 1 },
  { icon: CreditCard, name: "Credit Card", color: "text-red-500", bills: 3 },
];

const upcomingBills = [
  { id: 1, name: "Electric Company", amount: 125.50, due: "Mar 15", type: "Electricity", status: "due", icon: Zap },
  { id: 2, name: "Internet Provider", amount: 79.99, due: "Mar 18", type: "Internet", status: "upcoming", icon: Wifi },
  { id: 3, name: "Car Insurance", amount: 156.00, due: "Mar 22", type: "Insurance", status: "upcoming", icon: Car },
];

const paidBills = [
  { id: 4, name: "Rent Payment", amount: 1200.00, paid: "Mar 1", type: "Rent", points: 120, icon: Home },
  { id: 5, name: "Mobile Plan", amount: 65.00, paid: "Feb 28", type: "Mobile", points: 6, icon: Phone },
  { id: 6, name: "Credit Card", amount: 234.50, paid: "Feb 25", type: "Credit Card", points: 23, icon: CreditCard },
];

export default function MobileBills() {
  const [activeTab, setActiveTab] = useState("upcoming");

  const getStatusColor = (status: string) => {
    switch (status) {
      case "due": return "bg-red-100 text-red-800 border-red-200";
      case "upcoming": return "bg-orange-100 text-orange-800 border-orange-200";
      case "paid": return "bg-green-100 text-green-800 border-green-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <MobileLayout title="Bills">
      <div className="p-4 space-y-6">
        {/* Quick Actions */}
        <div className="flex gap-3">
          <Button className="flex-1 gap-2">
            <Plus className="w-4 h-4" />
            Add Bill
          </Button>
          <Button variant="outline" className="gap-2">
            <Scan className="w-4 h-4" />
            Scan
          </Button>
        </div>

        {/* Bill Categories */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Categories</h3>
          <div className="grid grid-cols-3 gap-3">
            {billTypes.map((type, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-3 text-center">
                  <type.icon className={`w-6 h-6 mx-auto mb-2 ${type.color}`} />
                  <div className="text-sm font-medium">{type.name}</div>
                  <div className="text-xs text-muted-foreground">{type.bills} bill{type.bills !== 1 && 's'}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Bills List */}
        <div>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
              <TabsTrigger value="paid">Paid</TabsTrigger>
            </TabsList>
            
            <TabsContent value="upcoming" className="space-y-3 mt-4">
              {upcomingBills.map((bill) => (
                <Card key={bill.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full bg-muted flex items-center justify-center`}>
                        <bill.icon className="w-5 h-5 text-muted-foreground" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm">{bill.name}</div>
                        <div className="text-xs text-muted-foreground">{bill.type}</div>
                        <div className="flex items-center gap-2 mt-1">
                          <Calendar className="w-3 h-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">Due {bill.due}</span>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="font-semibold">${bill.amount}</div>
                        <Badge className={getStatusColor(bill.status)}>
                          {bill.status}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 mt-3">
                      <Button size="sm" className="flex-1">
                        Pay Now
                      </Button>
                      <Button size="sm" variant="outline">
                        Remind Me
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
            
            <TabsContent value="paid" className="space-y-3 mt-4">
              {paidBills.map((bill) => (
                <Card key={bill.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center">
                        <bill.icon className="w-5 h-5 text-success" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm">{bill.name}</div>
                        <div className="text-xs text-muted-foreground">{bill.type}</div>
                        <div className="flex items-center gap-2 mt-1">
                          <Calendar className="w-3 h-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">Paid {bill.paid}</span>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="font-semibold">${bill.amount}</div>
                        <Badge className="bg-success/10 text-success border-success/20">
                          +{bill.points} pts
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
          </Tabs>
        </div>

        {/* Monthly Summary */}
        <Card className="bg-gradient-to-r from-muted/50 to-muted/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">This Month</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Bills Paid</span>
              <span className="font-semibold">6</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Total Spent</span>
              <span className="font-semibold">$1,964.99</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Points Earned</span>
              <span className="font-semibold text-success">+196 pts</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </MobileLayout>
  );
}