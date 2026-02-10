// Polyfill SlowBuffer removed in Node.js v25 but still required by buffer-equal-constant-time
import { Buffer } from "node:buffer";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const bufferModule = require("node:buffer");

if (!("SlowBuffer" in bufferModule)) {
  const SlowBufferPolyfill = function SlowBuffer(length: number) {
    return Buffer.allocUnsafeSlow(length);
  } as unknown as typeof Buffer;
  SlowBufferPolyfill.prototype = Buffer.prototype;

  bufferModule.SlowBuffer = SlowBufferPolyfill;
}
