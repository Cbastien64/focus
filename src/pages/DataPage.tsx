
import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTaskContext } from '@/context/TaskContext';
import { useTimerContext } from '@/context/TimerContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

const DataPage = () => {
  const { tasks, tags } = useTaskContext();
  const { timerState } = useTimerContext();
  
  // Calcul des statistiques de tâches
  const tasksByPriority = {
    urgent: tasks.filter(task => task.priority === 'urgent').length,
    important: tasks.filter(task => task.priority === 'important').length,
    both: tasks.filter(task => task.priority === 'both').length,
    neither: tasks.filter(task => task.priority === 'neither').length,
  };
  
  const tasksByStatus = {
    todo: tasks.filter(task => task.status === 'todo').length,
    inProgress: tasks.filter(task => task.status === 'in-progress').length,
    completed: tasks.filter(task => task.status === 'completed').length,
  };
  
  // Calcul du temps total passé sur les tâches (en minutes)
  const totalTimeSpent = tasks.reduce((total, task) => total + task.timeSpent, 0) / 60;
  
  // Préparation des données pour les graphiques
  const priorityData = [
    { name: 'Urgent & Important', value: tasksByPriority.both },
    { name: 'Urgent', value: tasksByPriority.urgent },
    { name: 'Important', value: tasksByPriority.important },
    { name: 'Autre', value: tasksByPriority.neither },
  ];
  
  const statusData = [
    { name: 'À faire', value: tasksByStatus.todo },
    { name: 'En cours', value: tasksByStatus.inProgress },
    { name: 'Terminé', value: tasksByStatus.completed },
  ];
  
  // Renommer "tags" en "domaines de projet" et calculer le temps passé par domaine
  const domainData = tags.map(tag => {
    const tasksInDomain = tasks.filter(task => task.tags.some(t => t.id === tag.id));
    const timeSpentInDomain = tasksInDomain.reduce((total, task) => total + task.timeSpent, 0) / 60;
    
    return {
      name: tag.name,
      count: tasksInDomain.length,
      temps: Math.round(timeSpentInDomain),
    };
  });
  
  // Extraire les hashtags (#) du texte des tâches
  const extractHashtags = (text) => {
    const hashtagRegex = /#[\w-]+/g;
    return text.match(hashtagRegex) || [];
  };
  
  // Compter les occurrences de hashtags dans toutes les tâches
  const hashtagCounts = {};
  tasks.forEach(task => {
    const titleTags = extractHashtags(task.title);
    const descriptionTags = extractHashtags(task.description);
    const allTags = [...titleTags, ...descriptionTags];
    
    allTags.forEach(tag => {
      hashtagCounts[tag] = (hashtagCounts[tag] || 0) + 1;
    });
  });
  
  // Convertir en format pour le graphique
  const hashtagData = Object.entries(hashtagCounts)
    .map(([tag, count]) => ({ name: tag, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10); // Montrer les 10 hashtags les plus utilisés
  
  const taskTimeData = [...tasks]
    .sort((a, b) => b.timeSpent - a.timeSpent)
    .slice(0, 5)
    .map(task => ({
      name: task.title,
      temps: Math.round(task.timeSpent / 60),
    }));
  
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];
  
  return (
    <MainLayout>
      <div className="container py-6">
        <h1 className="text-3xl font-bold mb-6">Espace Données</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Tâches totales</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{tasks.length}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Temps total</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{Math.round(totalTimeSpent)} min</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Sessions terminées</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{timerState.completedSessions}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Tâches terminées</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{tasksByStatus.completed}</p>
            </CardContent>
          </Card>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle>Distribution par priorité (Matrice Eisenhower)</CardTitle>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={priorityData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {priorityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Distribution par statut</CardTitle>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle>Temps par tâche (top 5)</CardTitle>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={taskTimeData}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis label={{ value: 'Minutes', angle: -90, position: 'insideLeft' }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="temps" fill="#8884d8" name="Temps (min)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Temps par domaine de projet</CardTitle>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={domainData}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis label={{ value: 'Minutes', angle: -90, position: 'insideLeft' }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="temps" fill="#82ca9d" name="Temps (min)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Tâches par domaine de projet</CardTitle>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={domainData}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#82ca9d" name="Nombre de tâches" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Tags populaires (#hashtags)</CardTitle>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={hashtagData}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#8884d8" name="Occurrences" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default DataPage;
