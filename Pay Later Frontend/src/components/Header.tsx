import { Button } from "@/components/ui/button";
import { CreditCard, Home, Plus, User, LogOut } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import AddBillModal from "./AddBillModal";

const Header = () => {
  const { user, logout } = useAuth();
  return (
    <header className="bg-card/80 backdrop-blur-sm border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center">
            <CreditCard className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
            Everyday Bill
          </span>
        </Link>
        
        <nav className="hidden md:flex items-center space-x-6">
          {user ? (
            <>
              <Link to="/dashboard" className="flex items-center space-x-2 text-foreground hover:text-primary transition-colors">
                <Home className="w-4 h-4" />
                <span>Dashboard</span>
              </Link>
              <Link to="/bills" className="text-muted-foreground hover:text-primary transition-colors">Bills</Link>
              <Link to="/rewards" className="text-muted-foreground hover:text-primary transition-colors">Rewards</Link>
            </>
           ) : (
             <div></div>
           )}
        </nav>

        <div className="flex items-center space-x-4">
          {user ? (
            <>
              <AddBillModal>
                <Button variant="hero" size="sm" className="gap-2">
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
            <Link to="/auth">
              <Button variant="hero" size="sm">
                Sign In
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;