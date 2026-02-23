import { useAuth } from "@/context/AuthContext";
import { usePathname } from "next/navigation";
import { 
  Building2, 
  LayoutDashboard, 
  Users, 
  Kanban, 
  PhoneCall,
  Settings,
  LogOut,
  Menu
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState } from "react";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Pipeline", href: "/pipeline", icon: Kanban },
  { name: "Leads", href: "/leads", icon: Users },
  { name: "Calls & Tasks", href: "/tasks", icon: PhoneCall },
];

export function Sidebar() {
  const pathname = usePathname();
  const { profile, signOut } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className={cn(
      "flex flex-col h-screen bg-slate-900 text-slate-300 transition-all duration-300",
      collapsed ? "w-20" : "w-64"
    )}>
      {/* Logo & Toggle */}
      <div className="flex items-center justify-between h-16 px-4 py-4 border-b border-slate-800">
        {!collapsed && (
          <div className="flex items-center gap-2 text-white font-bold text-lg">
            <Building2 className="text-primary" />
            <span>SA Reality</span>
          </div>
        )}
        {collapsed && <Building2 className="text-primary w-full" />}
        
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-slate-400 hover:text-white"
          onClick={() => setCollapsed(!collapsed)}
        >
          <Menu size={20} />
        </Button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <a
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
                isActive 
                  ? "bg-primary text-white font-medium" 
                  : "hover:bg-slate-800 hover:text-white"
              )}
            >
              <item.icon size={20} className={cn(isActive ? "text-white" : "text-slate-400")} />
              {!collapsed && <span>{item.name}</span>}
            </a>
          );
        })}

        {/* Admin Section (Only visible to Admin+) */}
        {(profile?.role === "admin" || profile?.role === "super_admin") && (
          <>
            <div className={cn("pt-4 pb-2 px-3 text-xs font-semibold text-slate-500 uppercase", collapsed && "hidden")}>
              Administration
            </div>
            <a
              href="/settings"
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
                pathname.startsWith("/settings") 
                  ? "bg-primary text-white font-medium" 
                  : "hover:bg-slate-800 hover:text-white"
              )}
            >
              <Settings size={20} className="text-slate-400" />
              {!collapsed && <span>Settings</span>}
            </a>
          </>
        )}
      </nav>

      {/* User Profile / Footer */}
      <div className="p-4 border-t border-slate-800">
        <div className={cn("flex items-center gap-3", collapsed ? "justify-center" : "")}>
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
            {profile?.name?.charAt(0) || "U"}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{profile?.name || "User"}</p>
              <p className="text-xs text-slate-500 capitalize">{profile?.role?.replace("_", " ")}</p>
            </div>
          )}
        </div>
        {!collapsed && (
          <Button 
            variant="ghost" 
            className="w-full mt-4 justify-start text-slate-400 hover:text-rose-400 hover:bg-slate-800"
            onClick={signOut}
          >
            <LogOut size={18} className="mr-2" />
            Sign Out
          </Button>
        )}
        {collapsed && (
          <Button 
            variant="ghost" 
            size="icon"
            className="w-full mt-4 text-slate-400 hover:text-rose-400 hover:bg-slate-800"
            onClick={signOut}
          >
            <LogOut size={18} />
          </Button>
        )}
      </div>
    </div>
  );
}
