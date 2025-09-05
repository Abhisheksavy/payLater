import { useState } from "react";
import { MobileLayout } from "@/components/mobile/MobileLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  CreditCard, 
  Smartphone, 
  Building2, 
  Plus,
  History,
  Clock,
  CheckCircle,
  AlertCircle
} from "lucide-react";

const paymentMethods = [
  { id: 1, type: "card", name: "•••• 4242", brand: "Visa", default: true, icon: CreditCard },
  { id: 2, type: "bank", name: "Wells Fargo •••• 1234", brand: "Checking", default: false, icon: Building2 },
  { id: 3, type: "digital", name: "Apple Pay", brand: "iPhone", default: false, icon: Smartphone },
];

const recentPayments = [
  { id: 1, merchant: "Electric Company", amount: 125.50, date: "2 hours ago", status: "completed", method: "Visa •••• 4242" },
  { id: 2, merchant: "Internet Provider", amount: 79.99, date: "3 days ago", status: "completed", method: "Apple Pay" },
  { id: 3, merchant: "Car Insurance", amount: 156.00, date: "1 week ago", status: "completed", method: "Wells Fargo" },
  { id: 4, merchant: "Mobile Plan", amount: 65.00, date: "2 weeks ago", status: "pending", method: "Visa •••• 4242" },
];

const scheduledPayments = [
  { id: 1, merchant: "Rent Payment", amount: 1200.00, date: "Mar 1", status: "scheduled", method: "Wells Fargo" },
  { id: 2, merchant: "Credit Card", amount: 234.50, date: "Mar 5", status: "scheduled", method: "Visa •••• 4242" },
];

export default function MobilePayments() {
  const [activeTab, setActiveTab] = useState("methods");

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed": return <CheckCircle className="w-4 h-4 text-success" />;
      case "pending": return <Clock className="w-4 h-4 text-orange-500" />;
      case "scheduled": return <Clock className="w-4 h-4 text-primary" />;
      default: return <AlertCircle className="w-4 h-4 text-destructive" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-success/10 text-success border-success/20";
      case "pending": return "bg-orange-100 text-orange-800 border-orange-200";
      case "scheduled": return "bg-primary/10 text-primary border-primary/20";
      default: return "bg-destructive/10 text-destructive border-destructive/20";
    }
  };

  return (
    <MobileLayout title="Payments">
      <div className="p-4 space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="methods">Methods</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
            <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
          </TabsList>
          
          <TabsContent value="methods" className="space-y-4 mt-4">
            {/* Payment Methods */}
            <div className="space-y-3">
              {paymentMethods.map((method) => (
                <Card key={method.id} className={`hover:shadow-md transition-shadow ${
                  method.default ? 'ring-2 ring-primary/20 bg-primary/5' : ''
                }`}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                        <method.icon className="w-6 h-6 text-muted-foreground" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="font-medium">{method.name}</div>
                        <div className="text-sm text-muted-foreground">{method.brand}</div>
                        {method.default && (
                          <Badge className="mt-1 bg-primary/10 text-primary border-primary/20">
                            Default
                          </Badge>
                        )}
                      </div>
                      
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              <Button variant="outline" className="w-full gap-2 h-12">
                <Plus className="w-4 h-4" />
                Add Payment Method
              </Button>
            </div>

            {/* Quick Pay */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Quick Pay</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="0.00"
                    className="text-lg"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="merchant">Merchant</Label>
                  <Input
                    id="merchant"
                    placeholder="Enter merchant name"
                  />
                </div>
                
                <Button className="w-full">
                  Pay Now
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="history" className="space-y-3 mt-4">
            {recentPayments.map((payment) => (
              <Card key={payment.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                      {getStatusIcon(payment.status)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm">{payment.merchant}</div>
                      <div className="text-xs text-muted-foreground">{payment.method}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {payment.date}
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="font-semibold">${payment.amount}</div>
                      <Badge className={getStatusColor(payment.status)}>
                        {payment.status}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            <Card className="bg-muted/50">
              <CardContent className="p-4 text-center">
                <History className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <div className="text-sm font-medium">View All Transactions</div>
                <div className="text-xs text-muted-foreground mt-1">
                  See your complete payment history
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="scheduled" className="space-y-3 mt-4">
            {scheduledPayments.map((payment) => (
              <Card key={payment.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Clock className="w-5 h-5 text-primary" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm">{payment.merchant}</div>
                      <div className="text-xs text-muted-foreground">{payment.method}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Scheduled for {payment.date}
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="font-semibold">${payment.amount}</div>
                      <Badge className={getStatusColor(payment.status)}>
                        {payment.status}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 mt-3">
                    <Button size="sm" variant="outline" className="flex-1">
                      Edit
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            <Button variant="outline" className="w-full gap-2 h-12">
              <Plus className="w-4 h-4" />
              Schedule Payment
            </Button>
          </TabsContent>
        </Tabs>

        {/* Payment Summary */}
        <Card className="bg-gradient-to-r from-muted/50 to-muted/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">This Month</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Total Payments</span>
              <span className="font-semibold">$1,964.99</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Completed</span>
              <span className="font-semibold text-success">6</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Pending</span>
              <span className="font-semibold text-orange-500">1</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </MobileLayout>
  );
}