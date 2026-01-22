import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type CreateFileRequest } from "@shared/routes";

// ============================================
// FILE MANAGEMENT HOOKS
// ============================================

export function useFiles(parentId?: number) {
  return useQuery({
    queryKey: [api.files.list.path, parentId],
    queryFn: async () => {
      // Build URL with query param if parentId exists
      const url = parentId 
        ? `${api.files.list.path}?parentId=${parentId}`
        : api.files.list.path;
        
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error('Failed to fetch files');
      return api.files.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateFile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateFileRequest) => {
      const validated = api.files.create.input.parse(data);
      const res = await fetch(api.files.create.path, {
        method: api.files.create.method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validated),
        credentials: "include",
      });
      
      if (!res.ok) {
        if (res.status === 400) {
          const error = api.files.create.responses[400].parse(await res.json());
          throw new Error(error.message);
        }
        throw new Error('Failed to create item');
      }
      return api.files.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.files.list.path] });
    },
  });
}

export function useDeleteFile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.files.delete.path, { id });
      const res = await fetch(url, { 
        method: api.files.delete.method, 
        credentials: "include" 
      });
      
      if (res.status === 404) throw new Error('File not found');
      if (!res.ok) throw new Error('Failed to delete file');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.files.list.path] });
    },
  });
}

// ============================================
// AUTH HOOKS
// ============================================

export function useVerifyAuth() {
  return useMutation({
    mutationFn: async (accessKey: string) => {
      const validated = api.auth.verify.input.parse({ accessKey });
      const res = await fetch(api.auth.verify.path, {
        method: api.auth.verify.method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validated),
      });

      if (!res.ok) {
        if (res.status === 401) {
          throw new Error('Invalid access key');
        }
        throw new Error('Verification failed');
      }
      return api.auth.verify.responses[200].parse(await res.json());
    }
  });
}
