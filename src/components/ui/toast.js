import React, { createContext, useContext, useState, useCallback, useMemo } from "react";

const ToastContext = createContext(undefined);

let toastIdCounter = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = "default") => {
    const id = ++toastIdCounter;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  const toast = useMemo(() => {
    const fn = (msg) => addToast(msg, "default");
    fn.success = (msg) => addToast(msg, "success");
    fn.error = (msg) => addToast(msg, "error");
    fn.info = (msg) => addToast(msg, "info");
    return fn;
  }, [addToast]);

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-sm">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`px-4 py-3 rounded-lg shadow-lg text-sm font-medium animate-slide-in ${
              t.type === "success" ? "bg-green-600 text-white" :
              t.type === "error" ? "bg-red-600 text-white" :
              t.type === "info" ? "bg-blue-600 text-white" :
              "bg-foreground text-background"
            }`}
          >
            {t.message}
          </div>
        ))}
      </div>
      <style>{`
        @keyframes slide-in { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        .animate-slide-in { animation: slide-in 0.3s ease-out; }
      `}</style>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within ToastProvider");
  return context;
}
