import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface VoiceInputProps {
  open: boolean;
  onClose: () => void;
  onTranscript: (text: string) => void;
}

export default function VoiceInput({ open, onClose, onTranscript }: VoiceInputProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const animFrameRef = useRef<number>(0);
  const analyserRef = useRef<AnalyserNode | null>(null);

  const transcribeMutation = trpc.voice.transcribe.useMutation({
    onSuccess: (data) => {
      setIsProcessing(false);
      if (data.text) {
        onTranscript(data.text);
      }
    },
    onError: (err) => {
      setIsProcessing(false);
      toast.error("Transcription failed: " + err.message);
    }
  });

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const audioCtx = new AudioContext();
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;

      const mr = new MediaRecorder(stream, { mimeType: "audio/webm" });
      mediaRecorderRef.current = mr;
      chunksRef.current = [];

      mr.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mr.start(100);
      setIsRecording(true);

      const updateLevel = () => {
        const data = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(data);
        const avg = data.reduce((a, b) => a + b, 0) / data.length;
        setAudioLevel(avg / 128);
        animFrameRef.current = requestAnimationFrame(updateLevel);
      };
      updateLevel();
    } catch {
      toast.error("Microphone access denied");
    }
  };

  const stopRecording = async () => {
    if (!mediaRecorderRef.current) return;
    cancelAnimationFrame(animFrameRef.current);
    setAudioLevel(0);

    mediaRecorderRef.current.stop();
    mediaRecorderRef.current.stream.getTracks().forEach(t => t.stop());
    setIsRecording(false);
    setIsProcessing(true);

    await new Promise<void>(resolve => {
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.onstop = () => resolve();
      } else {
        resolve();
      }
    });

    const blob = new Blob(chunksRef.current, { type: "audio/webm" });
    if (blob.size > 16 * 1024 * 1024) {
      toast.error("Recording too long (max 16MB)");
      setIsProcessing(false);
      return;
    }

    // Upload to storage then transcribe
    const formData = new FormData();
    formData.append("file", blob, "voice.webm");

    try {
      const res = await fetch("/api/upload-audio", { method: "POST", body: formData });
      const { url } = await res.json() as { url: string };
      transcribeMutation.mutate({ audioUrl: url, language: "en" });
    } catch {
      // Fallback: use base64 data URL for small recordings
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        transcribeMutation.mutate({ audioUrl: dataUrl });
      };
      reader.readAsDataURL(blob);
    }
  };

  useEffect(() => {
    if (!open) {
      if (isRecording) stopRecording();
      setIsRecording(false);
      setIsProcessing(false);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Voice Input</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center gap-6 py-4">
          {/* Visualizer */}
          <div className="relative w-24 h-24 flex items-center justify-center">
            {isRecording && (
              <>
                <div
                  className="absolute inset-0 rounded-full bg-destructive/20 transition-transform duration-100"
                  style={{ transform: `scale(${1 + audioLevel * 0.5})` }}
                />
                <div
                  className="absolute inset-2 rounded-full bg-destructive/10 transition-transform duration-100"
                  style={{ transform: `scale(${1 + audioLevel * 0.3})` }}
                />
              </>
            )}
            <Button
              size="icon"
              className={`w-16 h-16 rounded-full ${isRecording ? "bg-destructive hover:bg-destructive/90" : "bg-primary hover:bg-primary/90"}`}
              onClick={isRecording ? stopRecording : startRecording}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : isRecording ? (
                <MicOff className="w-6 h-6" />
              ) : (
                <Mic className="w-6 h-6" />
              )}
            </Button>
          </div>

          <p className="text-sm text-muted-foreground text-center">
            {isProcessing ? "Transcribing..." : isRecording ? "Recording... tap to stop" : "Tap to start recording"}
          </p>

          <Button variant="outline" onClick={onClose} className="w-full">
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
