import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/auth-context";
import { Button, Input, Label, Card, CardContent, CardHeader, CardTitle, CardDescription, Select } from "../components/ui/components";
import { useToast } from "../components/ui/toast";
import * as api from "../lib/api";
import { ShieldCheck, Loader2, Eye, EyeOff, KeyRound, MailCheck } from "lucide-react";

function GoogleIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15A11 11 0 0 0 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
    </svg>
  );
}

export default function RegisterPage() {
  const { register, user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [form, setForm] = useState({ fullName: "", email: "", studentId: "", phone: "", password: "", confirmPassword: "", role: "student" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [securityCode, setSecurityCode] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [verifyEmailSentTo, setVerifyEmailSentTo] = useState(null);
  const [resending, setResending] = useState(false);

  useEffect(() => { if (user) navigate(`/dashboard/${user.role}`); }, [user, navigate]);

  const passwordStrength = useMemo(() => {
    const p = form.password; if (!p) return 0;
    let s = 0; if (p.length >= 6) s++; if (p.length >= 8) s++; if (/[A-Z]/.test(p)) s++; if (/[0-9]/.test(p)) s++; if (/[^A-Za-z0-9]/.test(p)) s++;
    return s;
  }, [form.password]);

  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong", "Very Strong"][passwordStrength];
  const strengthColor = ["", "bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-green-500", "bg-green-600"][passwordStrength];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) { toast.error("Passwords do not match"); return; }
    if (form.password.length < 6) { toast.error("Password must be at least 6 characters"); return; }
    if (form.role === "security" && !securityCode.trim()) { toast.error("Security ID is required"); return; }
    if (!agreed) { toast.error("Please accept the Terms and Privacy Policy"); return; }
    setLoading(true);
    const result = await register(form.email, form.password, form.fullName, form.studentId || undefined, form.phone || undefined, form.role, form.role === "security" ? securityCode.trim() : undefined);
    if (result.success && result.needsVerification) { setVerifyEmailSentTo(result.email || form.email); }
    else if (result.success) toast.success("Account created successfully!");
    else toast.error(result.error || "Registration failed");
    setLoading(false);
  };

  const handleGoogleSignup = async () => {
    setLoading(true);
    const result = await api.signInWithGoogle();
    if (!result.success) { toast.error(result.error || "Google sign-in failed"); setLoading(false); }
  };

  const handleResend = async () => {
    setResending(true);
    const result = await api.resendVerificationEmail(verifyEmailSentTo);
    if (result.success) toast.success("Verification email sent again.");
    else toast.error(result.error || "Could not resend email");
    setResending(false);
  };

  if (verifyEmailSentTo) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-red-50 dark:from-gray-950 dark:via-gray-950 dark:to-gray-900 p-4">
        <div className="w-full max-w-md">
          <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl">
            <CardHeader className="text-center pb-2">
              <div className="flex items-center justify-center mb-4">
                <div className="p-4 rounded-full bg-green-100 dark:bg-green-900/30"><MailCheck className="h-10 w-10 text-green-600" /></div>
              </div>
              <CardTitle className="text-2xl font-bold">Verify Your Email</CardTitle>
              <CardDescription>We sent a verification link to</CardDescription>
              <p className="font-semibold text-sm mt-1">{verifyEmailSentTo}</p>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-sm text-muted-foreground">Click the link in the email to activate your account, then log in. Check your spam folder if you don't see it.</p>
              <Button onClick={handleResend} disabled={resending} variant="outline" className="w-full h-11">
                {resending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}Resend Email
              </Button>
              <Link to="/login"><Button className="w-full h-11 mt-2 bg-red-600 hover:bg-red-700 text-white font-semibold">Go to Login</Button></Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

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
              <label className="flex items-start gap-2 cursor-pointer">
                <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-0.5 h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500" />
                <span className="text-xs text-muted-foreground">
                  I agree to the <Link to="/terms" target="_blank" className="text-red-600 underline hover:no-underline">Terms &amp; Conditions</Link> and <Link to="/privacy" target="_blank" className="text-red-600 underline hover:no-underline">Privacy Policy</Link>
                </span>
              </label>
              <Button type="submit" disabled={loading} className="w-full h-11 bg-red-600 hover:bg-red-700 text-white font-semibold">
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}Create Account
              </Button>
            </form>
            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 border-t" />
              <span className="text-xs text-muted-foreground">or</span>
              <div className="flex-1 border-t" />
            </div>
            <Button type="button" variant="outline" onClick={handleGoogleSignup} disabled={loading} className="w-full h-11 font-medium flex items-center justify-center gap-2">
              <GoogleIcon />Continue with Google
            </Button>
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
