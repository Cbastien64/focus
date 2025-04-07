
import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { useTaskContext } from '@/context/TaskContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

// Helper function to extract hashtags from text
const extractHashtags = (text: string): string[] => {
  const hashtagRegex = /#(\w+)/g;
  const matches = text.match(hashtagRegex);
  return matches ? matches.map(tag => tag.toLowerCase()) : [];
};

const DataPage = () => {
  const { tasks, tags } = useTaskContext();
  
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

  // Calculate time formatting
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];
  
  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto py-6">
        <h1 className="text-2xl font-bold mb-6">Analyse des données</h1>
        
        <div className="grid md:grid-cols-2 gap-6">
          {/* Time spent by project */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Temps passé par projet</CardTitle>
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
          
          {/* Task status distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Distribution par statut</CardTitle>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statusData}>
                  <XAxis dataKey="name" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="value" name="Tâches" fill="#8884d8">
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          
          {/* Task priorities distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Distribution par priorité</CardTitle>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={priorityData}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    dataKey="value"
                  >
                    {priorityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          
          {/* Top hashtags */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Tags populaires</CardTitle>
            </CardHeader>
            <CardContent className="h-80">
              {hashtagData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={hashtagData} layout="vertical">
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={100} />
                    <Tooltip />
                    <Bar dataKey="value" name="Occurrences" fill="#4f46e5">
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
        </div>
      </div>
    </MainLayout>
  );
};

export default DataPage;
