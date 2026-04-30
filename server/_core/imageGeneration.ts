import { storagePut } from "server/storage";

export type GenerateImageOptions = { prompt: string; };
export type GenerateImageResponse = { url?: string; };

export async function generateImage(options: GenerateImageOptions): Promise<GenerateImageResponse> {
  const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(options.prompt)}?width=512&height=768&nologo=true&enhance=true&seed=${Date.now()}`;
  const response = await fetch(pollinationsUrl, { signal: AbortSignal.timeout(75000) });
  if (!response.ok) throw new Error(`Pollinations failed: ${response.status}`);
  const buffer = Buffer.from(await response.arrayBuffer());
  try {
    const { url: storageUrl } = await storagePut(`generated/${Date.now()}.jpg`, buffer, "image/jpeg");
    return { url: storageUrl };
  } catch (storageErr) {
    console.error("[ImageGen] Storage fallback — using Pollinations URL:", storageErr);
    return { url: pollinationsUrl };
  }
}
