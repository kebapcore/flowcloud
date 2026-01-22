import { motion } from "framer-motion";
import { Folder, FileText, Trash2, HardDrive } from "lucide-react";
import { type File } from "@shared/schema";
import { useDeleteFile } from "@/hooks/use-files";
import { useToast } from "@/hooks/use-toast";
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
import { Button } from "@/components/ui/button";

interface FileGridProps {
  files: File[];
  isLoading: boolean;
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export function FileGrid({ files, isLoading }: FileGridProps) {
  const deleteFile = useDeleteFile();
  const { toast } = useToast();

  const handleDelete = (id: number) => {
    deleteFile.mutate(id, {
      onSuccess: () => {
        toast({
          title: "Deleted",
          description: "Item moved to trash.",
        });
      },
      onError: () => {
        toast({
          title: "Error",
          description: "Failed to delete item.",
          variant: "destructive"
        });
      }
    });
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-32 rounded-xl bg-white/5 animate-pulse" />
        ))}
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-white/30 space-y-4">
        <HardDrive className="w-16 h-16 opacity-20" />
        <p className="text-lg font-light">This folder is empty</p>
      </div>
    );
  }

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4"
    >
      {files.map((file) => (
        <motion.div
          key={file.id}
          variants={item}
          className="group relative flex flex-col items-center p-6 rounded-2xl glass-panel hover:bg-white/10 hover:scale-[1.02] transition-all duration-300 cursor-pointer border-transparent hover:border-primary/30"
        >
          <div className="mb-4 p-4 rounded-full bg-gradient-to-br from-white/5 to-white/0 shadow-inner">
            {file.type === 'folder' ? (
              <Folder className="w-8 h-8 text-primary fill-primary/20" />
            ) : (
              <FileText className="w-8 h-8 text-blue-400 fill-blue-400/20" />
            )}
          </div>
          
          <h3 className="text-sm font-medium text-white/90 truncate w-full text-center">
            {file.name}
          </h3>
          <span className="text-xs text-white/40 mt-1">{file.size}</span>
        </motion.div>
      ))}
    </motion.div>
  );
}
