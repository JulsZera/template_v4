import "./global.css";
import { useEffect } from "react";
import { useUser } from "@/context/UserContext";
import { apiRequest } from "@/services/api";
import { Toaster } from "react-hot-toast";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "./context/LanguageContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Register from "./pages/Register";
import Promo from "./pages/Promo";
import Deposit from "./pages/Deposit";
import Withdraw from "./pages/Withdraw";
import Banking from "./pages/Banking";

const queryClient = new QueryClient();

function App() {
const { setUser, setAuthLoading, authLoading } = useUser();

  useEffect(() => {
  const restoreSession = async () => {
    const jwt = localStorage.getItem("jwt");
    const savedUser = localStorage.getItem("userData");

    if (!jwt || !savedUser) {
      setUser(null);
      setAuthLoading(false);
      return;
    }

    // // 🔥 langsung pakai data login yang sudah disimpan
    // setUser(parsedUser);

    try {

      const profileRes = await apiRequest("/profile", "POST");
      const balanceRes = await apiRequest("/balance", "POST");

      const balanceData = balanceRes?.data?.data;
      const parsedUser = JSON.parse(savedUser);
      
      console.log("RESTORE SESSION START");
      console.log("JWT:", jwt);
      console.log("SAVED USER:", savedUser);
      console.log("PROFILE RES :", profileRes)
      console.log("BALANCE RES :", balanceRes)

      const updatedUser = {
        ...parsedUser, // 🔥 JANGAN HAPUS USERNAME

        balance: Number(balanceData.balance),
        idr_balance: balanceData.idr_balance,
        type_wallet: balanceData.type_wallet,
        id_tier: balanceData.id_tier,
        tierName: balanceData.name_tier,
        tierImage: balanceData.tier_image,
        referralCode: profileRes?.data?.refferal_code,
      };

      setUser(updatedUser);
      console.log("SET USER FROM RESTORE:", updatedUser);
      localStorage.setItem("userData", JSON.stringify(updatedUser));

    } catch (err) {
      localStorage.removeItem("jwt");
      localStorage.removeItem("userData");
      setUser(null);
    }
    setAuthLoading(false);
  };

  restoreSession();
}, []);

if (authLoading) return null;

  return (
    <LanguageProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster position="top-center" reverseOrder={false} />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/slot" element={<Index />} />
              <Route path="/casino" element={<Index />} />
              <Route path="/sportsbook" element={<Index />} />
              <Route path="/p2p" element={<Index />} />
              <Route path="/fishing" element={<Index />} />
              <Route path="/arcade" element={<Index />} />
              <Route path="/cockfighting" element={<Index />} />
              <Route path="/togel" element={<Index />} />
              <Route path="/:category/:provider" element={<Index />} />
              <Route path="/register" element={<Register />} />
              <Route path="/promo" element={<Promo />} />
              <Route path="/deposit" element={<Deposit />} />
              <Route path="/withdraw" element={<Withdraw />} />
              <Route path="/banking" element={<Banking />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </LanguageProvider>
  );
}

export default App;
