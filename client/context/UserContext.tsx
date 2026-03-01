import { createContext, useContext, useState } from "react";

interface UserData {
  username: string;
  name?: string;
  gameplayid: string;
  gameplaynum: string;
  sessionToken: string;

  phone?: string;
  email?: string;

  level?: string;

  id_tier?: string;
  tierName?: string;
  tierImage?: string;

  balance: number;
  idr_balance: string;
  type_wallet : string;

  referralCode?: string;

}

interface UserContextType {
  user: UserData | null;
  setUser: React.Dispatch<React.SetStateAction<UserData | null>>;
  updateBalance: (amount: number, idr?: string) => void;
  logout: () => void;
  authLoading: boolean;
  setAuthLoading: React.Dispatch<React.SetStateAction<boolean>>;
  pendingTransactions: any[];
  setPendingTransactions: React.Dispatch<React.SetStateAction<any[]>>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<UserData | null>(null);
    const [authLoading, setAuthLoading] = useState(true);

    const [pendingTransactions, setPendingTransactions] = useState<any[]>([]);

  const updateBalance = (amount: number, idr?: string) => {
    if (!user) return;

    const updatedUser = {
      ...user,
      balance: amount,
      idr_balance: idr ?? user.idr_balance,
    };

    setUser(updatedUser);
    localStorage.setItem("userData", JSON.stringify(updatedUser));
  };

  const logout = () => {
    console.log("LOGOUT DIPANGGIL");
    localStorage.removeItem("jwt");
    localStorage.removeItem("userData");
    localStorage.removeItem("username");
    setUser(null);
    setPendingTransactions([]);
    };

  return (
    <UserContext.Provider value={{user, 
        setUser, 
        updateBalance, 
        logout, 
        authLoading, 
        setAuthLoading,
        pendingTransactions,
        setPendingTransactions
    }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used inside UserProvider");
  }
  return context;
}