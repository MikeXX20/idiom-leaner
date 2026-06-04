import { useRef, useState } from "react";

export type RecorderStatus = "idle" | "recording" | "stopped" | "error";

export interface RecordedAnswer {
  blob: Blob;
  url: string;
  duration: number;
}

export function useRecorder() {
  const [status, setStatus] = useState<RecorderStatus>("idle");
  const [error, setError] = useState("");
  const [recording, setRecording] = useState<RecordedAnswer | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startedAtRef = useRef(0);

  async function start() {
    setError("");

    if (typeof MediaRecorder === "undefined") {
      setStatus("error");
      setError("This browser does not support audio recording.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = MediaRecorder.isTypeSupported("audio/webm") ? "audio/webm" : "";
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);

      chunksRef.current = [];
      startedAtRef.current = Date.now();
      streamRef.current = stream;
      recorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, {
          type: chunksRef.current[0]?.type || "audio/webm"
        });
        const duration = Math.max(1, Math.round((Date.now() - startedAtRef.current) / 1000));
        setRecording({
          blob,
          duration,
          url: URL.createObjectURL(blob)
        });
        streamRef.current?.getTracks().forEach((track) => track.stop());
        setStatus("stopped");
      };

      recorder.start();
      setStatus("recording");
    } catch {
      setStatus("error");
      setError("Microphone permission was denied or recording could not start.");
    }
  }

  function stop() {
    if (recorderRef.current?.state === "recording") {
      recorderRef.current.stop();
    }
  }

  function reset() {
    if (recording?.url) {
      URL.revokeObjectURL(recording.url);
    }
    setRecording(null);
    setStatus("idle");
    setError("");
  }

  return {
    status,
    error,
    recording,
    start,
    stop,
    reset
  };
}
