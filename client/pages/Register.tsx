import { useState , useEffect} from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/context/LanguageContext";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";
import { useUser } from "@/context/UserContext";
import { apiRequest } from "@/services/api";

export default function Register() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { user } = useUser(); // kalau perlu nanti
  const BRANCH_ID = import.meta.env.VITE_BRANCH_ID;

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [selectedBank, setSelectedBank] = useState("");
  const [accountName, setAccountName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");

  const [loading, setLoading] = useState(false)
  const [bankList, setBankList] = useState<any[]>([]);

  useEffect(() => {
    const fetchBank = async () => {
      const res = await apiRequest("/listbank", "POST", {
        branch_id: BRANCH_ID,
      });

      // console.log("BANK RES:", res);

      if (res?.data?.data) {
        setBankList(res.data.data);
      }
    };

    fetchBank();
  }, []);

  const handleRegister = async () => {
    if (loading) return;

    const error = validateForm();
    if (error) {
      toast.error(error);
      return;
    }

    try {
      setLoading(true);

      const res = await apiRequest("/register", "POST", {
        branch_id: BRANCH_ID,
        username: username,
        password: password,
        email: email,
        phonenumber: phone,
        refferal: "",
        type_wallet: "1",
        id_wallet: selectedBank,
        account_name: accountName,
        account_number: accountNumber,
        client_ip: "127.0.0.1",
      });

      if (res.status) {
        toast.dismiss();
        toast.success("Register berhasil 🎉");

        setTimeout(() => {
          navigate("/");
        }, 1200);

        // reset form
        setUsername("");
        setEmail("");
        setPhone("");
        setPassword("");
        setConfirmPassword("");
        setSelectedBank("");
        setAccountName("");
        setAccountNumber("");
      } else {
        toast.error(res.message || "Register gagal");
      }

    } catch (err) {
      toast.error("Server error");
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    if (!username) return "Username wajib diisi";
    if (!username.trim()) return "Username wajib diisi";
    if (!email) return "Email wajib diisi";
    if (!phone) return "Whatsapp wajib diisi";
    if (!password) return "Password wajib diisi";
    if (password.length < 6) return "Password minimal 6 karakter";
    if (password !== confirmPassword) return "Konfirmasi password tidak cocok";
    if (!selectedBank) return "Pilih jenis bank";
    if (!accountName) return "Nama akun bank wajib diisi";
    if (!accountNumber) return "Nomor rekening wajib diisi";
    if (!/^\d+$/.test(accountNumber)) return "Nomor rekening harus angka";

    return null;
  };

  return (
    <div className="w-screen min-h-screen pb-24 relative overflow-x-hidden" style={{ backgroundColor: "#F1C8D6" }}>
      {/* Header */}
      <header className="sticky top-0 z-40 shadow-lg" style={{ background: "linear-gradient(90deg, #F178A1 0%, #FFC1DA 100%)" }}>
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={() => navigate("/")}
            className="text-white p-2 hover:bg-white/20 rounded transition-all"
          >
            <ArrowLeft size={24} />
          </button>
          {/* Logo instead of text title */}
          <img
            src="https://cdn.builder.io/o/assets%2Fde66772a80b6454ba51a7d50705077af%2F505602f2656f48249f1160282bd42950?alt=media&token=92a16de5-eb86-4192-adc2-da425247540d&apiKey=de66772a80b6454ba51a7d50705077af"
            alt="Logo"
            className="h-10 w-auto"
          />
          <div className="w-10"></div>
        </div>
      </header>

      {/* Registration Form */}
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-4 py-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6">
          <form className="space-y-5">
            {/* Personal Information Section */}
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-b-2 border-pink-300">
                {t("personal_info")}
              </h3>

              {/* Username */}
              <div className="mb-3">
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  {t("username")}
                </label>
                <input
                  type="text"
                  name="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  placeholder={t("username")}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-pink-500 transition-colors"
                />
              </div>

              {/* Email */}
              <div className="mb-3">
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  {t("email")}
                </label>
                <input
                  type="email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder={t("email")}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-pink-500 transition-colors"
                />
              </div>

              {/* WhatsApp */}
              <div className="mb-3">
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  {t("whatsapp")}
                </label>
                <input
                  type="tel"
                  name="whatsapp"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  placeholder={t("whatsapp")}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-pink-500 transition-colors"
                />
              </div>

              {/* Password */}
              <div className="mb-3">
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  {t("password")}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder={t("password")}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-pink-500 transition-colors pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="mb-3">
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  {t("confirm_password")}
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    placeholder={t("confirm_password")}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-pink-500 transition-colors pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
            </div>

            {/* Bank Information Section */}
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-b-2 border-pink-300">
                {t("bank_info")}
              </h3>

              {/* Bank Type */}
              <div className="mb-3">
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  {t("bank_type")}
                </label>
                <select
                  name="bankType"
                  value={selectedBank}
                  onChange={(e) => setSelectedBank(e.target.value)}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-pink-500 transition-colors text-gray-700"
                >
                  <option value="">-- {t("bank_type")} --</option>
                  {bankList.map((bank) => (
                    <option key={bank.id_wallet} value={bank.id_wallet}>
                      {bank.bank_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Bank Account Name */}
              <div className="mb-3">
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  {t("bank_account_name")}
                </label>
                <input
                  type="text"
                  name="bankAccountName"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  required
                  placeholder={t("bank_account_name")}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-pink-500 transition-colors"
                />
              </div>

              {/* Account Number */}
              <div className="mb-3">
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  {t("account_number")}
                </label>
                <input
                  type="text"
                  name="accountNumber"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  required
                  placeholder={t("account_number")}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-pink-500 transition-colors"
                />
              </div>
            </div>

            {/* Register Button */}
            <button
              type="button"
              onClick={handleRegister}
              disabled={loading}
              className="w-full bg-gradient-to-r from-pink-400 to-pink-300 hover:from-pink-500 hover:to-pink-400 text-white font-bold py-3 rounded-lg transition-all mt-6"
              style={{ background: "linear-gradient(90deg, #F178A1 0%, #FFC1DA 100%)" }}
            >
              {/* {t("register")} */}
              {loading ? "Memperoses..." : "Daftar"}
            </button>

            {/* Login Link */}
            <p className="text-center text-sm text-gray-600 mt-4">
              {t("have_account")}{" "}
              <button
                type="button"
                onClick={() => navigate("/")}
                className="text-pink-500 font-bold hover:text-pink-600"
              >
                {t("sign_in")}
              </button>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
