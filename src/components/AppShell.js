import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/auth-context";
import * as api from "../lib/api";
import { supabase } from "../lib/supabase";
import { showDeviceNotification, registerServiceWorker, getPermission } from "../lib/push";
import { KNUST_SECURITY_NUMBER } from "../lib/constants";
import { Avatar, AvatarFallback } from "./ui/components";
import { cn } from "../lib/utils";
import {
  ShieldCheck, LogOut, LayoutDashboard, Footprints, Siren, FileText, Bell, Users, Settings,
  UserCircle, Radio, MapPin, Phone, ChevronLeft, ChevronRight, MoreHorizontal, X,
} from "lucide-react";

export default function AppShell({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [unread, setUnread] = useState(0);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const moreMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(e.target)) setShowMoreMenu(false);
    };
    if (showMoreMenu) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showMoreMenu]);

  const handleLogout = async () => { setShowLogoutConfirm(false); await logout(); navigate("/"); };

  useEffect(() => {
    if (user) {
      const load = () => api.getUnreadCount(user.id, user.role).then(setUnread);
      load();
      const interval = setInterval(load, 5000);
      return () => clearInterval(interval);
    }
  }, [user]);

  // Realtime notifications → device pop-up alerts
  useEffect(() => {
    if (!user) return;
    if (getPermission() === "granted") registerServiceWorker();

    const targets = [String(user.id), "all"];
    if (user.role === "security") targets.push("all-security");

    const channel = supabase
      .channel(`notifications-${user.id}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "notifications" }, async (payload) => {
        const n = payload.new;
        if (!n || !targets.includes(n.user_id)) return;
        setUnread((prev) => prev + 1);
        try {
          const settings = await api.getUserSettings(user.id);
          if (settings.push_enabled === false) return;
          if (settings.mute_non_emergency && n.type !== "sos") return;
        } catch {
          // if settings fail to load, still show the notification
        }
        showDeviceNotification(n.title, n.message, `/dashboard/${user.role}/notifications`);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const initials = user?.full_name?.split(" ").map((n) => n[0]).join("").toUpperCase() || "U";
  const base = `/dashboard/${user?.role || "student"}`;

  const studentNav = [
    { href: base, label: "Dashboard", icon: <LayoutDashboard className="h-5 w-5" /> },
    { href: `${base}/safe-walk`, label: "Safe Walk", icon: <Footprints className="h-5 w-5" /> },
    { href: `${base}/sos`, label: "SOS", icon: <Siren className="h-5 w-5" /> },
    { href: `${base}/incidents`, label: "Report Incident", icon: <FileText className="h-5 w-5" /> },
    { href: `${base}/alerts`, label: "Alerts", icon: <Radio className="h-5 w-5" /> },
    { href: `${base}/guardians`, label: "Guardians", icon: <Users className="h-5 w-5" /> },
    { href: `${base}/notifications`, label: "Notifications", icon: <Bell className="h-5 w-5" />, badge: unread },
    { href: `${base}/settings`, label: "Settings", icon: <Settings className="h-5 w-5" /> },
    { href: `${base}/profile`, label: "Profile", icon: <UserCircle className="h-5 w-5" /> },
  ];

  const guardianNav = [
    { href: base, label: "Dashboard", icon: <LayoutDashboard className="h-5 w-5" /> },
    { href: `${base}/tracking`, label: "Live Tracking", icon: <MapPin className="h-5 w-5" /> },
    { href: `${base}/notifications`, label: "Notifications", icon: <Bell className="h-5 w-5" />, badge: unread },
    { href: `${base}/settings`, label: "Settings", icon: <Settings className="h-5 w-5" /> },
    { href: `${base}/profile`, label: "Profile", icon: <UserCircle className="h-5 w-5" /> },
  ];

  const securityNav = [
    { href: base, label: "Dashboard", icon: <LayoutDashboard className="h-5 w-5" /> },
    { href: `${base}/alerts`, label: "SOS Alerts", icon: <Siren className="h-5 w-5" /> },
    { href: `${base}/safe-walks`, label: "Safe Walks", icon: <Footprints className="h-5 w-5" /> },
    { href: `${base}/incidents`, label: "Incidents", icon: <FileText className="h-5 w-5" /> },
    { href: `${base}/broadcast`, label: "Broadcast", icon: <Radio className="h-5 w-5" /> },
    { href: `${base}/users`, label: "Users", icon: <Users className="h-5 w-5" /> },
    { href: `${base}/notifications`, label: "Notifications", icon: <Bell className="h-5 w-5" />, badge: unread },
    { href: `${base}/settings`, label: "Settings", icon: <Settings className="h-5 w-5" /> },
  ];

  const navItems = user?.role === "security" ? securityNav : user?.role === "guardian" ? guardianNav : studentNav;
  const bottomNavItems = navItems.length > 5 ? navItems.slice(0, 4) : navItems;
  const overflowItems = navItems.length > 5 ? navItems.slice(4) : [];

  const isActive = (href) => {
    if (href === base) return location.pathname === base;
    return location.pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop Sidebar */}
      <aside className={cn(
        "hidden md:flex flex-col border-r bg-card fixed top-0 left-0 h-full z-40 transition-all duration-200",
        collapsed ? "w-[68px]" : "w-60"
      )}>
        <div className="flex items-center gap-2 px-4 h-16 border-b shrink-0">
          <ShieldCheck className="h-7 w-7 text-red-600 shrink-0" />
          {!collapsed && <span className="font-bold text-lg tracking-tight">CampusGuard</span>}
        </div>

        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-1">
          {navItems.map((item) => (
            <Link key={item.href} to={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors relative",
                isActive(item.href) ? "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400" : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}>
              <span className="shrink-0">{item.icon}</span>
              {!collapsed && <span>{item.label}</span>}
              {item.badge > 0 && (
                <span className={cn("bg-red-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center",
                  collapsed ? "absolute -top-1 -right-1 h-4 w-4" : "ml-auto h-5 min-w-5 px-1"
                )}>{item.badge}</span>
              )}
            </Link>
          ))}
        </nav>

        {!collapsed && (
          <div className="px-3 py-2 mx-2 mb-2 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
            <div className="flex items-center gap-2 text-xs font-medium text-red-700 dark:text-red-400">
              <Phone className="h-3.5 w-3.5" />KNUST Security
            </div>
            <a href={`tel:${KNUST_SECURITY_NUMBER}`} className="text-sm font-bold text-red-700 dark:text-red-400">{KNUST_SECURITY_NUMBER}</a>
          </div>
        )}

        <div className="border-t p-3 shrink-0">
          <div className={cn("flex items-center gap-3", collapsed && "justify-center")}>
            <Avatar className="h-8 w-8 shrink-0">
              <AvatarFallback className="bg-red-100 text-red-700 text-xs font-semibold">{initials}</AvatarFallback>
            </Avatar>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user?.full_name}</p>
                <p className="text-[10px] text-muted-foreground capitalize">{user?.role}</p>
              </div>
            )}
          </div>
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className={cn("flex items-center gap-2 mt-3 w-full px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors", collapsed && "justify-center px-0")}
          >
            <LogOut className="h-4 w-4 shrink-0" />{!collapsed && <span>Logout</span>}
          </button>
        </div>
        {!collapsed && <p className="text-center text-[10px] text-muted-foreground/50 pb-2">Powered by GROUP 3</p>}

        <button onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-20 h-6 w-6 rounded-full border bg-background flex items-center justify-center hover:bg-muted">
          {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
        </button>
      </aside>

      <div className={cn("flex-1 flex flex-col min-h-screen transition-all duration-200", collapsed ? "md:ml-[68px]" : "md:ml-60")}>
        {/* Mobile Top Bar */}
        <header className="md:hidden sticky top-0 z-50 flex items-center justify-between h-14 px-4 border-b bg-background/95 backdrop-blur">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-red-600" />
            <span className="font-bold text-base">CampusGuard</span>
          </div>
          <div className="flex items-center gap-1">
            <Link to={`${base}/notifications`} className="relative p-2">
              <Bell className="h-5 w-5" />
              {unread > 0 && <span className="absolute top-1 right-1 h-4 w-4 bg-red-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center">{unread}</span>}
            </Link>
            <Link to={`${base}/profile`}>
              <Avatar className="h-7 w-7">
                <AvatarFallback className="bg-red-100 text-red-700 text-[10px] font-semibold">{initials}</AvatarFallback>
              </Avatar>
            </Link>
            <button onClick={() => setShowLogoutConfirm(true)} className="p-2 text-muted-foreground hover:text-destructive transition-colors">
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6 pb-24 md:pb-6 max-w-7xl w-full mx-auto">{children}</main>
      </div>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur">
        <div className="flex items-center justify-around h-16 px-1">
          {bottomNavItems.map((item) => (
            <Link key={item.href} to={item.href}
              className={cn("flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg min-w-0 flex-1 transition-colors",
                isActive(item.href) ? "text-red-600" : "text-muted-foreground"
              )}>
              <span className="relative">
                {item.icon}
                {item.badge > 0 && <span className="absolute -top-1 -right-2 h-3.5 w-3.5 bg-red-600 text-white text-[8px] font-bold rounded-full flex items-center justify-center">{item.badge}</span>}
              </span>
              <span className="text-[10px] font-medium truncate w-full text-center">{item.label}</span>
            </Link>
          ))}
          {overflowItems.length > 0 && (
            <div className="relative flex-1" ref={moreMenuRef}>
              <button onClick={() => setShowMoreMenu(!showMoreMenu)}
                className={cn("flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg w-full transition-colors",
                  showMoreMenu ? "text-red-600" : "text-muted-foreground"
                )}>
                <MoreHorizontal className="h-5 w-5" />
                <span className="text-[10px] font-medium">More</span>
              </button>
              {showMoreMenu && (
                <div className="absolute bottom-full right-0 mb-2 w-48 bg-background border rounded-xl shadow-lg py-2 z-50">
                  {overflowItems.map((item) => (
                    <Link key={item.href} to={item.href} onClick={() => setShowMoreMenu(false)}
                      className={cn("flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors",
                        isActive(item.href) ? "text-red-600 bg-red-50 dark:bg-red-900/20" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}>
                      {item.icon}
                      <span>{item.label}</span>
                      {item.badge > 0 && <span className="ml-auto bg-red-600 text-white text-[10px] font-bold rounded-full h-5 min-w-5 px-1 flex items-center justify-center">{item.badge}</span>}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </nav>

      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="bg-background rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-full bg-red-100 dark:bg-red-900/30"><LogOut className="h-5 w-5 text-red-600" /></div>
              <div><p className="font-semibold text-lg">Log Out</p><p className="text-sm text-muted-foreground">Are you sure you want to log out?</p></div>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setShowLogoutConfirm(false)} className="flex-1 px-4 py-2.5 rounded-xl border text-sm font-medium hover:bg-muted transition-colors">Cancel</button>
              <button onClick={handleLogout} className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors">Log Out</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
