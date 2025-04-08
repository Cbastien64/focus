
import React from 'react';
import { 
  Sidebar as ShadcnSidebar, 
  SidebarContent, 
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  SidebarFooter
} from '@/components/ui/sidebar';
import { CheckSquare, Clock, LayoutGrid, Calendar, Settings, Folder, Home, BarChart, Users } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar: React.FC = () => {
  const location = useLocation();
  
  const isActive = (path: string) => location.pathname === path;

  const menuItems = [
    { title: "Accueil", icon: Home, path: "/" },
    { title: "Tâches", icon: CheckSquare, path: "/tasks" },
    { title: "Timer", icon: Clock, path: "/timer" },
    { title: "Matrice", icon: LayoutGrid, path: "/matrix" },
    { title: "Agenda", icon: Calendar, path: "/calendar" },
    { title: "Projets", icon: Folder, path: "/projects" },
    { title: "Collaborateurs", icon: Users, path: "/collaborators" },
    { title: "Données", icon: BarChart, path: "/data" },
  ];

  return (
    <ShadcnSidebar>
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2">
          <Clock className="h-6 w-6 text-focus" />
          <span className="font-bold text-xl">FocusMix</span>
        </div>
        <SidebarTrigger className="ml-auto" />
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton className={isActive(item.path) ? "bg-secondary" : ""} asChild>
                    <Link to={item.path} className="flex items-center gap-3">
                      <item.icon className="h-5 w-5" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter className="p-4 flex items-center">
        <Link to="/settings" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <Settings className="h-4 w-4" />
          <span>Paramètres</span>
        </Link>
      </SidebarFooter>
    </ShadcnSidebar>
  );
};

export default Sidebar;
