
import React, { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { useTaskContext } from '@/context/TaskContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Trash, Info } from 'lucide-react';
import { Tag } from '@/types';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

const TagsPage = () => {
  const { tags, addTag, deleteTag, tasks } = useTaskContext();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [tagName, setTagName] = useState('');
  const [tagColor, setTagColor] = useState('#4f46e5');
  
  const handleAddTag = () => {
    if (tagName.trim()) {
      addTag(tagName, tagColor);
      setTagName('');
      setTagColor('#4f46e5');
      setIsDialogOpen(false);
    }
  };
  
  // Count tasks using a specific tag
  const getTagUsageCount = (tagId: string): number => {
    return tasks.filter((task) => task.tags.some((tag) => tag.id === tagId)).length;
  };

  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Gestion des Tags</h1>
          <Button 
            onClick={() => setIsDialogOpen(true)}
            className="gap-1 bg-focus hover:bg-focus-dark"
          >
            <Plus className="h-4 w-4" />
            <span>Nouveau Tag</span>
          </Button>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Tags disponibles</CardTitle>
          </CardHeader>
          <CardContent>
            {tags.length > 0 ? (
              <div className="space-y-2">
                {tags.map((tag) => (
                  <div
                    key={tag.id}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-md"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: tag.color }}
                      ></div>
                      <span className="font-medium">{tag.name}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground flex items-center gap-1">
                        <Info className="h-3 w-3" />
                        {getTagUsageCount(tag.id)} tâche{getTagUsageCount(tag.id) !== 1 ? 's' : ''}
                      </span>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="icon" className="h-7 w-7">
                            <Trash className="h-3.5 w-3.5" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Supprimer ce tag?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Cette action ne peut pas être annulée. Ce tag sera supprimé de toutes les tâches qui l'utilisent.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Annuler</AlertDialogCancel>
                            <AlertDialogAction onClick={() => deleteTag(tag.id)}>
                              Supprimer
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">Aucun tag disponible</p>
                <Button 
                  variant="outline"
                  onClick={() => setIsDialogOpen(true)}
                >
                  Créer un tag
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajouter un nouveau tag</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="tagName">Nom du tag</Label>
              <Input
                id="tagName"
                value={tagName}
                onChange={(e) => setTagName(e.target.value)}
                placeholder="ex: Travail, Personnel, Urgent..."
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="tagColor">Couleur</Label>
              <div className="flex gap-2">
                <Input
                  id="tagColor"
                  type="color"
                  value={tagColor}
                  onChange={(e) => setTagColor(e.target.value)}
                  className="w-16 h-10 p-1"
                />
                <div
                  className="flex-1 rounded-md flex items-center justify-center text-white font-medium"
                  style={{ backgroundColor: tagColor }}
                >
                  Aperçu
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button onClick={handleAddTag} className="bg-focus hover:bg-focus-dark">
              Ajouter
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default TagsPage;
