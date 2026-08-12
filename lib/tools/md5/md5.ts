// MD5, in the browser.
//
// WHY NOT JUST CALL /tools/md5
//
// That endpoint exists and stays (it is the API surface, and it is genuinely
// useful from curl or an agent). But people paste emails, tokens, and
// passwords into hash tools — that is most of what a public MD5 tool gets
// used for — and sending those to a server so it can run six lines of
// arithmetic is a bad trade. Web Crypto has no MD5 digest, which is why this
// is implemented rather than delegated.
//
// MD5 IS BROKEN, AND THAT IS FINE HERE
//
// Collisions are cheap and have been for twenty years. It is still the right
// tool for checksums, cache keys, dedupe keys, and Gravatar identifiers,
// which is what people actually want it for. The UI says so plainly rather
// than pretending otherwise.
//
// RFC 1321. Operates on UTF-8 bytes so non-ASCII input hashes the same as it
// would server-side.

/** Per-round shift amounts. */
const SHIFTS = [
  7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22,
  5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20,
  4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23,
  6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21,
];

/** Sine-derived constants: floor(abs(sin(i + 1)) * 2^32). */
const K = Array.from({ length: 64 }, (_, i) =>
  Math.floor(Math.abs(Math.sin(i + 1)) * 4294967296),
);

/** Rotate left, on a 32-bit word. */
function rotl(value: number, amount: number): number {
  return (value << amount) | (value >>> (32 - amount));
}

/**
 * Hashes bytes to a lowercase hex MD5 digest.
 *
 * @param bytes - The input, already UTF-8 encoded.
 */
export function md5Bytes(bytes: Uint8Array): string {
  try {
    const originalBitLength = bytes.length * 8;

    // Pad to 56 mod 64, then append the 64-bit little-endian bit length.
    const paddedLength = (((bytes.length + 8) >> 6) + 1) << 6;
    const padded = new Uint8Array(paddedLength);
    padded.set(bytes);
    padded[bytes.length] = 0x80;

    const view = new DataView(padded.buffer);
    // Only the low 32 bits are written. An input long enough to overflow that
    // is ~512 MB, well past what this tool accepts.
    view.setUint32(paddedLength - 8, originalBitLength >>> 0, true);

    let a0 = 0x67452301;
    let b0 = 0xefcdab89;
    let c0 = 0x98badcfe;
    let d0 = 0x10325476;

    for (let chunk = 0; chunk < paddedLength; chunk += 64) {
      const words = new Array<number>(16);
      for (let i = 0; i < 16; i += 1) {
        words[i] = view.getUint32(chunk + i * 4, true);
      }

      let a = a0;
      let b = b0;
      let c = c0;
      let d = d0;

      for (let i = 0; i < 64; i += 1) {
        let f: number;
        let g: number;

        if (i < 16) {
          f = (b & c) | (~b & d);
          g = i;
        } else if (i < 32) {
          f = (d & b) | (~d & c);
          g = (5 * i + 1) % 16;
        } else if (i < 48) {
          f = b ^ c ^ d;
          g = (3 * i + 5) % 16;
        } else {
          f = c ^ (b | ~d);
          g = (7 * i) % 16;
        }

        // `>>> 0` after each add keeps the intermediate inside 32 bits;
        // without it JS float precision silently corrupts long inputs.
        const temp = d;
        d = c;
        c = b;
        const sum = (a + f + K[i] + words[g]) >>> 0;
        b = (b + rotl(sum, SHIFTS[i])) >>> 0;
        a = temp;
      }

      a0 = (a0 + a) >>> 0;
      b0 = (b0 + b) >>> 0;
      c0 = (c0 + c) >>> 0;
      d0 = (d0 + d) >>> 0;
    }

    const out = new DataView(new ArrayBuffer(16));
    out.setUint32(0, a0, true);
    out.setUint32(4, b0, true);
    out.setUint32(8, c0, true);
    out.setUint32(12, d0, true);

    let hex = "";
    for (let i = 0; i < 16; i += 1) {
      hex += out.getUint8(i).toString(16).padStart(2, "0");
    }
    return hex;
  } catch {
    return "";
  }
}

/**
 * Hashes a string to a lowercase hex MD5 digest, over its UTF-8 bytes.
 *
 * @param text - The text to hash.
 */
export function md5(text: string): string {
  try {
    return md5Bytes(new TextEncoder().encode(text));
  } catch {
    return "";
  }
}
