import { useMutation } from "@tanstack/react-query";

// We define the input type manually 
type FetchFileParams = {
  path: string;
};

export function useFileMetadata() {
  return useMutation({
    mutationFn: async ({ path }: FetchFileParams) => {
      // Ensure path doesn't have leading slash for the :path param
      const cleanPath = path.startsWith('/') ? path.slice(1) : path;

      const url = `/api/proxy/files/${cleanPath}`;

      const res = await fetch(url, {
        method: "GET",
        headers: {
          "X-App-Request": "1"
        }
      });

      if (!res.ok) {
        if (res.status === 403 || res.status === 404) {
          throw new Error(`Error ${res.status}: File not found or access denied`);
        }
        throw new Error("Failed to fetch file");
      }

      // Since the proxy returns the file content directly, we return it as text or blob
      // Depending on usage, but for now let's assume text based on previous usage context or just return the response
      // The previous hook returned metadata, but the new requirement says "fetch file".
      // The Landing page expects JSON output of metadata OR content? 
      // The user request says "Gerçek file API'ye backend üzerinden fetch atsın" (Fetch real file API via backend).
      // And "Frontend'e ASLA gönderilmesin" (Key never sent to frontend).

      // Let's return the text content for now as it seems to be for a "test playground"
      return await res.text();
    }
  });
}

