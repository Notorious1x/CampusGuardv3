import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/auth-context";
import { KNUST_SECURITY_NUMBER } from "../lib/constants";
import { Button } from "../components/ui/components";
import { ShieldCheck, MapPin, Footprints, FileText, Users, Radio, ArrowRight, Siren, Phone } from "lucide-react";

const features = [
  { icon: <Siren className="h-7 w-7 text-red-500" />, title: "One-Tap SOS", desc: "Trigger an emergency alert instantly. Your GPS location is captured and sent to campus security." },
  { icon: <Footprints className="h-7 w-7 text-green-500" />, title: "Safe Walk", desc: "Share live location with guardians during late-night walks. Auto-check-in when you arrive." },
  { icon: <MapPin className="h-7 w-7 text-blue-500" />, title: "Live Tracking", desc: "Real-time map monitoring for security personnel and guardians during emergencies." },
  { icon: <FileText className="h-7 w-7 text-orange-500" />, title: "Incident Reporting", desc: "Report suspicious activities with descriptions, images, and GPS-tagged locations." },
  { icon: <Users className="h-7 w-7 text-purple-500" />, title: "Guardian Alerts", desc: "Trusted contacts receive real-time notifications during SOS and Safe Walk sessions." },
  { icon: <Radio className="h-7 w-7 text-cyan-500" />, title: "Alert Broadcasting", desc: "Security can broadcast campus-wide safety alerts categorized by severity." },
];

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  useEffect(() => { if (user) navigate(`/dashboard/${user.role}`); }, [user, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-red-50 dark:from-gray-950 dark:to-gray-900">
      <header className="container mx-auto flex items-center justify-between p-4 max-w-7xl">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-8 w-8 text-red-600" />
          <span className="font-bold text-xl tracking-tight">CampusGuard</span>
        </div>
        <div className="flex items-center gap-2">
          <a href={`tel:${KNUST_SECURITY_NUMBER}`} className="hidden sm:flex items-center gap-1.5 text-sm text-red-600 font-medium mr-2">
            <Phone className="h-4 w-4" />{KNUST_SECURITY_NUMBER}
          </a>
          <Link to="/login"><Button variant="ghost">Log In</Button></Link>
          <Link to="/register"><Button className="bg-red-600 hover:bg-red-700 text-white">Sign Up</Button></Link>
        </div>
      </header>
      <section className="container mx-auto px-4 pt-16 pb-20 max-w-7xl">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-100 text-red-700 text-sm font-medium mb-6">
            <ShieldCheck className="h-4 w-4" />Campus Safety System
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight mb-6 leading-tight">
            Stay Safe on<span className="text-red-600"> KNUST Campus</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-8">
            CampusGuard is a web-based emergency alert system for KNUST students. One-tap SOS, live tracking, Safe Walk, incident reporting, and guardian alerts.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/register"><Button size="lg" className="bg-red-600 hover:bg-red-700 text-white px-8 text-base">Get Started <ArrowRight className="ml-2 h-4 w-4" /></Button></Link>
            <Link to="/login"><Button size="lg" variant="outline" className="px-8 text-base">Log In</Button></Link>
          </div>
        </div>
      </section>
      <section className="container mx-auto px-4 pb-20 max-w-7xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f, i) => (
            <div key={i} className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border hover:shadow-lg hover:-translate-y-1 hover:border-red-200 dark:hover:border-red-900 transition-all duration-300 ease-out">
              <div className="mb-3">{f.icon}</div>
              <h3 className="font-semibold text-base mb-1.5">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>
      <footer className="border-t py-6">
        <div className="container mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">CampusGuard &mdash; KNUST Emergency Alert System</p>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <Link to="/privacy" className="hover:text-foreground">Privacy</Link>
            <Link to="/terms" className="hover:text-foreground">Terms</Link>
            <Link to="/faq" className="hover:text-foreground">FAQs</Link>
          </div>
          <a href={`tel:${KNUST_SECURITY_NUMBER}`} className="flex items-center gap-1.5 text-sm text-red-600 font-medium">
            <Phone className="h-3.5 w-3.5" />Security: {KNUST_SECURITY_NUMBER}
          </a>
        </div>
      </footer>
    </div>
  );
}
