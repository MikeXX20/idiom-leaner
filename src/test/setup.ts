import "@testing-library/jest-dom/vitest";
import "fake-indexeddb/auto";
import { Blob as NodeBlob } from "node:buffer";
import { vi } from "vitest";

Object.defineProperty(globalThis, "Blob", {
  configurable: true,
  value: NodeBlob
});

Object.defineProperty(URL, "createObjectURL", {
  configurable: true,
  value: vi.fn(() => "blob:test-recording")
});

Object.defineProperty(URL, "revokeObjectURL", {
  configurable: true,
  value: vi.fn()
});
