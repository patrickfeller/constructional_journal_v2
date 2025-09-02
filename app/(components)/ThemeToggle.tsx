"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

export function ModeToggle() {
  const [theme, setTheme] = React.useState<'light' | 'dark' | 'system'>('system');

  React.useEffect(() => {
    // Prevent hydration mismatch by checking if we're on client
    if (typeof window === 'undefined') return;
    
    console.log('🚀 ThemeToggle mounted, checking localStorage...');
    
    // Get theme from localStorage on mount
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | 'system';
    console.log('💾 Saved theme from localStorage:', savedTheme);
    
    if (savedTheme) {
      setTheme(savedTheme);
      if (savedTheme === 'system') {
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        applyTheme(systemPrefersDark ? 'dark' : 'light');
      } else {
        applyTheme(savedTheme);
      }
    } else {
      // Check system preference
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const defaultTheme = systemPrefersDark ? 'dark' : 'light';
      console.log('💻 System prefers dark:', systemPrefersDark, 'Default theme:', defaultTheme);
      setTheme('system');
      applyTheme(defaultTheme);
    }
  }, []);

  const applyTheme = (newTheme: 'light' | 'dark') => {
    const root = document.documentElement;
    console.log('🎨 Applying theme:', newTheme);
    console.log('📝 Before - HTML classes:', root.className);
    
    if (newTheme === 'dark') {
      root.classList.add('dark');
      console.log('🌙 Added dark class');
    } else {
      root.classList.remove('dark');
      console.log('☀️ Removed dark class');
    }
    
    console.log('📝 After - HTML classes:', root.className);
    console.log('🔍 Dark class present:', root.classList.contains('dark'));
  };

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    
    if (newTheme === 'system') {
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      applyTheme(systemPrefersDark ? 'dark' : 'light');
    } else {
      applyTheme(newTheme);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleThemeChange("light")}>
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleThemeChange("dark")}>
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleThemeChange("system")}>
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}




