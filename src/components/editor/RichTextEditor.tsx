import React, { useState } from 'react';
import { Bold, Italic, Underline, List, ListOrdered, Link, Paperclip, Highlighter, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({ 
  value, 
  onChange,
  placeholder = "Écrivez votre texte ici...",
  minHeight = "150px"
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      setSelectedFile(file);
      // In a real app, we would upload the file and get a URL
      // For now, we'll just insert the filename as a placeholder
      insertText(`[Pièce jointe: ${file.name}]`);
      toast.success(`Pièce jointe ajoutée: ${file.name}`);
    }
  };

  const insertText = (text: string) => {
    onChange(value + text);
  };

  const applyFormatting = (tag: string) => {
    onChange(`${value}${tag}`);
  };

  const applyColor = (color: string) => {
    insertText(`<span style="color:${color}">Texte coloré</span>`);
  };

  return (
    <div className="border rounded-md">
      <div className="flex flex-wrap items-center gap-1 p-2 bg-muted/30 border-b">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => applyFormatting("**Texte en gras**")}
          title="Gras"
        >
          <Bold className="h-4 w-4" />
        </Button>
        
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => applyFormatting("*Texte en italique*")}
          title="Italique"
        >
          <Italic className="h-4 w-4" />
        </Button>
        
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => applyFormatting("__Texte souligné__")}
          title="Souligné"
        >
          <Underline className="h-4 w-4" />
        </Button>
        
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => applyFormatting("\n- Élément de liste")}
          title="Liste à puces"
        >
          <List className="h-4 w-4" />
        </Button>
        
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => applyFormatting("\n1. Élément numéroté")}
          title="Liste numérotée"
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
        
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => applyFormatting("==Texte surligné==")}
          title="Surligner"
        >
          <Highlighter className="h-4 w-4" />
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" title="Couleur">
              <Palette className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => applyColor("red")}>
              <div className="h-3 w-3 rounded-full bg-red-500 mr-2" />
              Rouge
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => applyColor("blue")}>
              <div className="h-3 w-3 rounded-full bg-blue-500 mr-2" />
              Bleu
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => applyColor("green")}>
              <div className="h-3 w-3 rounded-full bg-green-500 mr-2" />
              Vert
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => applyColor("purple")}>
              <div className="h-3 w-3 rounded-full bg-purple-500 mr-2" />
              Violet
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => applyColor("orange")}>
              <div className="h-3 w-3 rounded-full bg-orange-500 mr-2" />
              Orange
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => {
            const url = prompt("Entrez l'URL:") || "";
            if (url) {
              insertText(`[Lien](${url})`);
            }
          }}
          title="Ajouter un lien"
        >
          <Link className="h-4 w-4" />
        </Button>
        
        <label htmlFor="file-upload" title="Upload file" className="cursor-pointer">
          <Button variant="ghost" size="sm">
            <Paperclip className="h-4 w-4" />
          </Button>
          <input
            id="file-upload"
            type="file"
            className="hidden"
            onChange={handleFileChange}
          />
        </label>
      </div>
      
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="border-0 focus-visible:ring-0 min-h-[100px] resize-y"
        style={{ minHeight }}
      />
    </div>
  );
};

export default RichTextEditor;
