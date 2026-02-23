"use client";

import { useAuth } from "@/context/AuthContext";
import { format } from "date-fns";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Topbar() {
  const { profile } = useAuth();
  
  // E.g., "Monday, 14 Aug 2026"
  const todayDate = format(new Date(), "EEEE, d MMM yyyy");

  return (
    <header className="h-16 border-b bg-white flex items-center justify-between px-6 shrink-0">
      <div>
        <h2 className="text-xl font-semibold text-slate-800">
          Welcome back, {profile?.name?.split(' ')[0] || "Team"}
        </h2>
        <p className="text-sm text-slate-500">{todayDate}</p>
      </div>

      <div className="flex items-center gap-4">
        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" className="relative text-slate-500">
              <Bell size={18} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full"></span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="flex flex-col items-start p-3 gap-1">
              <p className="text-sm font-medium">Task Overdue</p>
              <p className="text-xs text-slate-500">Call &apos;Amit Sharma&apos; is 24h overdue.</p>
            </DropdownMenuItem>
            <DropdownMenuItem className="flex flex-col items-start p-3 gap-1">
              <p className="text-sm font-medium">New Lead Assigned</p>
              <p className="text-xs text-slate-500">Priya Singh from 99Acres</p>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
