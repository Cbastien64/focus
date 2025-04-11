
import React, { useState, useEffect } from 'react';
import { Task } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, MoveHorizontal } from 'lucide-react';
import { format, startOfWeek, addDays, isSameDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useTaskContext } from '@/context/TaskContext';
import TaskCard from './TaskCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { ScrollArea } from '@/components/ui/scroll-area';

interface WeeklyTaskViewProps {
  onEditTask: (task: Task) => void;
}

const WeeklyTaskView: React.FC<WeeklyTaskViewProps> = ({ onEditTask }) => {
  const { tasks, updateTask } = useTaskContext();
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [draggedTask, setDraggedTask] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'day' | 'priority'>('day');

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));

  const getTasksByDay = (day: Date) => {
    return tasks.filter(task => {
      if (!task.dueDate) return false;
      return isSameDay(new Date(task.dueDate), day) && task.status !== 'completed';
    });
  };

  const priorityOrder = {
    'both': 0,
    'urgent': 1,
    'important': 2,
    'neither': 3
  };

  const sortTasksByPriority = (tasksToSort: Task[]) => {
    return [...tasksToSort].sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
  };

  const getPriorityBgColor = (priority: string): string => {
    switch (priority) {
      case 'both':
        return 'bg-eisenhower-both/20 border-eisenhower-both';
      case 'urgent':
        return 'bg-eisenhower-urgent/20 border-eisenhower-urgent';
      case 'important':
        return 'bg-eisenhower-important/20 border-eisenhower-important';
      case 'neither':
        return 'bg-eisenhower-neither/20 border-eisenhower-neither';
      default:
        return 'bg-muted/50';
    }
  };

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('taskId', taskId);
    setDraggedTask(taskId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetDay: Date) => {
    e.preventDefault();
    const sourceTaskId = e.dataTransfer.getData('taskId');
    
    if (sourceTaskId) {
      const sourceTask = tasks.find(task => task.id === sourceTaskId);
      
      if (sourceTask) {
        updateTask(sourceTask.id, { dueDate: targetDay });
        toast.success(`Tâche déplacée au ${format(targetDay, 'EEEE d MMMM', { locale: fr })}`);
      }
    }
    
    setDraggedTask(null);
  };

  const handleDragEnd = () => {
    setDraggedTask(null);
  };

  return (
    <Card className="border shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between mb-2">
          <CardTitle>Tâches de la semaine</CardTitle>
          <Tabs 
            defaultValue="day" 
            value={sortBy} 
            onValueChange={(value) => setSortBy(value as 'day' | 'priority')}
            className="w-auto"
          >
            <TabsList className="grid w-[200px] grid-cols-2">
              <TabsTrigger value="day">Par jour</TabsTrigger>
              <TabsTrigger value="priority">Par priorité</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent>
        {sortBy === 'day' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7 gap-4">
            {weekDays.map((day) => (
              <div 
                key={day.toISOString()}
                className="border rounded-md p-4"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, day)}
              >
                <h3 className="text-md font-medium mb-2 flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-focus" />
                  <span>{format(day, 'EEEE d', { locale: fr })}</span>
                </h3>
                
                <ScrollArea className="h-[150px]">
                  <div className="space-y-3 pr-2">
                    {getTasksByDay(day).length > 0 ? (
                      sortTasksByPriority(getTasksByDay(day)).map(task => (
                        <div
                          key={task.id}
                          className={`p-2 rounded-md flex items-center justify-between cursor-move border ${
                            getPriorityBgColor(task.priority)
                          } ${
                            draggedTask === task.id ? 'opacity-50 border-2 border-dashed border-focus' : ''
                          }`}
                          draggable
                          onDragStart={(e) => handleDragStart(e, task.id)}
                          onDragEnd={handleDragEnd}
                        >
                          <div className="w-full">
                            <h4 className="font-medium text-sm">{task.title}</h4>
                            <div className="flex items-center justify-between mt-1">
                              <div
                                className={`w-2 h-2 rounded-full ${
                                  task.priority === 'both'
                                    ? 'bg-eisenhower-both'
                                    : task.priority === 'urgent'
                                    ? 'bg-eisenhower-urgent'
                                    : task.priority === 'important'
                                    ? 'bg-eisenhower-important'
                                    : 'bg-eisenhower-neither'
                                }`}
                              />
                              <MoveHorizontal className="h-3 w-3 text-muted-foreground" />
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-4 text-sm text-muted-foreground">
                        Aucune tâche
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            {['both', 'urgent', 'important', 'neither'].map((priority) => (
              <div key={priority} className="space-y-2">
                <h3 className={`text-md font-medium ${
                  priority === 'both'
                    ? 'text-eisenhower-both'
                    : priority === 'urgent'
                    ? 'text-eisenhower-urgent'
                    : priority === 'important'
                    ? 'text-eisenhower-important'
                    : 'text-eisenhower-neither'
                }`}>
                  {priority === 'both'
                    ? 'Urgent & Important'
                    : priority === 'urgent'
                    ? 'Urgent, Non-important'
                    : priority === 'important'
                    ? 'Important, Non-urgent'
                    : 'Non-urgent, Non-important'}
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {tasks.filter(task => 
                    task.priority === priority && 
                    task.status !== 'completed' && 
                    task.dueDate && 
                    weekDays.some(day => isSameDay(new Date(task.dueDate as Date), day))
                  ).map(task => (
                    <div
                      key={task.id}
                      className={`p-3 rounded-md flex flex-col cursor-move border ${
                        getPriorityBgColor(task.priority)
                      } ${
                        draggedTask === task.id ? 'opacity-50 border-2 border-dashed border-focus' : ''
                      }`}
                      draggable
                      onDragStart={(e) => handleDragStart(e, task.id)}
                      onDragEnd={handleDragEnd}
                    >
                      <h4 className="font-medium">{task.title}</h4>
                      <div className="flex items-center mt-2 text-xs">
                        <Calendar className="h-3 w-3 text-focus mr-1" />
                        <span>{format(new Date(task.dueDate as Date), 'EEEE d MMMM', { locale: fr })}</span>
                      </div>
                    </div>
                  ))}
                  
                  {tasks.filter(task => 
                    task.priority === priority && 
                    task.status !== 'completed' && 
                    task.dueDate && 
                    weekDays.some(day => isSameDay(new Date(task.dueDate as Date), day))
                  ).length === 0 && (
                    <div className="col-span-full text-center py-2 text-sm text-muted-foreground">
                      Aucune tâche dans cette catégorie
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WeeklyTaskView;
