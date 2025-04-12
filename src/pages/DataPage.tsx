
import React, { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { useTaskContext } from '@/context/TaskContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  PieChart, Pie, BarChart, Bar, XAxis, YAxis, Tooltip, 
  ResponsiveContainer, Cell, LineChart, Line, Legend, CartesianGrid 
} from 'recharts';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart2, PieChart as PieChartIcon, LineChart as LineChartIcon, 
  Table as TableIcon, Calendar, Clock, Hash, Users, Layers, Timer, 
  Calendar as CalendarIcon, TrendingUp
} from 'lucide-react';
import { format, subDays, differenceInDays, isAfter, isBefore, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from "@/components/ui/pagination";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

// Helper function to extract hashtags from text
const extractHashtags = (text: string): string[] => {
  const hashtagRegex = /#(\w+)/g;
  const matches = text.match(hashtagRegex);
  return matches ? matches.map(tag => tag.toLowerCase()) : [];
};

// Helper function to format time
const formatTime = (seconds: number) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
};

const COLORS = [
  '#9b87f5', '#7E69AB', '#6E59A5', '#D6BCFA', '#8B5CF6',
  '#D946EF', '#F97316', '#0EA5E9', '#1EAEDB', '#33C3F0'
];

const STATUS_COLORS = {
  'todo': '#F2FCE2',
  'in-progress': '#FEC6A1',
  'completed': '#FFDEE2'
};

const PRIORITY_COLORS = {
  'both': '#ff6b6b',
  'important': '#4d96ff',
  'urgent': '#ffb55a',
  'neither': '#a0a0a0'
};

const DataPage = () => {
  const { tasks, tags, collaborators } = useTaskContext();
  const [activeTab, setActiveTab] = useState("overview");
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const tasksPerPage = 8;
  
  // Function to open task details
  const openTaskDetails = (task: any) => {
    setSelectedTask(task);
    setDetailsOpen(true);
  };
  
  // Calculate time periods
  const today = new Date();
  const lastWeek = subDays(today, 7);
  const lastMonth = subDays(today, 30);
  
  // Filter tasks by time period
  const todayTasks = tasks.filter(task => {
    const taskDate = new Date(task.createdAt);
    return taskDate.toDateString() === today.toDateString();
  });
  
  const weekTasks = tasks.filter(task => {
    const taskDate = new Date(task.createdAt);
    return isAfter(taskDate, lastWeek);
  });
  
  const monthTasks = tasks.filter(task => {
    const taskDate = new Date(task.createdAt);
    return isAfter(taskDate, lastMonth);
  });
  
  // Calculate upcoming due tasks
  const upcomingTasks = tasks.filter(task => {
    if (!task.dueDate) return false;
    const dueDate = new Date(task.dueDate);
    return isAfter(dueDate, today) && task.status !== 'completed';
  }).sort((a, b) => {
    const dateA = new Date(a.dueDate!).getTime();
    const dateB = new Date(b.dueDate!).getTime();
    return dateA - dateB;
  });
  
  // Calculate overdue tasks
  const overdueTasks = tasks.filter(task => {
    if (!task.dueDate) return false;
    const dueDate = new Date(task.dueDate);
    return isBefore(dueDate, today) && task.status !== 'completed';
  });
  
  // Calculate task completion rate
  const completionRate = tasks.length > 0 
    ? Math.round((tasks.filter(task => task.status === 'completed').length / tasks.length) * 100) 
    : 0;
  
  // Data for time spent by project
  const projectTimeData = tags.map(tag => {
    const tasksInTag = tasks.filter(task => task.tags.some(t => t.id === tag.id));
    const timeSpent = tasksInTag.reduce((acc, task) => acc + task.timeSpent, 0);
    return {
      name: tag.name,
      value: timeSpent,
      color: tag.color
    };
  }).filter(data => data.value > 0);

  // Data for task status distribution
  const statusData = [
    { name: 'À faire', value: tasks.filter(task => task.status === 'todo').length },
    { name: 'En cours', value: tasks.filter(task => task.status === 'in-progress').length },
    { name: 'Terminé', value: tasks.filter(task => task.status === 'completed').length },
  ];
  
  // Data for task priorities
  const priorityData = [
    { name: 'Important & Urgent', value: tasks.filter(task => task.priority === 'both').length },
    { name: 'Important', value: tasks.filter(task => task.priority === 'important').length },
    { name: 'Urgent', value: tasks.filter(task => task.priority === 'urgent').length },
    { name: 'Standard', value: tasks.filter(task => task.priority === 'neither').length },
  ];
  
  // Extract and count hashtags in task titles and descriptions
  const hashtagData = React.useMemo(() => {
    const hashtagCounts: Record<string, number> = {};
    
    tasks.forEach(task => {
      const titleHashtags = extractHashtags(task.title);
      const descHashtags = extractHashtags(task.description);
      const allHashtags = [...titleHashtags, ...descHashtags];
      
      allHashtags.forEach(tag => {
        hashtagCounts[tag] = (hashtagCounts[tag] || 0) + 1;
      });
    });
    
    return Object.entries(hashtagCounts)
      .map(([hashtag, count]) => ({ name: hashtag, value: count }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10); // Top 10 hashtags
  }, [tasks]);
  
  // Data for tasks by collaborator
  const collaboratorData = collaborators.map(collab => {
    const collabTasks = tasks.filter(task => task.assignedTo?.id === collab.id);
    return {
      name: `${collab.firstName} ${collab.lastName}`,
      value: collabTasks.length,
      completed: collabTasks.filter(task => task.status === 'completed').length,
      timeSpent: collabTasks.reduce((acc, task) => acc + task.timeSpent, 0)
    };
  }).filter(data => data.value > 0);
  
  // Data for time tracking over time (weekly)
  const timeTrackingData = React.useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = subDays(today, 6 - i);
      return {
        date,
        name: format(date, 'EEE', { locale: fr }),
        fullDate: format(date, 'yyyy-MM-dd')
      };
    });
    
    return last7Days.map(day => {
      const dayTasks = tasks.filter(task => {
        // Assuming we have some timeEntries array on tasks, if not we'll estimate by createdAt
        return format(new Date(task.createdAt), 'yyyy-MM-dd') === day.fullDate;
      });
      
      const timeSpent = dayTasks.reduce((acc, task) => acc + task.timeSpent, 0);
      
      return {
        name: day.name,
        value: Math.round(timeSpent / 60), // Convert to minutes for better visualization
        date: day.fullDate
      };
    });
  }, [tasks, today]);
  
  // Calculate task aging data (how long tasks have been in each status)
  const taskAgingData = React.useMemo(() => {
    const statusGroups = {
      'todo': [] as number[],
      'in-progress': [] as number[],
      'completed': [] as number[]
    };
    
    tasks.forEach(task => {
      const age = differenceInDays(today, new Date(task.createdAt));
      if (statusGroups[task.status]) {
        statusGroups[task.status].push(age);
      }
    });
    
    // Calculate average age for each status
    return Object.entries(statusGroups).map(([status, ages]) => {
      const avgAge = ages.length > 0 
        ? ages.reduce((acc, age) => acc + age, 0) / ages.length 
        : 0;
      
      return {
        name: status === 'todo' ? 'À faire' : 
              status === 'in-progress' ? 'En cours' : 'Terminé',
        value: Math.round(avgAge)
      };
    });
  }, [tasks, today]);
  
  // Pagination logic for task table
  const indexOfLastTask = currentPage * tasksPerPage;
  const indexOfFirstTask = indexOfLastTask - tasksPerPage;
  const currentTasks = tasks.slice(indexOfFirstTask, indexOfLastTask);
  const totalPages = Math.ceil(tasks.length / tasksPerPage);
  
  const getPriorityBadge = (priority: string) => {
    switch(priority) {
      case 'both':
        return <Badge style={{ backgroundColor: PRIORITY_COLORS.both }}>Important & Urgent</Badge>;
      case 'important':
        return <Badge style={{ backgroundColor: PRIORITY_COLORS.important }}>Important</Badge>;
      case 'urgent':
        return <Badge style={{ backgroundColor: PRIORITY_COLORS.urgent }}>Urgent</Badge>;
      default:
        return <Badge style={{ backgroundColor: PRIORITY_COLORS.neither }}>Standard</Badge>;
    }
  };
  
  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'todo':
        return <Badge style={{ backgroundColor: STATUS_COLORS.todo, color: '#2e7d32' }}>À faire</Badge>;
      case 'in-progress':
        return <Badge style={{ backgroundColor: STATUS_COLORS['in-progress'], color: '#e65100' }}>En cours</Badge>;
      case 'completed':
        return <Badge style={{ backgroundColor: STATUS_COLORS.completed, color: '#c2185b' }}>Terminé</Badge>;
      default:
        return <Badge>Inconnu</Badge>;
    }
  };
  
  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto py-6 px-4">
        <h1 className="text-2xl font-bold mb-2">Analyse des données</h1>
        <p className="text-muted-foreground mb-6">Vue d'ensemble et analyse détaillée des tâches et projets</p>
        
        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-4 bg-card">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart2 className="h-4 w-4" /> Vue d'ensemble
            </TabsTrigger>
            <TabsTrigger value="projects" className="flex items-center gap-2">
              <Layers className="h-4 w-4" /> Projets
            </TabsTrigger>
            <TabsTrigger value="time" className="flex items-center gap-2">
              <Clock className="h-4 w-4" /> Temps
            </TabsTrigger>
            <TabsTrigger value="tasks" className="flex items-center gap-2">
              <TableIcon className="h-4 w-4" /> Tâches
            </TabsTrigger>
            <TabsTrigger value="team" className="flex items-center gap-2">
              <Users className="h-4 w-4" /> Équipe
            </TabsTrigger>
          </TabsList>
          
          {/* Overview Tab Content */}
          <TabsContent value="overview" className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-sm font-medium">Tâches totales</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="text-3xl font-bold">{tasks.length}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    <span className="text-green-500">{tasks.filter(t => t.status === 'completed').length} terminées</span> • 
                    <span className="text-orange-500 ml-1">{tasks.filter(t => t.status === 'in-progress').length} en cours</span> •
                    <span className="text-blue-500 ml-1">{tasks.filter(t => t.status === 'todo').length} à faire</span>
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-sm font-medium">Taux de complétion</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="text-3xl font-bold">{completionRate}%</div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                    <div className="bg-green-500 h-2.5 rounded-full" style={{ width: `${completionRate}%` }}></div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-sm font-medium">Temps total</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="text-3xl font-bold">
                    {formatTime(tasks.reduce((acc, task) => acc + task.timeSpent, 0))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Sur {projectTimeData.length} projets
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-sm font-medium">Tâches à venir</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="text-3xl font-bold">{upcomingTasks.length}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    <span className="text-red-500">{overdueTasks.length} en retard</span>
                  </p>
                </CardContent>
              </Card>
            </div>
            
            {/* Main Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <PieChartIcon className="h-5 w-5" />
                    Distribution par statut
                  </CardTitle>
                </CardHeader>
                <CardContent className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusData}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {statusData.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={Object.values(STATUS_COLORS)[index % Object.values(STATUS_COLORS).length]} 
                          />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => [`${value} tâches`, 'Quantité']} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <PieChartIcon className="h-5 w-5" />
                    Distribution par priorité
                  </CardTitle>
                </CardHeader>
                <CardContent className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={priorityData}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {priorityData.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={Object.values(PRIORITY_COLORS)[index % Object.values(PRIORITY_COLORS).length]} 
                          />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => [`${value} tâches`, 'Quantité']} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
            
            {/* Activity Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Hash className="h-5 w-5" />
                    Tags populaires
                  </CardTitle>
                </CardHeader>
                <CardContent className="h-80">
                  {hashtagData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={hashtagData} layout="vertical">
                        <XAxis type="number" />
                        <YAxis dataKey="name" type="category" width={100} />
                        <Tooltip formatter={(value: number) => [`${value} occurrences`, 'Fréquence']} />
                        <Bar dataKey="value" name="Occurrences">
                          {hashtagData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-muted-foreground">Aucun tag trouvé</p>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <LineChartIcon className="h-5 w-5" />
                    Activité de la semaine
                  </CardTitle>
                </CardHeader>
                <CardContent className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={timeTrackingData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis 
                        label={{ value: 'Minutes', angle: -90, position: 'insideLeft' }} 
                      />
                      <Tooltip 
                        formatter={(value: number) => [`${value} min`, 'Temps passé']}
                        labelFormatter={(label) => `${label}`}
                      />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="value" 
                        name="Temps (min)" 
                        stroke="#9b87f5" 
                        activeDot={{ r: 8 }} 
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Projects Tab Content */}
          <TabsContent value="projects" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Temps passé par projet
                  </CardTitle>
                </CardHeader>
                <CardContent className="h-80">
                  {projectTimeData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={projectTimeData}
                          cx="50%"
                          cy="50%"
                          labelLine={true}
                          label={({ name, value }) => `${name}: ${formatTime(value)}`}
                          outerRadius={80}
                          dataKey="value"
                        >
                          {projectTimeData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value: number) => formatTime(value)} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-muted-foreground">Aucune donnée disponible</p>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Layers className="h-5 w-5" />
                    Tâches par projet
                  </CardTitle>
                </CardHeader>
                <CardContent className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart 
                      data={tags.map(tag => {
                        const tasksInTag = tasks.filter(task => task.tags.some(t => t.id === tag.id));
                        const completedTasks = tasksInTag.filter(task => task.status === 'completed');
                        
                        return {
                          name: tag.name,
                          total: tasksInTag.length,
                          completed: completedTasks.length,
                          color: tag.color
                        };
                      }).filter(data => data.total > 0)}
                      layout="vertical"
                      margin={{ left: 120 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis 
                        dataKey="name" 
                        type="category" 
                        width={100} 
                        tick={{ fill: '#888' }}
                      />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="total" name="Total" fill="#9b87f5">
                        {tags.map((tag, index) => (
                          <Cell key={`cell-${index}`} fill={tag.color} />
                        ))}
                      </Bar>
                      <Bar dataKey="completed" name="Terminées" fill="#4ce0b3">
                        {tags.map((tag, index) => (
                          <Cell key={`cell-${index}`} fill="#4ce0b3" />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Âge moyen des tâches par statut (jours)
                </CardTitle>
              </CardHeader>
              <CardContent className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={taskAgingData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis label={{ value: 'Jours', angle: -90, position: 'insideLeft' }} />
                    <Tooltip formatter={(value: number) => [`${value} jours`, 'Âge moyen']} />
                    <Bar dataKey="value" name="Âge moyen (jours)">
                      {taskAgingData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={index === 0 ? '#F2FCE2' : index === 1 ? '#FEC6A1' : '#FFDEE2'} 
                          stroke={index === 0 ? '#2e7d32' : index === 1 ? '#e65100' : '#c2185b'}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Time Tab Content */}
          <TabsContent value="time" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-sm font-medium">Aujourd'hui</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="text-3xl font-bold">
                    {formatTime(todayTasks.reduce((acc, task) => acc + task.timeSpent, 0))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Sur {todayTasks.length} tâches
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-sm font-medium">Cette semaine</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="text-3xl font-bold">
                    {formatTime(weekTasks.reduce((acc, task) => acc + task.timeSpent, 0))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Sur {weekTasks.length} tâches
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-sm font-medium">Ce mois</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="text-3xl font-bold">
                    {formatTime(monthTasks.reduce((acc, task) => acc + task.timeSpent, 0))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Sur {monthTasks.length} tâches
                  </p>
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <LineChartIcon className="h-5 w-5" />
                  Activité des 7 derniers jours
                </CardTitle>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={timeTrackingData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis label={{ value: 'Minutes', angle: -90, position: 'insideLeft' }} />
                    <Tooltip 
                      formatter={(value: number) => [`${value} min`, 'Temps passé']}
                      labelFormatter={(label) => `${label}`}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      name="Temps (min)" 
                      stroke="#9b87f5" 
                      activeDot={{ r: 8 }} 
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Temps passé par collaborateur
                </CardTitle>
              </CardHeader>
              <CardContent className="h-80">
                {collaboratorData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={collaboratorData} layout="vertical" margin={{ left: 130 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" width={120} />
                      <Tooltip formatter={(value: number, name) => {
                        if (name === "timeSpent") return [formatTime(value), "Temps passé"];
                        return [value.toString(), name];
                      }} />
                      <Legend />
                      <Bar dataKey="timeSpent" name="Temps passé" fill="#9b87f5" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-muted-foreground">Aucune donnée disponible</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Tasks Tab Content */}
          <TabsContent value="tasks" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-sm font-medium">À venir</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <ScrollArea className="h-60">
                    {upcomingTasks.length > 0 ? (
                      <div className="space-y-2">
                        {upcomingTasks.slice(0, 5).map((task) => (
                          <div 
                            key={task.id} 
                            className="flex justify-between items-center p-2 rounded-md border hover:bg-muted/50 cursor-pointer"
                            onClick={() => openTaskDetails(task)}
                          >
                            <div>
                              <div className="font-medium text-sm truncate max-w-[200px]">{task.title}</div>
                              <div className="text-xs text-muted-foreground">
                                {task.dueDate && format(new Date(task.dueDate), 'dd/MM/yyyy')}
                              </div>
                            </div>
                            {getPriorityBadge(task.priority)}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-center py-4">Aucune tâche à venir</p>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-sm font-medium">En retard</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <ScrollArea className="h-60">
                    {overdueTasks.length > 0 ? (
                      <div className="space-y-2">
                        {overdueTasks.slice(0, 5).map((task) => (
                          <div 
                            key={task.id} 
                            className="flex justify-between items-center p-2 rounded-md border hover:bg-muted/50 cursor-pointer"
                            onClick={() => openTaskDetails(task)}
                          >
                            <div>
                              <div className="font-medium text-sm truncate max-w-[200px]">{task.title}</div>
                              <div className="text-xs text-red-500">
                                {task.dueDate && `Dû ${format(new Date(task.dueDate), 'dd/MM/yyyy')}`}
                              </div>
                            </div>
                            {getPriorityBadge(task.priority)}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-center py-4">Aucune tâche en retard</p>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-sm font-medium">Récemment complétées</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <ScrollArea className="h-60">
                    {tasks.filter(t => t.status === 'completed').length > 0 ? (
                      <div className="space-y-2">
                        {tasks
                          .filter(t => t.status === 'completed')
                          .sort((a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime())
                          .slice(0, 5)
                          .map((task) => (
                            <div 
                              key={task.id} 
                              className="flex justify-between items-center p-2 rounded-md border hover:bg-muted/50 cursor-pointer"
                              onClick={() => openTaskDetails(task)}
                            >
                              <div>
                                <div className="font-medium text-sm truncate max-w-[200px]">{task.title}</div>
                                <div className="text-xs text-muted-foreground flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {formatTime(task.timeSpent)}
                                </div>
                              </div>
                              <Badge style={{ backgroundColor: STATUS_COLORS.completed, color: '#c2185b' }}>
                                Terminé
                              </Badge>
                            </div>
                          ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-center py-4">Aucune tâche complétée</p>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <TableIcon className="h-5 w-5" />
                  Liste des tâches
                </CardTitle>
                <CardDescription>
                  {tasks.length} tâches au total
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Titre</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead>Priorité</TableHead>
                        <TableHead>Temps passé</TableHead>
                        <TableHead>Date d'échéance</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentTasks.length > 0 ? (
                        currentTasks.map((task) => (
                          <TableRow 
                            key={task.id}
                            className="cursor-pointer hover:bg-muted/50"
                            onClick={() => openTaskDetails(task)}
                          >
                            <TableCell className="font-medium">
                              <div className="truncate max-w-[250px]">{task.title}</div>
                              {task.tags.length > 0 && (
                                <div className="flex gap-1 mt-1">
                                  {task.tags.slice(0, 2).map((tag) => (
                                    <Badge 
                                      key={tag.id} 
                                      style={{ backgroundColor: tag.color, color: 'white' }}
                                      className="text-xs"
                                    >
                                      {tag.name}
                                    </Badge>
                                  ))}
                                  {task.tags.length > 2 && (
                                    <Badge variant="outline" className="text-xs">
                                      +{task.tags.length - 2}
                                    </Badge>
                                  )}
                                </div>
                              )}
                            </TableCell>
                            <TableCell>{getStatusBadge(task.status)}</TableCell>
                            <TableCell>{getPriorityBadge(task.priority)}</TableCell>
                            <TableCell>{formatTime(task.timeSpent)}</TableCell>
                            <TableCell>
                              {task.dueDate ? (
                                format(new Date(task.dueDate), 'dd/MM/yyyy')
                              ) : (
                                <span className="text-muted-foreground">Non définie</span>
                              )}
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center">
                            Aucune tâche trouvée
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
                
                {tasks.length > tasksPerPage && (
                  <div className="mt-4">
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious 
                            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                          />
                        </PaginationItem>
                        
                        {Array.from({ length: totalPages }, (_, i) => i + 1)
                          .filter(page => {
                            if (totalPages <= 7) return true;
                            return page === 1 || 
                                   page === totalPages || 
                                   (page >= currentPage - 1 && page <= currentPage + 1);
                          })
                          .map((page, i, array) => {
                            // Add ellipsis
                            if (i > 0 && page > array[i - 1] + 1) {
                              return [
                                <PaginationItem key={`ellipsis-${page}`}>
                                  <PaginationEllipsis />
                                </PaginationItem>,
                                <PaginationItem key={page}>
                                  <PaginationLink 
                                    isActive={page === currentPage}
                                    onClick={() => setCurrentPage(page)}
                                  >
                                    {page}
                                  </PaginationLink>
                                </PaginationItem>
                              ];
                            }
                            return (
                              <PaginationItem key={page}>
                                <PaginationLink 
                                  isActive={page === currentPage}
                                  onClick={() => setCurrentPage(page)}
                                >
                                  {page}
                                </PaginationLink>
                              </PaginationItem>
                            );
                          })}
                        
                        <PaginationItem>
                          <PaginationNext 
                            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Team Tab Content */}
          <TabsContent value="team" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Performance de l'équipe
                </CardTitle>
              </CardHeader>
              <CardContent className="h-96">
                {collaboratorData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={collaboratorData} margin={{ left: 130 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value: number, name) => {
                        if (name === "timeSpent") return [formatTime(value), "Temps passé"];
                        return [value.toString(), name === "value" ? "Tâches totales" : "Tâches terminées"];
                      }} />
                      <Legend />
                      <Bar dataKey="value" name="Tâches totales" fill="#9b87f5" />
                      <Bar dataKey="completed" name="Tâches terminées" fill="#4ce0b3" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-muted-foreground">Aucune donnée disponible</p>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Timer className="h-5 w-5" />
                    Temps moyen par tâche
                  </CardTitle>
                </CardHeader>
                <CardContent className="h-80">
                  {collaboratorData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart 
                        data={collaboratorData.map(c => ({
                          name: c.name,
                          value: c.value > 0 ? Math.round(c.timeSpent / c.value / 60) : 0 // Average time in minutes
                        }))}
                        layout="vertical"
                        margin={{ left: 130 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" label={{ value: 'Minutes', position: 'insideBottom', offset: -5 }} />
                        <YAxis dataKey="name" type="category" width={120} />
                        <Tooltip formatter={(value: number) => [`${value} min`, 'Temps moyen par tâche']} />
                        <Bar dataKey="value" name="Moyenne (min)" fill="#7E69AB" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-muted-foreground">Aucune donnée disponible</p>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Taux de complétion
                  </CardTitle>
                </CardHeader>
                <CardContent className="h-80">
                  {collaboratorData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart 
                        data={collaboratorData.map(c => ({
                          name: c.name,
                          value: c.value > 0 ? Math.round((c.completed / c.value) * 100) : 0
                        }))}
                        layout="vertical"
                        margin={{ left: 130 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" domain={[0, 100]} label={{ value: '%', position: 'insideBottom', offset: -5 }} />
                        <YAxis dataKey="name" type="category" width={120} />
                        <Tooltip formatter={(value: number) => [`${value}%`, 'Taux de complétion']} />
                        <Bar dataKey="value" name="Taux de complétion (%)">
                          {collaboratorData.map((entry, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={COLORS[index % COLORS.length]} 
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-muted-foreground">Aucune donnée disponible</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
        
        {/* Task Details Dialog */}
        <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>{selectedTask?.title}</DialogTitle>
            </DialogHeader>
            
            {selectedTask && (
              <div className="space-y-4 mt-2">
                <div className="flex flex-wrap gap-2">
                  {getStatusBadge(selectedTask.status)}
                  {getPriorityBadge(selectedTask.priority)}
                  {selectedTask.dueDate && (
                    <Badge variant="outline" className="flex items-center gap-1">
                      <CalendarIcon className="h-3 w-3" />
                      {format(new Date(selectedTask.dueDate), 'dd/MM/yyyy')}
                    </Badge>
                  )}
                </div>
                
                <div className="text-sm">
                  {selectedTask.description || "Aucune description"}
                </div>
                
                {selectedTask.tags.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold mb-1">Projets</h4>
                    <div className="flex flex-wrap gap-1">
                      {selectedTask.tags.map((tag: any) => (
                        <Badge 
                          key={tag.id} 
                          style={{ backgroundColor: tag.color, color: 'white' }}
                          className="text-xs"
                        >
                          {tag.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {selectedTask.assignedTo && (
                  <div>
                    <h4 className="text-sm font-semibold mb-1">Assigné à</h4>
                    <div className="text-sm">{selectedTask.assignedTo.firstName} {selectedTask.assignedTo.lastName}</div>
                  </div>
                )}
                
                <div className="flex items-center gap-4">
                  <div>
                    <h4 className="text-sm font-semibold mb-1">Temps passé</h4>
                    <div className="text-sm flex items-center gap-1">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      {formatTime(selectedTask.timeSpent)}
                    </div>
                  </div>
                  
                  {selectedTask.estimatedTime > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold mb-1">Temps estimé</h4>
                      <div className="text-sm flex items-center gap-1">
                        <Timer className="h-4 w-4 text-muted-foreground" />
                        {selectedTask.estimatedTime} min
                      </div>
                    </div>
                  )}
                </div>
                
                <div>
                  <h4 className="text-sm font-semibold mb-1">Créée</h4>
                  <div className="text-sm">
                    {format(new Date(selectedTask.createdAt), 'dd/MM/yyyy à HH:mm', { locale: fr })}
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
};

export default DataPage;
