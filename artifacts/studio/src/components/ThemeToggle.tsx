import React from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/ThemeProvider";
import { HEADER_ICON_QUIET } from "@/components/layout/headerControls";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  // The box comes from headerControls — it is shared with the menu button beside
  // it, which used to be 44×44 with a 12px radius while this one was 36×36 with a
  // 6px one. The `h-9 w-9` that stood here was also a re-type of what the `icon`
  // size variant already sets.
  return (
    <Button variant="ghost" size="icon" onClick={toggleTheme} className={HEADER_ICON_QUIET}>
      {theme === "dark" ? (
        <Moon className="h-4 w-4" />
      ) : (
        <Sun className="h-4 w-4" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
