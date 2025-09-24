import * as React from "react"
import { cn } from "../lib/utils"  // or "@/lib/utils" if you set up alias in vite.config.ts

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export function Button({ className, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors " +
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring " +
          "disabled:pointer-events-none disabled:opacity-50 " +
          "bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2",
        className
      )}
      {...props}
    />
  )
}
