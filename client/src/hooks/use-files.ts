import { useMutation } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { z } from "zod";

// We define the input type manually as the hook needs both path and access key
type FetchFileParams = {
  path: string;
  accessKey: string;
};

export function useFileMetadata() {
  return useMutation({
    mutationFn: async ({ path, accessKey }: FetchFileParams) => {
      // Ensure path doesn't have leading slash for the :path param
      const cleanPath = path.startsWith('/') ? path.slice(1) : path;
      
      const url = buildUrl(api.files.metadata.path, { path: cleanPath });
      
      const res = await fetch(url, {
        method: api.files.metadata.method,
        headers: {
          "x-access-key": accessKey,
          "Content-Type": "application/json"
        }
      });

      if (!res.ok) {
        if (res.status === 403 || res.status === 404) {
          const error = await res.json().catch(() => ({ message: "Unknown error" }));
          throw new Error(error.message || `Error ${res.status}`);
        }
        throw new Error("Failed to fetch file metadata");
      }

      const data = await res.json();
      return api.files.metadata.responses[200].parse(data);
    }
  });
}
