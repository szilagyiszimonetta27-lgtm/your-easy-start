export async function extractThumbnail(
  videoUrl: string,
  atSeconds = 10,
): Promise<string | null> {
  return new Promise((resolve) => {
    try {
      const video = document.createElement("video");
      video.crossOrigin = "anonymous";
      video.preload = "metadata";
      video.muted = true;
      (video as HTMLVideoElement & { playsInline?: boolean }).playsInline = true;
      video.src = videoUrl;

      const cleanup = () => {
        video.removeAttribute("src");
        video.load();
      };

      video.addEventListener("loadedmetadata", () => {
        const target = Math.min(atSeconds, Math.max(0, (video.duration || 0) - 0.1));
        video.currentTime = target;
      });

      video.addEventListener("seeked", () => {
        try {
          const canvas = document.createElement("canvas");
          canvas.width = video.videoWidth || 640;
          canvas.height = video.videoHeight || 360;
          const ctx = canvas.getContext("2d");
          if (!ctx) return resolve(null);
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const url = canvas.toDataURL("image/jpeg", 0.8);
          cleanup();
          resolve(url);
        } catch {
          cleanup();
          resolve(null);
        }
      });

      video.addEventListener("error", () => {
        cleanup();
        resolve(null);
      });
    } catch {
      resolve(null);
    }
  });
}