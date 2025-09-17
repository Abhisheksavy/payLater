import { loginUtil, logoutUtil, signupUtil, verifyUtil } from '@/services/auth';
import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  signup: (name: string, email: string, password: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  // const [loading, setLoading] = useState(true);
  const [loading, setLoading] = useState(false);

  // useEffect(() => {
  //   // Check for existing session on app load
  //   const storedUser = localStorage.getItem('bilt_user');
  //   if (storedUser) {
  //     setUser(JSON.parse(storedUser));
  //   }
  //   setLoading(false);
  // }, []);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await verifyUtil();
        console.log("Verified User:", response);
        setUser(response);
      } catch (err) {
        console.error("Verification failed", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);


  const signup = async (name: string, email: string, password: string): Promise<{ success: boolean; message: string }> => {
    try {
      const newUser: User = await signupUtil(name, email, password);
      // setUser(newUser);
      return { success: true, message: 'Account created successfully!' };
    } catch (error) {
      return { success: false, message: 'Failed to create account' };
    }
  };

  const login = async (email: string, password: string): Promise<{ success: boolean; message: string }> => {
    try {
      const user: User = await loginUtil(email, password);
      setUser(user);
      return { success: true, message: 'Logged in successfully!' };
    } catch (error) {
      return { success: false, message: 'Failed to log in' };
    }
  };

  const logout = async () => {
    await logoutUtil();
    setUser(null);
  };

  const value = {
    user,
    login,
    signup,
    logout,
    isAuthenticated: !!user,
    loading
  };

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  )
};
