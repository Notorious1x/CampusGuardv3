import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/auth-context";
import * as api from "../lib/api";
import { Button, Input, Label, Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/components";
import { useToast } from "../components/ui/toast";
import { ShieldCheck, Loader2, Eye, EyeOff, MailWarning } from "lucide-react";

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

export default function LoginPage() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [needsVerification, setNeedsVerification] = useState(false);
  const [resending, setResending] = useState(false);

  useEffect(() => { if (user) navigate(`/dashboard/${user.role}`); }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setNeedsVerification(false);
    const result = await login(email, password);
    if (result.success) { toast.success("Welcome back!"); }
    else if (result.needsVerification) { setNeedsVerification(true); }
    else { toast.error(result.error || "Login failed"); }
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    const result = await api.signInWithGoogle();
    if (!result.success) { toast.error(result.error || "Google sign-in failed"); setLoading(false); }
  };

  const handleResend = async () => {
    if (!email) { toast.error("Enter your email above first"); return; }
    setResending(true);
    const result = await api.resendVerificationEmail(email);
    if (result.success) toast.success("Verification email sent. Check your inbox.");
    else toast.error(result.error || "Could not resend email");
    setResending(false);
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

            {needsVerification && (
              <div className="mt-4 p-3 rounded-lg border border-amber-300 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-700">
                <div className="flex items-start gap-2">
                  <MailWarning className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                  <div className="text-xs text-amber-800 dark:text-amber-300">
                    <p className="font-medium">Your email is not verified yet.</p>
                    <p className="mt-0.5">Check your inbox for the verification link, or</p>
                    <button onClick={handleResend} disabled={resending} className="mt-1 font-semibold underline hover:no-underline disabled:opacity-50">
                      {resending ? "Sending..." : "Resend verification email"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 border-t" />
              <span className="text-xs text-muted-foreground">or</span>
              <div className="flex-1 border-t" />
            </div>

            <Button type="button" variant="outline" onClick={handleGoogleLogin} disabled={loading} className="w-full h-11 font-medium flex items-center justify-center gap-2">
              <GoogleIcon />Continue with Google
            </Button>

            <p className="text-center text-sm text-muted-foreground mt-6">
              Don't have an account? <Link to="/register" className="text-red-600 hover:underline font-medium">Sign Up</Link>
            </p>
            <p className="text-center text-[11px] text-muted-foreground/60 mt-3">
              By continuing you agree to our <Link to="/terms" className="underline hover:text-foreground">Terms</Link> and <Link to="/privacy" className="underline hover:text-foreground">Privacy Policy</Link>.
            </p>
          </CardContent>
        </Card>
        <p className="text-center text-[11px] text-muted-foreground/40 mt-4">Powered by GROUP 3</p>
      </div>
    </div>
  );
}
