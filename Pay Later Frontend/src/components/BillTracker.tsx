import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Zap, Home, Car, BookOpen, ShoppingCart, Phone, Heart, CreditCard, Globe, DollarSign, Wifi } from "lucide-react";
import AddBillModal from "./AddBillModal";

interface BillTrackerProps {
  bills: any[];
  refreshBills: () => void;
}

const BillTracker = ({ bills, refreshBills }: BillTrackerProps) => {
  const getIconForCategory = (category: string) => {
    switch (category) {
      case "Housing": return Home;
      case "Utilities": return Zap;
      case "Subscriptions": return Wifi;
      case "Insurance": return Car;
      case "Education": return BookOpen;
      case "Shopping & Retail": return ShoppingCart;
      case "Phone & Internet": return Phone;
      case "Car Payment": return CreditCard;
      case "Health & Wellness": return Heart;
      case "Other": return Globe;
      default: return Globe;
    }
  };

  const getColorForCategory = (category: string) => {
    switch (category) {
      case "Housing": return "text-purple-500";
      case "Utilities": return "text-yellow-500";
      case "Subscriptions": return "text-pink-500";
      case "Insurance": return "text-green-500";
      case "Education": return "text-indigo-500";
      case "Shopping & Retail": return "text-orange-500";
      case "Phone & Internet": return "text-cyan-500";
      case "Car Payment": return "text-red-500";
      case "Health & Wellness": return "text-emerald-500";
      case "Other": return "text-blue-500";
      default: return "text-gray-500";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid": return <Badge className="bg-success text-success-foreground">Paid</Badge>;
      case "pending": return <Badge variant="destructive">Due Soon</Badge>;
      case "scheduled": return <Badge variant="secondary">Scheduled</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
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
          <AddBillModal onBillAdded={refreshBills}>
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
              <AddBillModal onBillAdded={refreshBills}>
                <Button variant="customBlue">Add Your First Bill</Button>
              </AddBillModal>
            </div>
          ) : (
            bills.map((bill: any) => {
              const IconComponent = getIconForCategory(bill.category);
              return (
                <Card key={bill.id} className="group hover:shadow-soft transition-all duration-300">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg bg-secondary ${getColorForCategory(bill.category)}`}>
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
                    </div>

                    <div className="flex items-center justify-between p-3 bg-primary/5 rounded-lg border border-primary/10">
                      <span className="text-sm font-medium">Rewards</span>
                      <span className="text-primary font-bold">+{bill.points} points</span>
                    </div>

                    <div className="flex space-x-2">
                      {bill.status === "pending" && (
                        <Button className="flex-1" variant="default">Pay Now</Button>
                      )}
                      {bill.status === "scheduled" && (
                        <Button className="flex-1" variant="outline">Edit Schedule</Button>
                      )}
                      {bill.status === "paid" && (
                        <Button className="flex-1" variant="success" disabled>
                          ✓ Paid
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (bill.fileUrl) {
                            window.open(bill.fileUrl, "_blank");
                          }
                        }}
                      >
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
};

export default BillTracker;
