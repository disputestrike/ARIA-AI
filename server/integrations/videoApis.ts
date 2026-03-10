/**
 * Video API Integrations
 * - HeyGen: AI avatar video generation
 * - ElevenLabs: AI voice synthesis / text-to-speech
 * - Runway: AI video generation from text/image
 */

// ─── HeyGen ───────────────────────────────────────────────────────────────────

const HEYGEN_API_KEY = process.env.HEYGEN_API_KEY ?? "";
const HEYGEN_BASE = "https://api.heygen.com/v2";

export interface HeyGenVideoRequest {
  title: string;
  avatarId?: string;
  voiceId?: string;
  script: string;
  backgroundUrl?: string;
  width?: number;
  height?: number;
}

export interface HeyGenVideoResponse {
  videoId: string;
  status: "pending" | "processing" | "completed" | "failed";
  videoUrl?: string;
  thumbnailUrl?: string;
  duration?: number;
}

export async function createHeyGenVideo(req: HeyGenVideoRequest): Promise<HeyGenVideoResponse> {
  if (!HEYGEN_API_KEY) {
    console.warn("[HeyGen] API key not configured — returning mock response");
    return { videoId: `mock_heygen_${Date.now()}`, status: "pending" };
  }

  const payload = {
    video_inputs: [{
      character: {
        type: "avatar",
        avatar_id: req.avatarId ?? "default",
        avatar_style: "normal",
      },
      voice: {
        type: "text",
        input_text: req.script,
        voice_id: req.voiceId ?? "default",
      },
      background: req.backgroundUrl ? {
        type: "image",
        url: req.backgroundUrl,
      } : {
        type: "color",
        value: "#0a0a0f",
      },
    }],
    dimension: {
      width: req.width ?? 1920,
      height: req.height ?? 1080,
    },
    title: req.title,
  };

  const res = await fetch(`${HEYGEN_BASE}/video/generate`, {
    method: "POST",
    headers: {
      "X-Api-Key": HEYGEN_API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`HeyGen API error ${res.status}: ${error}`);
  }

  const data = await res.json() as { data: { video_id: string } };
  return { videoId: data.data.video_id, status: "pending" };
}

export async function getHeyGenVideoStatus(videoId: string): Promise<HeyGenVideoResponse> {
  if (!HEYGEN_API_KEY || videoId.startsWith("mock_")) {
    return { videoId, status: "completed", videoUrl: "", thumbnailUrl: "" };
  }

  const res = await fetch(`${HEYGEN_BASE}/video/${videoId}`, {
    headers: { "X-Api-Key": HEYGEN_API_KEY },
  });

  if (!res.ok) throw new Error(`HeyGen status check failed: ${res.status}`);

  const data = await res.json() as { data: { status: string; video_url?: string; thumbnail_url?: string; duration?: number } };
  return {
    videoId,
    status: data.data.status as HeyGenVideoResponse["status"],
    videoUrl: data.data.video_url,
    thumbnailUrl: data.data.thumbnail_url,
    duration: data.data.duration,
  };
}

export async function listHeyGenAvatars(): Promise<Array<{ id: string; name: string; previewUrl: string }>> {
  if (!HEYGEN_API_KEY) return [];

  const res = await fetch(`${HEYGEN_BASE}/avatars`, {
    headers: { "X-Api-Key": HEYGEN_API_KEY },
  });

  if (!res.ok) return [];
  const data = await res.json() as { data: { avatars: Array<{ avatar_id: string; avatar_name: string; preview_image_url: string }> } };
  return data.data.avatars.map(a => ({ id: a.avatar_id, name: a.avatar_name, previewUrl: a.preview_image_url }));
}

// ─── ElevenLabs ───────────────────────────────────────────────────────────────

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY ?? "";
const ELEVENLABS_BASE = "https://api.elevenlabs.io/v1";

export interface ElevenLabsVoiceRequest {
  text: string;
  voiceId?: string;
  modelId?: string;
  stability?: number;
  similarityBoost?: number;
  style?: number;
  speakerBoost?: boolean;
}

export async function synthesizeSpeech(req: ElevenLabsVoiceRequest): Promise<Buffer> {
  if (!ELEVENLABS_API_KEY) {
    console.warn("[ElevenLabs] API key not configured — returning empty buffer");
    return Buffer.alloc(0);
  }

  const voiceId = req.voiceId ?? "21m00Tcm4TlvDq8ikWAM"; // Default: Rachel

  const res = await fetch(`${ELEVENLABS_BASE}/text-to-speech/${voiceId}`, {
    method: "POST",
    headers: {
      "xi-api-key": ELEVENLABS_API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      text: req.text,
      model_id: req.modelId ?? "eleven_multilingual_v2",
      voice_settings: {
        stability: req.stability ?? 0.5,
        similarity_boost: req.similarityBoost ?? 0.75,
        style: req.style ?? 0.0,
        use_speaker_boost: req.speakerBoost ?? true,
      },
    }),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`ElevenLabs API error ${res.status}: ${error}`);
  }

  const arrayBuffer = await res.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

export async function listElevenLabsVoices(): Promise<Array<{ id: string; name: string; category: string; previewUrl?: string }>> {
  if (!ELEVENLABS_API_KEY) return [];

  const res = await fetch(`${ELEVENLABS_BASE}/voices`, {
    headers: { "xi-api-key": ELEVENLABS_API_KEY },
  });

  if (!res.ok) return [];
  const data = await res.json() as { voices: Array<{ voice_id: string; name: string; category: string; preview_url?: string }> };
  return data.voices.map(v => ({ id: v.voice_id, name: v.name, category: v.category, previewUrl: v.preview_url }));
}

// ─── Runway ───────────────────────────────────────────────────────────────────

const RUNWAY_API_KEY = process.env.RUNWAY_API_KEY ?? "";
const RUNWAY_BASE = "https://api.runwayml.com/v1";

export interface RunwayVideoRequest {
  prompt: string;
  imageUrl?: string;
  duration?: 5 | 10;
  ratio?: "16:9" | "9:16" | "1:1";
  watermark?: boolean;
}

export interface RunwayVideoResponse {
  taskId: string;
  status: "pending" | "processing" | "succeeded" | "failed";
  videoUrl?: string;
  previewUrl?: string;
}

export async function generateRunwayVideo(req: RunwayVideoRequest): Promise<RunwayVideoResponse> {
  if (!RUNWAY_API_KEY) {
    console.warn("[Runway] API key not configured — returning mock response");
    return { taskId: `mock_runway_${Date.now()}`, status: "pending" };
  }

  const payload: Record<string, unknown> = {
    promptText: req.prompt,
    model: "gen3a_turbo",
    duration: req.duration ?? 5,
    ratio: req.ratio ?? "16:9",
    watermark: req.watermark ?? false,
  };

  if (req.imageUrl) {
    payload.promptImage = req.imageUrl;
  }

  const res = await fetch(`${RUNWAY_BASE}/image_to_video`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${RUNWAY_API_KEY}`,
      "Content-Type": "application/json",
      "X-Runway-Version": "2024-11-06",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Runway API error ${res.status}: ${error}`);
  }

  const data = await res.json() as { id: string; status: string };
  return { taskId: data.id, status: data.status as RunwayVideoResponse["status"] };
}

export async function getRunwayVideoStatus(taskId: string): Promise<RunwayVideoResponse> {
  if (!RUNWAY_API_KEY || taskId.startsWith("mock_")) {
    return { taskId, status: "succeeded", videoUrl: "", previewUrl: "" };
  }

  const res = await fetch(`${RUNWAY_BASE}/tasks/${taskId}`, {
    headers: {
      "Authorization": `Bearer ${RUNWAY_API_KEY}`,
      "X-Runway-Version": "2024-11-06",
    },
  });

  if (!res.ok) throw new Error(`Runway status check failed: ${res.status}`);

  const data = await res.json() as { id: string; status: string; output?: string[]; previewUrls?: string[] };
  return {
    taskId: data.id,
    status: data.status as RunwayVideoResponse["status"],
    videoUrl: data.output?.[0],
    previewUrl: data.previewUrls?.[0],
  };
}
