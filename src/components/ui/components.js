import React from "react";
import { cn } from "../../lib/utils";

// ── Card ──
export function Card({ className, children, onClick, ...props }) {
  return <div className={cn("rounded-xl border bg-card text-card-foreground shadow-sm", className)} onClick={onClick} {...props}>{children}</div>;
}
export function CardHeader({ className, children }) {
  return <div className={cn("flex flex-col space-y-1.5 p-6", className)}>{children}</div>;
}
export function CardTitle({ className, children }) {
  return <h3 className={cn("text-lg font-semibold leading-none tracking-tight", className)}>{children}</h3>;
}
export function CardDescription({ className, children }) {
  return <p className={cn("text-sm text-muted-foreground", className)}>{children}</p>;
}
export function CardContent({ className, children }) {
  return <div className={cn("p-6 pt-0", className)}>{children}</div>;
}

// ── Button ──
const buttonVariants = {
  default: "bg-primary text-primary-foreground hover:bg-primary/90",
  destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
  outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
  secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
  ghost: "hover:bg-accent hover:text-accent-foreground",
  link: "text-primary underline-offset-4 hover:underline",
};
const buttonSizes = {
  default: "h-10 px-4 py-2",
  sm: "h-9 rounded-md px-3 text-sm",
  lg: "h-11 rounded-md px-8",
  icon: "h-10 w-10",
};

export function Button({ className, variant = "default", size = "default", children, ...props }) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
        buttonVariants[variant], buttonSizes[size], className
      )}
      {...props}
    >{children}</button>
  );
}

// ── Input ──
export function Input({ className, ...props }) {
  return (
    <input
      className={cn(
        "flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
}

// ── Textarea ──
export function Textarea({ className, ...props }) {
  return (
    <textarea
      className={cn(
        "flex min-h-[80px] w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
}

// ── Label ──
export function Label({ className, children, ...props }) {
  return <label className={cn("text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70", className)} {...props}>{children}</label>;
}

// ── Badge ──
const badgeVariants = {
  default: "bg-primary text-primary-foreground",
  secondary: "bg-secondary text-secondary-foreground",
  destructive: "bg-destructive text-destructive-foreground",
  outline: "text-foreground border",
};

export function Badge({ className, variant = "default", children }) {
  return <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors", badgeVariants[variant], className)}>{children}</span>;
}

// ── Select ──
export function Select({ value, onChange, children, className }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={cn(
        "flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        className
      )}
    >{children}</select>
  );
}

// ── Tabs ──
export function Tabs({ defaultValue, children, className }) {
  const [active, setActive] = React.useState(defaultValue);
  return (
    <div className={className}>
      {React.Children.map(children, (child) => {
        if (!child) return null;
        if (child.type === TabsList) return React.cloneElement(child, { active, setActive });
        if (child.type === TabsContent) return child.props.value === active ? child : null;
        return child;
      })}
    </div>
  );
}

export function TabsList({ children, active, setActive, className }) {
  return (
    <div className={cn("inline-flex h-10 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground w-full", className)}>
      {React.Children.map(children, (child) =>
        child ? React.cloneElement(child, { active, setActive }) : null
      )}
    </div>
  );
}

export function TabsTrigger({ value, children, active, setActive, className }) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-all flex-1",
        active === value ? "bg-background text-foreground shadow-sm" : "hover:text-foreground",
        className
      )}
      onClick={() => setActive(value)}
    >{children}</button>
  );
}

export function TabsContent({ children, className }) {
  return <div className={cn("mt-2", className)}>{children}</div>;
}

// ── Toggle Switch ──
export function Toggle({ checked, onChange, id }) {
  return (
    <button
      id={id} role="switch" aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
        checked ? "bg-red-600" : "bg-gray-300 dark:bg-gray-600"
      )}
    >
      <span className={cn(
        "inline-block h-4 w-4 rounded-full bg-white transition-transform",
        checked ? "translate-x-6" : "translate-x-1"
      )} />
    </button>
  );
}

// ── Dialog ──
export function Dialog({ open, onClose, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative z-50 w-full max-w-md mx-4 bg-background rounded-xl border shadow-xl p-6 max-h-[90vh] overflow-y-auto">
        {children}
      </div>
    </div>
  );
}

// ── Separator ──
export function Separator({ className }) {
  return <div className={cn("shrink-0 bg-border h-[1px] w-full", className)} />;
}

// ── Avatar ──
export function Avatar({ className, children }) {
  return <div className={cn("relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full", className)}>{children}</div>;
}

export function AvatarFallback({ className, children }) {
  return <div className={cn("flex h-full w-full items-center justify-center rounded-full bg-muted", className)}>{children}</div>;
}
