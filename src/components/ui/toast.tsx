import * as React from "react"
import { cn } from "@/lib/utils"

export interface ToastProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "destructive" | "success"
}

const Toast = React.forwardRef<HTMLDivElement, ToastProps>(
  ({ className, variant = "default", ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "fixed top-4 right-4 z-50 flex w-full max-w-sm items-center space-x-2 rounded-md border p-4 shadow-lg transition-all",
          {
            "border-gray-200 bg-white text-gray-900": variant === "default",
            "border-red-500 bg-red-50 text-red-900": variant === "destructive",
            "border-green-500 bg-green-50 text-green-900": variant === "success",
          },
          className
        )}
        {...props}
      />
    )
  }
)
Toast.displayName = "Toast"

export { Toast }

// Simple toast context for global state
const ToastContext = React.createContext<{
  toasts: Array<{ id: string; message: string; variant?: "default" | "destructive" | "success" }>
  addToast: (message: string, variant?: "default" | "destructive" | "success") => void
  removeToast: (id: string) => void
} | null>(null)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Array<{
    id: string
    message: string
    variant?: "default" | "destructive" | "success"
  }>>([])

  const addToast = React.useCallback((message: string, variant: "default" | "destructive" | "success" = "default") => {
    const id = Math.random().toString(36).substr(2, 9)
    setToasts(prev => [...prev, { id, message, variant }])
    
    // Auto remove after 3 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id))
    }, 3000)
  }, [])

  const removeToast = React.useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map(({ id, message, variant }) => (
          <Toast
            key={id}
            variant={variant}
            onClick={() => removeToast(id)}
            className="cursor-pointer"
          >
            {message}
          </Toast>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = React.useContext(ToastContext)
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider")
  }
  return context
}
