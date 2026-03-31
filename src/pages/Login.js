import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/auth-context";
import * as api from "../lib/api";
import { Button, Input, Label, Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/components";
import { useToast } from "../components/ui/toast";
import { ShieldCheck, Loader2, Eye, EyeOff, Users, Siren, GraduationCap } from "lucide-react";

const roleIcons = { student: <GraduationCap className="h-4 w-4" />, security: <Siren className="h-4 w-4" />, guardian: <Users className="h-4 w-4" /> };
const roleColors = { student: "border-blue-200 hover:bg-blue-50 text-blue-700", security: "border-red-200 hover:bg-red-50 text-red-700", guardian: "border-green-200 hover:bg-green-50 text-green-700" };

export default function LoginPage() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [demoAccounts, setDemoAccounts] = useState([]);

  useEffect(() => {
    api.seedDemoAccounts();
    setDemoAccounts(api.getDemoAccounts());
  }, []);

  useEffect(() => { if (user) navigate(`/dashboard/${user.role}`); }, [user, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    const result = login(email, password);
    if (result.success) { toast.success("Welcome back!"); }
    else { toast.error(result.error || "Login failed"); }
    setLoading(false);
  };

  const handleDemoLogin = (demo) => {
    setLoading(true);
    const result = login(demo.email, demo.password);
    if (result.success) { toast.success(`Signed in as ${demo.full_name}`); }
    else { toast.error(result.error || "Demo login failed"); }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-red-50 dark:from-gray-950 dark:via-gray-950 dark:to-gray-900 p-4">
      <div className="w-full max-w-md">
        <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl">
          <CardHeader className="text-center pb-2">
            <Link to="/" className="flex items-center justify-center gap-2.5 mb-5">
              <ShieldCheck className="h-9 w-9 text-red-600" />
              <span className="font-bold text-xl tracking-tight">CampusGuard</span>
            </Link>
            <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
            <CardDescription>Log in to access your safety dashboard</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="you@st.knust.edu.gh" value={email} onChange={(e) => setEmail(e.target.value)} required className="h-11" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input id="password" type={showPassword ? "text" : "password"} placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} required className="h-11 pr-10" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <Button type="submit" disabled={loading} className="w-full h-11 bg-red-600 hover:bg-red-700 text-white font-semibold">
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}Log In
              </Button>
            </form>

            <div className="mt-6 pt-5 border-t">
              <p className="text-xs font-medium text-muted-foreground text-center mb-3">Quick Demo Access</p>
              <div className="grid grid-cols-3 gap-2">
                {demoAccounts.map((demo) => (
                  <button
                    key={demo.role}
                    onClick={() => handleDemoLogin(demo)}
                    disabled={loading}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-lg border text-xs font-medium transition-colors ${roleColors[demo.role]}`}
                  >
                    {roleIcons[demo.role]}
                    <span className="capitalize">{demo.role}</span>
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-muted-foreground/60 text-center mt-2">Password: demo123</p>
            </div>

            <p className="text-center text-sm text-muted-foreground mt-6">
              Don't have an account? <Link to="/register" className="text-red-600 hover:underline font-medium">Sign Up</Link>
            </p>
          </CardContent>
        </Card>
        <p className="text-center text-[11px] text-muted-foreground/40 mt-4">Powered by GROUP 3</p>
      </div>
    </div>
  );
}
