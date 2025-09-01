import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Zap, 
  CreditCard, 
  Home, 
  Car, 
  Smartphone, 
  Wifi, 
  ShoppingCart, 
  Heart,
  GraduationCap,
  Shield,
  ParkingCircle,
  FileText
} from "lucide-react";

const billTypes = [
  {
    title: "Utilities",
    description: "Electricity, gas, water, and other essential services",
    icon: Zap,
    color: "text-yellow-600",
    bgColor: "bg-yellow-50"
  },
  {
    title: "Credit Cards",
    description: "All your credit card payments in one place",
    icon: CreditCard,
    color: "text-blue-600",
    bgColor: "bg-blue-50"
  },
  {
    title: "Rent/Mortgage",
    description: "Housing payments and property-related bills",
    icon: Home,
    color: "text-green-600",
    bgColor: "bg-green-50"
  },
  {
    title: "Auto & Transport",
    description: "Car payments, insurance, and transportation costs",
    icon: Car,
    color: "text-red-600",
    bgColor: "bg-red-50"
  },
  {
    title: "Phone & Internet",
    description: "Mobile plans and internet service providers",
    icon: Smartphone,
    color: "text-purple-600",
    bgColor: "bg-purple-50"
  },
  {
    title: "Streaming & Subscriptions",
    description: "Entertainment services and monthly subscriptions",
    icon: Wifi,
    color: "text-pink-600",
    bgColor: "bg-pink-50"
  },
  {
    title: "Shopping & Retail",
    description: "Store credit cards and retail financing",
    icon: ShoppingCart,
    color: "text-orange-600",
    bgColor: "bg-orange-50"
  },
  {
    title: "Health & Wellness",
    description: "Medical bills and health insurance payments",
    icon: Heart,
    color: "text-emerald-600",
    bgColor: "bg-emerald-50"
  },
  {
    title: "Education",
    description: "Student loans and educational expenses",
    icon: GraduationCap,
    color: "text-indigo-600",
    bgColor: "bg-indigo-50"
  },
  {
    title: "Insurance",
    description: "Life, home, and other insurance premiums",
    icon: Shield,
    color: "text-teal-600",
    bgColor: "bg-teal-50"
  },
  {
    title: "Parking Ticket",
    description: "Municipal parking fines and citations",
    icon: ParkingCircle,
    color: "text-amber-600",
    bgColor: "bg-amber-50"
  },
  {
    title: "Car Registration",
    description: "Vehicle registration and DMV fees",
    icon: FileText,
    color: "text-slate-600",
    bgColor: "bg-slate-50"
  }
];

const BillTypesSection = () => {
  return (
    <section className="py-16 px-4 bg-gradient-to-br from-background to-muted/30">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Track All Your Bill Types
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Organize and manage every type of bill you pay. Earn rewards on all your payments 
            and never miss a due date again.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {billTypes.map((type, index) => {
            const IconComponent = type.icon;
            return (
              <Card 
                key={index} 
                className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-border/50 bg-card/80 backdrop-blur-sm"
              >
                <CardHeader className="text-center pb-4">
                  <div className={`w-16 h-16 mx-auto rounded-full ${type.bgColor} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <IconComponent className={`w-8 h-8 ${type.color}`} />
                  </div>
                  <CardTitle className="text-lg font-semibold text-foreground">
                    {type.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center text-sm text-muted-foreground leading-relaxed">
                    {type.description}
                  </CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>
        
        <div className="text-center mt-12">
          <p className="text-muted-foreground mb-4">
            Plus many more! Our system supports any type of recurring payment.
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
              Earn Points
            </span>
            <span className="px-3 py-1 bg-success/10 text-success rounded-full text-sm font-medium">
              Auto-Pay Available
            </span>
            <span className="px-3 py-1 bg-accent-foreground/10 text-accent-foreground rounded-full text-sm font-medium">
              Smart Reminders
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BillTypesSection;