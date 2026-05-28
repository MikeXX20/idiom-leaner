import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useRecorder } from "./useRecorder";

class FakeMediaRecorder extends EventTarget {
  static isTypeSupported = vi.fn(() => true);
  state: RecordingState = "inactive";
  ondataavailable: ((event: BlobEvent) => void) | null = null;
  onstop: (() => void) | null = null;

  start() {
    this.state = "recording";
  }

  stop() {
    this.state = "inactive";
    this.ondataavailable?.({ data: new Blob(["audio"], { type: "audio/webm" }) } as BlobEvent);
    this.onstop?.();
  }
}

describe("useRecorder", () => {
  beforeEach(() => {
    vi.stubGlobal("MediaRecorder", FakeMediaRecorder);
    Object.defineProperty(navigator, "mediaDevices", {
      configurable: true,
      value: {
        getUserMedia: vi.fn().mockResolvedValue({
          getTracks: () => [{ stop: vi.fn() }]
        })
      }
    });
  });

  it("records an audio blob", async () => {
    const { result } = renderHook(() => useRecorder());

    await act(async () => {
      await result.current.start();
    });

    expect(result.current.status).toBe("recording");

    await act(async () => {
      result.current.stop();
    });

    expect(result.current.status).toBe("stopped");
    expect(result.current.recording?.blob.type).toBe("audio/webm");
  });

  it("reports unsupported browsers", async () => {
    vi.stubGlobal("MediaRecorder", undefined);
    const { result } = renderHook(() => useRecorder());

    await act(async () => {
      await result.current.start();
    });

    expect(result.current.status).toBe("error");
    expect(result.current.error).toBe("This browser does not support audio recording.");
  });
});
