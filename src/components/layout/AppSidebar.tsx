import { 
  LayoutDashboard, 
  ListTodo, 
  BarChart3, 
  Settings, 
  Sparkles,
  Zap,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface NavItem {
  icon: React.ElementType;
  label: string;
  href: string;
  active?: boolean;
  badge?: string;
}

const navItems: NavItem[] = [
  { icon: LayoutDashboard, label: 'Sprint', href: '#', active: true },
  { icon: ListTodo, label: 'Backlog', href: '#' },
  { icon: BarChart3, label: 'Reports', href: '#', badge: 'New' },
  { icon: Settings, label: 'Settings', href: '#' },
];

export function AppSidebar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside 
      className={cn(
        "h-screen bg-sidebar flex flex-col border-r border-sidebar-border transition-all duration-300",
        collapsed ? "w-16" : "w-60"
      )}
      style={{ background: 'var(--gradient-sidebar)' }}
    >
      {/* Logo */}
      <div className={cn(
        "h-16 flex items-center border-b border-sidebar-border px-4",
        collapsed ? "justify-center" : "gap-3"
      )}>
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
          <Zap className="w-5 h-5 text-primary-foreground" />
        </div>
        {!collapsed && (
          <span className="font-semibold text-lg text-sidebar-foreground">
            SprintPilot
          </span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-2 space-y-1">
        {navItems.map((item) => (
          <a
            key={item.label}
            href={item.href}
            className={cn(
              "sidebar-item",
              item.active && "sidebar-item-active",
              collapsed && "justify-center px-0"
            )}
          >
            <item.icon className="w-5 h-5 shrink-0" />
            {!collapsed && (
              <>
                <span className="flex-1">{item.label}</span>
                {item.badge && (
                  <span className="px-2 py-0.5 text-xs font-medium bg-primary text-primary-foreground rounded-full">
                    {item.badge}
                  </span>
                )}
              </>
            )}
          </a>
        ))}
      </nav>

      {/* AI Status Card */}
      {!collapsed && (
        <div className="mx-3 mb-4 p-3 rounded-lg bg-sidebar-accent/50 border border-sidebar-border">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-sidebar-foreground">AI Copilot</span>
          </div>
          <p className="text-xs text-sidebar-foreground/60">
            Analyzing sprint data...
          </p>
          <div className="mt-2 h-1 bg-sidebar-border rounded-full overflow-hidden">
            <div className="h-full w-3/4 bg-primary rounded-full animate-pulse-soft" />
          </div>
        </div>
      )}

      {/* Collapse Toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="h-12 flex items-center justify-center border-t border-sidebar-border text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
      >
        {collapsed ? (
          <ChevronRight className="w-5 h-5" />
        ) : (
          <ChevronLeft className="w-5 h-5" />
        )}
      </button>
    </aside>
  );
}
