
import React, { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { useTaskContext } from '@/context/TaskContext';
import { Button } from '@/components/ui/button';
import { Plus, Pencil, Trash } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import CollaboratorForm from '@/components/collaborators/CollaboratorForm';
import { Collaborator } from '@/types';

const CollaboratorsPage = () => {
  const { collaborators } = useTaskContext();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedCollaborator, setSelectedCollaborator] = useState<Collaborator | undefined>(undefined);

  const handleAddCollaborator = () => {
    setSelectedCollaborator(undefined);
    setIsFormOpen(true);
  };

  const handleEditCollaborator = (collaborator: Collaborator) => {
    setSelectedCollaborator(collaborator);
    setIsFormOpen(true);
  };

  return (
    <MainLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Collaborateurs</h1>
        
        <Button onClick={handleAddCollaborator} className="gap-1 bg-focus hover:bg-focus-dark">
          <Plus className="h-4 w-4" />
          <span>Ajouter un collaborateur</span>
        </Button>
      </div>
      
      {collaborators.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Liste des collaborateurs</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Téléphone</TableHead>
                  <TableHead>Organisation</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {collaborators.map((collaborator) => (
                  <TableRow key={collaborator.id}>
                    <TableCell>{collaborator.firstName} {collaborator.lastName}</TableCell>
                    <TableCell>{collaborator.email}</TableCell>
                    <TableCell>{collaborator.phone}</TableCell>
                    <TableCell>{collaborator.organization}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="outline" 
                          size="icon" 
                          onClick={() => handleEditCollaborator(collaborator)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="icon"
                          onClick={() => {
                            const { deleteCollaborator } = useTaskContext();
                            deleteCollaborator(collaborator.id);
                          }}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="text-muted-foreground mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="64"
              height="64"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mx-auto"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <h3 className="text-xl font-medium">Aucun collaborateur trouvé</h3>
          <p className="text-muted-foreground mt-1">
            <button
              onClick={handleAddCollaborator}
              className="text-focus hover:underline"
            >
              Ajouter un collaborateur
            </button>
          </p>
        </div>
      )}

      <CollaboratorForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        collaborator={selectedCollaborator}
      />
    </MainLayout>
  );
};

export default CollaboratorsPage;
