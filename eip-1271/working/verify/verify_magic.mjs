// Recomputes every magic value this report quotes, from its own preimage,
// instead of trusting the comment next to it in the specification or the SDK.
import { keccak256 } from "js-sha3";

const selector = (sig) => "0x" + keccak256(sig).slice(0, 8);

let pass = 0, fail = 0;
const check = (name, got, want) => {
  const ok = got.toLowerCase() === want.toLowerCase();
  console.log(`${ok ? "PASS" : "FAIL"}  ${name.padEnd(52)} ${got}${ok ? "" : "  (expected " + want + ")"}`);
  ok ? pass++ : fail++;
};

// EIP-1271, current: the spec comment claims this equals 0x1626ba7e.
check('bytes4(keccak256("isValidSignature(bytes32,bytes)"))', selector("isValidSignature(bytes32,bytes)"), "0x1626ba7e");

// EIP-1271 before the 2020-07-09 commit, and Safe v1.3.0's EIP1271_MAGIC_VALUE.
check('bytes4(keccak256("isValidSignature(bytes,bytes)"))', selector("isValidSignature(bytes,bytes)"), "0x20c13b0b");

// Safe's SAFE_MSG_TYPEHASH, precomputed in CompatibilityFallbackHandler.
check('keccak256("SafeMessage(bytes message)")',
  "0x" + keccak256("SafeMessage(bytes message)"),
  "0x60b3cbf8b4a223d68d641b3b6ddf9a298e7f33710cf3d3a9d1146b5a6150fbca");

// Solady's _PERSONAL_SIGN_TYPEHASH for the ERC-7739 PersonalSign workflow.
check('keccak256("PersonalSign(bytes prefixed)")',
  "0x" + keccak256("PersonalSign(bytes prefixed)"),
  "0x983e65e5148e570cd828ead231ee759a8d7958721a768f93bc4483ba005c32de");

// ERC-6492's wrapper suffix is a literal constant, not a hash: check its shape.
const m6492 = "0x6492649264926492649264926492649264926492649264926492649264926492";
check("ERC-6492 magicBytes is 32 bytes of repeated 0x6492",
  "0x" + "6492".repeat(16), m6492);

// ERC-7739 support-detection sentinel, as Solady computes it at runtime:
// `~signature.length / 0xffff * 0x7739` with signature.length == 0.
// ~0 is 2**256-1; (2**256-1)/0xffff*0x7739 must equal 0x7739...7739.
const MAX = (1n << 256n) - 1n;
const sentinel = "0x" + ((MAX / 0xffffn) * 0x7739n).toString(16).padStart(64, "0");
check("Solady ERC-7739 sentinel hash == 0x7739 repeated", sentinel, "0x" + "7739".repeat(16));

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
