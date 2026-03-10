import { useState, useRef, useCallback, useEffect } from "react";
import { Mic, Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface VoiceInputProps {
  onTranscript: (text: string) => void;
  disabled?: boolean;
}

type VoiceState = "idle" | "listening" | "processing";

const SILENCE_THRESHOLD = 0.012; // RMS below this = silence
const SILENCE_DURATION_MS = 1600; // stop after 1.6s of silence
const MIN_SPEECH_MS = 500;        // ignore blips shorter than 500ms

export default function VoiceInput({ onTranscript, disabled }: VoiceInputProps) {
  const [state, setState] = useState<VoiceState>("idle");
  const [volume, setVolume] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const speechStartRef = useRef<number>(0);
  const animFrameRef = useRef<number>(0);
  const streamRef = useRef<MediaStream | null>(null);
  const hasSpeechRef = useRef(false);

  const transcribeMutation = trpc.voice.transcribe.useMutation({
    onSuccess: (data) => {
      if (data?.text?.trim()) {
        onTranscript(data.text.trim());
      } else {
        toast.info("Couldn't catch that — try again");
      }
      setState("idle");
    },
    onError: () => {
      toast.error("Voice transcription failed");
      setState("idle");
    },
  });

  const cleanup = useCallback(() => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    silenceTimerRef.current = null;
    hasSpeechRef.current = false;
    try { analyserRef.current?.disconnect(); } catch {}
    try { audioCtxRef.current?.close(); } catch {}
    streamRef.current?.getTracks().forEach(t => t.stop());
    setVolume(0);
  }, []);

  const finishRecording = useCallback(async (recorder: MediaRecorder) => {
    cleanup();
    setState("processing");

    await new Promise<void>(res => {
      recorder.onstop = () => res();
      if (recorder.state !== "inactive") recorder.stop();
      else res();
    });

    const blob = new Blob(chunksRef.current, { type: "audio/webm" });
    if (blob.size < 1000) { setState("idle"); return; }

    const formData = new FormData();
    formData.append("file", blob, "voice.webm");

    try {
      const res = await fetch("/api/upload-audio", { method: "POST", body: formData });
      const { url } = await res.json() as { url: string };
      transcribeMutation.mutate({ audioUrl: url, language: "en" });
    } catch {
      // Fallback: base64 for small recordings
      const reader = new FileReader();
      reader.onload = () => {
        transcribeMutation.mutate({ audioUrl: reader.result as string });
      };
      reader.readAsDataURL(blob);
    }
  }, [cleanup, transcribeMutation]);

  const startRecording = useCallback(async () => {
    if (state !== "idle" || disabled) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const audioCtx = new AudioContext();
      audioCtxRef.current = audioCtx;
      const analyser = audioCtx.createAnalyser();
      analyserRef.current = analyser;
      analyser.fftSize = 512;
      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      const dataArray = new Float32Array(analyser.fftSize);
      speechStartRef.current = Date.now();
      hasSpeechRef.current = false;

      const recorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];
      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      recorder.start(100);
      setState("listening");

      const tick = () => {
        analyser.getFloatTimeDomainData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) sum += dataArray[i] * dataArray[i];
        const rms = Math.sqrt(sum / dataArray.length);
        setVolume(Math.min(rms * 18, 1));

        if (rms > SILENCE_THRESHOLD) {
          hasSpeechRef.current = true;
          if (silenceTimerRef.current) { clearTimeout(silenceTimerRef.current); silenceTimerRef.current = null; }
        } else if (hasSpeechRef.current && !silenceTimerRef.current) {
          silenceTimerRef.current = setTimeout(() => {
            const dur = Date.now() - speechStartRef.current;
            if (dur > MIN_SPEECH_MS) {
              finishRecording(recorder);
            } else {
              hasSpeechRef.current = false;
              silenceTimerRef.current = null;
            }
          }, SILENCE_DURATION_MS);
        }

        animFrameRef.current = requestAnimationFrame(tick);
      };
      animFrameRef.current = requestAnimationFrame(tick);

    } catch {
      toast.error("Microphone access denied");
      setState("idle");
    }
  }, [state, disabled, finishRecording]);

  const handleClick = useCallback(() => {
    if (state === "idle") startRecording();
    else if (state === "listening") {
      const recorder = mediaRecorderRef.current;
      if (recorder) finishRecording(recorder);
    }
  }, [state, startRecording, finishRecording]);

  useEffect(() => () => cleanup(), [cleanup]);

  const bars = 5;
  const isListening = state === "listening";
  const isProcessing = state === "processing";

  return (
    <button
      onClick={handleClick}
      disabled={disabled || isProcessing}
      title={isListening ? "Listening… click to stop" : isProcessing ? "Processing…" : "Click to speak"}
      className={`relative flex items-center justify-center w-10 h-10 rounded-full transition-all duration-200 flex-shrink-0
        ${state === "idle" ? "text-gray-400 hover:text-violet-600 hover:bg-violet-50" : ""}
        ${isListening ? "bg-red-500 text-white shadow-lg shadow-red-200 scale-110" : ""}
        ${isProcessing ? "bg-violet-100 text-violet-400 cursor-wait" : ""}
        ${disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}
      `}
    >
      {isProcessing ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : isListening ? (
        <div className="flex items-end gap-[2px] h-4 w-5">
          {Array.from({ length: bars }).map((_, i) => (
            <div
              key={i}
              className="flex-1 bg-white rounded-full"
              style={{
                height: `${Math.max(20, Math.min(100, 30 + volume * 70 + Math.sin(Date.now() / 150 + i * 1.2) * 20))}%`,
                animation: `waveBar 0.35s ease-in-out ${i * 0.07}s infinite alternate`,
              }}
            />
          ))}
        </div>
      ) : (
        <Mic className="w-5 h-5" />
      )}

      {isListening && (
        <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-red-300 rounded-full animate-ping" />
      )}

      <style>{`
        @keyframes waveBar { from { transform: scaleY(0.3); } to { transform: scaleY(1); } }
      `}</style>
    </button>
  );
}
