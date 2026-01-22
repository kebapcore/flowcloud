import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FolderPlus, FilePlus, Loader2 } from "lucide-react";
import { useCreateFile } from "@/hooks/use-files";
import { useToast } from "@/hooks/use-toast";

interface CreateDialogProps {
  type: 'file' | 'folder';
  parentId?: number | null;
}

export function CreateDialog({ type, parentId = null }: CreateDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const { toast } = useToast();
  const createFile = useCreateFile();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    createFile.mutate({
      name,
      type,
      parentId: parentId || null,
      size: type === 'folder' ? '--' : `${Math.floor(Math.random() * 10) + 1} MB` // Mock size for now
    }, {
      onSuccess: () => {
        setOpen(false);
        setName("");
        toast({
          title: "Success",
          description: `${type === 'folder' ? 'Folder' : 'File'} created successfully.`,
        });
      },
      onError: (err) => {
        toast({
          title: "Error",
          description: err.message,
          variant: "destructive"
        });
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className="glass-button gap-2 border-primary/20 hover:border-primary/50 text-foreground hover:text-primary hover:bg-primary/5"
        >
          {type === 'folder' ? <FolderPlus className="w-4 h-4" /> : <FilePlus className="w-4 h-4" />}
          <span className="hidden sm:inline">New {type === 'folder' ? 'Folder' : 'File'}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="glass-panel border-white/10 text-white sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-light">Create new {type}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-white/70">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={`Enter ${type} name...`}
              className="bg-black/20 border-white/10 text-white placeholder:text-white/30 focus:border-primary/50 focus:ring-primary/20"
              autoFocus
            />
          </div>
          <div className="flex justify-end gap-3">
            <Button 
              type="button" 
              variant="ghost" 
              onClick={() => setOpen(false)}
              className="hover:bg-white/5 hover:text-white text-white/70"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={createFile.isPending}
              className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20"
            >
              {createFile.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Create
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
