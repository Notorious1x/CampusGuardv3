import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/auth-context";
import { Button, Input, Label, Card, CardContent, CardHeader, CardTitle, CardDescription, Select } from "../components/ui/components";
import { useToast } from "../components/ui/toast";
import { ShieldCheck, Loader2, Eye, EyeOff, KeyRound } from "lucide-react";

export default function RegisterPage() {
  const { register, user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [form, setForm] = useState({ fullName: "", email: "", studentId: "", phone: "", password: "", confirmPassword: "", role: "student" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [securityCode, setSecurityCode] = useState("");

  useEffect(() => { if (user) navigate(`/dashboard/${user.role}`); }, [user, navigate]);

  const passwordStrength = useMemo(() => {
    const p = form.password; if (!p) return 0;
    let s = 0; if (p.length >= 6) s++; if (p.length >= 8) s++; if (/[A-Z]/.test(p)) s++; if (/[0-9]/.test(p)) s++; if (/[^A-Za-z0-9]/.test(p)) s++;
    return s;
  }, [form.password]);

  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong", "Very Strong"][passwordStrength];
  const strengthColor = ["", "bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-green-500", "bg-green-600"][passwordStrength];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) { toast.error("Passwords do not match"); return; }
    if (form.password.length < 6) { toast.error("Password must be at least 6 characters"); return; }
    if (form.role === "security" && !securityCode.trim()) { toast.error("Security ID is required"); return; }
    setLoading(true);
    const result = register(form.email, form.password, form.fullName, form.studentId || undefined, form.phone || undefined, form.role, form.role === "security" ? securityCode.trim() : undefined);
    if (result.success) toast.success("Account created successfully!");
    else toast.error(result.error || "Registration failed");
    setLoading(false);
  };

  const u = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-red-50 dark:from-gray-950 dark:via-gray-950 dark:to-gray-900 p-4">
      <div className="w-full max-w-md">
        <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl">
          <CardHeader className="text-center pb-2">
            <Link to="/" className="flex items-center justify-center gap-2.5 mb-5">
              <ShieldCheck className="h-9 w-9 text-red-600" />
              <span className="font-bold text-xl tracking-tight">CampusGuard</span>
            </Link>
            <CardTitle className="text-2xl font-bold">Create Account</CardTitle>
            <CardDescription>Sign up to use the CampusGuard safety system</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input placeholder="Kwame Asante" value={form.fullName} onChange={(e) => u("fullName", e.target.value)} required className="h-11" />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" placeholder="you@st.knust.edu.gh" value={form.email} onChange={(e) => u("email", e.target.value)} required className="h-11" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Student ID (optional)</Label>
                  <Input placeholder="20210001" value={form.studentId} onChange={(e) => u("studentId", e.target.value)} className="h-11" />
                </div>
                <div className="space-y-2">
                  <Label>Phone (optional)</Label>
                  <Input placeholder="+233241234567" value={form.phone} onChange={(e) => u("phone", e.target.value)} className="h-11" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <Select value={form.role} onChange={(v) => { u("role", v); setSecurityCode(""); }}>
                  <option value="student">Student</option>
                  <option value="guardian">Guardian (Trusted Contact)</option>
                  <option value="security">Security Personnel</option>
                </Select>
              </div>
              {form.role === "security" && (
                <div className="space-y-2">
                  <Label className="flex items-center gap-1.5"><KeyRound className="h-3.5 w-3.5 text-red-600" />Security ID <span className="text-red-600">*</span></Label>
                  <Input placeholder="e.g. KNS847291" value={securityCode} onChange={(e) => setSecurityCode(e.target.value.toUpperCase())} maxLength={9} className="h-11 font-mono tracking-widest border-red-200 focus:border-red-400" />
                  <p className="text-xs text-muted-foreground">Issued by your security administrator.</p>
                </div>
              )}
              <div className="space-y-2">
                <Label>Password</Label>
                <div className="relative">
                  <Input type={showPassword ? "text" : "password"} placeholder="At least 6 characters" value={form.password} onChange={(e) => u("password", e.target.value)} required className="h-11 pr-10" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {form.password && (
                  <div className="space-y-1">
                    <div className="flex gap-1">{[1,2,3,4,5].map((l) => (<div key={l} className={`h-1 flex-1 rounded-full transition-colors ${passwordStrength >= l ? strengthColor : "bg-muted"}`} />))}</div>
                    <p className="text-[11px] text-muted-foreground">{strengthLabel}</p>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label>Confirm Password</Label>
                <Input type="password" placeholder="Repeat your password" value={form.confirmPassword} onChange={(e) => u("confirmPassword", e.target.value)} required className="h-11" />
              </div>
              <Button type="submit" disabled={loading} className="w-full h-11 bg-red-600 hover:bg-red-700 text-white font-semibold">
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}Create Account
              </Button>
            </form>
            <p className="text-center text-sm text-muted-foreground mt-6">
              Already have an account? <Link to="/login" className="text-red-600 hover:underline font-medium">Log In</Link>
            </p>
          </CardContent>
        </Card>
        <p className="text-center text-[11px] text-muted-foreground/40 mt-4">Powered by GROUP 3</p>
      </div>
    </div>
  );
}
