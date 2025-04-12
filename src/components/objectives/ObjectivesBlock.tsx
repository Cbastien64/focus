
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import RichTextEditor from '@/components/editor/RichTextEditor';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ObjectivesBlockProps {
  title: string;
  description: string;
  storageKey: string;
}

const ObjectivesBlock: React.FC<ObjectivesBlockProps> = ({ title, description, storageKey }) => {
  // Load saved content from localStorage if available
  const savedContent = localStorage.getItem(storageKey) || '';
  const [content, setContent] = useState<string>(savedContent);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  
  const handleSave = () => {
    localStorage.setItem(storageKey, content);
    setIsEditing(false);
  };
  
  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl">{title}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          </div>
          <div>
            {isEditing ? (
              <div className="flex gap-2">
                <button 
                  onClick={handleSave}
                  className="text-sm text-focus hover:underline"
                >
                  Enregistrer
                </button>
                <button 
                  onClick={() => setIsEditing(false)}
                  className="text-sm text-muted-foreground hover:underline"
                >
                  Annuler
                </button>
              </div>
            ) : (
              <button 
                onClick={() => setIsEditing(true)}
                className="text-sm text-focus hover:underline"
              >
                Modifier
              </button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <RichTextEditor
            value={content}
            onChange={setContent}
            placeholder="Définissez vos objectifs..."
            minHeight="150px"
          />
        ) : (
          <ScrollArea className="h-[200px] pr-4">
            {content ? (
              <div 
                className="prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: content }}
              />
            ) : (
              <p className="text-muted-foreground text-center py-4">
                Cliquez sur "Modifier" pour définir vos objectifs
              </p>
            )}
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};

export default ObjectivesBlock;
