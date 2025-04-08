
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Collaborator } from '@/types';
import { useTaskContext } from '@/context/TaskContext';

interface CollaboratorFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  collaborator?: Collaborator;
}

const CollaboratorForm: React.FC<CollaboratorFormProps> = ({ open, onOpenChange, collaborator }) => {
  const { addCollaborator, updateCollaborator } = useTaskContext();
  
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [organization, setOrganization] = useState('');
  
  // Reset form when dialog opens/closes or collaborator changes
  useEffect(() => {
    if (collaborator) {
      setFirstName(collaborator.firstName);
      setLastName(collaborator.lastName);
      setEmail(collaborator.email);
      setPhone(collaborator.phone);
      setOrganization(collaborator.organization);
    } else {
      setFirstName('');
      setLastName('');
      setEmail('');
      setPhone('');
      setOrganization('');
    }
  }, [collaborator, open]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!firstName.trim() || !lastName.trim() || !email.trim()) {
      return;
    }
    
    if (collaborator) {
      updateCollaborator(collaborator.id, {
        firstName,
        lastName,
        email,
        phone,
        organization,
      });
    } else {
      addCollaborator({
        firstName,
        lastName,
        email,
        phone,
        organization,
      });
    }
    
    onOpenChange(false);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>{collaborator ? 'Modifier le collaborateur' : 'Nouveau collaborateur'}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">Prénom</Label>
              <Input
                id="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Prénom"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="lastName">Nom</Label>
              <Input
                id="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Nom de famille"
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="phone">Téléphone</Label>
            <Input
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Numéro de téléphone"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="organization">Organisation</Label>
            <Input
              id="organization"
              value={organization}
              onChange={(e) => setOrganization(e.target.value)}
              placeholder="Organisation"
            />
          </div>
          
          <DialogFooter>
            <Button type="submit" className="bg-focus hover:bg-focus-dark">
              {collaborator ? 'Mettre à jour' : 'Créer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CollaboratorForm;
