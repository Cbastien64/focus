
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
  SidebarFooter,
  SidebarRail
} from '@/components/ui/sidebar';
import { CheckSquare, Clock, LayoutGrid, Calendar, Settings, Folder, Home, BarChart, Users, Hourglass, Timer } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import TimerDisplay from '@/components/timer/TimerDisplay';
import StopwatchDisplay from '@/components/timer/StopwatchDisplay';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

const Sidebar: React.FC = () => {
  const location = useLocation();
  
  const isActive = (path: string) => location.pathname === path;

  const menuItems = [
    { title: "Accueil", icon: Home, path: "/" },
    { title: "Tâches", icon: CheckSquare, path: "/tasks" },
    { title: "Timer", icon: Hourglass, path: "/timer" },
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

        {/* Time Management Section */}
        <SidebarGroup>
          <SidebarGroupLabel>Gestion du temps</SidebarGroupLabel>
          <SidebarGroupContent>
            <Card className="overflow-hidden bg-sidebar border-sidebar-border">
              <CardContent className="p-3">
                <Tabs defaultValue="timer" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-3">
                    <TabsTrigger value="timer">
                      <Hourglass className="h-4 w-4 mr-2" />
                      Timer
                    </TabsTrigger>
                    <TabsTrigger value="stopwatch">
                      <Timer className="h-4 w-4 mr-2" />
                      Chrono
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="timer" className="flex justify-center py-2">
                    <TimerDisplay />
                  </TabsContent>
                  <TabsContent value="stopwatch" className="flex justify-center py-2">
                    <StopwatchDisplay />
                  </TabsContent>
                </Tabs>
              </CardContent>
              <CardFooter className="bg-muted/50 justify-center p-2">
                <Link to="/timer">
                  <Button variant="outline" size="sm" className="w-full">
                    Voir en plein écran
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter className="p-4 flex items-center">
        <Link to="/settings" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <Settings className="h-4 w-4" />
          <span>Paramètres</span>
        </Link>
      </SidebarFooter>

      {/* Add this rail to ensure the sidebar can be reopened when closed */}
      <SidebarRail />
    </ShadcnSidebar>
  );
};

export default Sidebar;
