import { Button } from "@/components/ui/button";
import { CreditCard, Home, Plus, User, LogOut, HouseIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import AddBillModal from "./AddBillModal";
import Logo from '../assets/Logo.svg';
import Quiltt from "@/Quiltt";


const Header = () => {
  const { user, logout } = useAuth();

  return (
    <header className="bg-card/80 backdrop-blur-sm border-b border-border sticky top-0 z-50 font-inter">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center justify-center gap-2">
            <img src={Logo} alt="Everyday Bill Logo" className="w-20 h-20 object-contain" />
          </div>
        {!user ? (<nav className="hidden md:flex items-center space-x-6">
          <Link to="/howItWorks" className="text-primary_gray hover:text-primary transition-colors">How It Works</Link>
          <Link to="/features" className="text-primary_gray hover:text-primary transition-colors">Features</Link>
          <Link to="/rewards" className="text-primary_gray hover:text-primary transition-colors">Rewards</Link>
          <Link to="/support" className="text-primary_gray hover:text-primary transition-colors">Support</Link>
        </nav>
      ) : (
      <nav className="hidden md:flex items-center space-x-6">
          <Link to="/dashboard" className="flex items-center space-x-2 text-foreground hover:text-primary transition-colors">
                <Home className="w-4 h-4" />
                <span>Dashboard</span>
              </Link>
          <Link to="/bills" className="text-primary_gray hover:text-primary transition-colors">Bill</Link>
          <Link to="/rewards" className="text-primary_gray hover:text-primary transition-colors">Rewards</Link>
        </nav>
      )}
        

        <div className="flex items-center space-x-4">
          {user ? (
            <>
              <Quiltt />
              <AddBillModal>
                <Button variant="customBlue" size="sm" className="gap-2">
                  <Plus className="w-4 h-4" />
                  Add Bill
                </Button>
              </AddBillModal>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <User className="w-4 h-4" />
                    {user?.name || 'User'}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={logout} className="gap-2 text-destructive">
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Link to="/auth">
                <p className="font-normal text-base leading-6 tracking-normal text-center align-middle hover:cursor-pointer text-primary_gray">
                  Sign In
                </p>
              </Link>

              <Link to="/auth">
                <Button variant="customBlue" size="sm">
                  Get Started
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
