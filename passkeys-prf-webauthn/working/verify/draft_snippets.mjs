// Run the code EXACTLY as printed in the draft's Implementation Guide,
// with only navigator.credentials stubbed. Goal: catch undefined helpers
// and any copy-adaptation errors introduced while writing prose.
// Node 24 exposes globalThis.crypto (WebCrypto) natively, same API surface as the browser.
let fail = 0;
const must = (n, c) => { console.log(`${c?'PASS':'FAIL'}  ${n}`); if(!c) fail++; };

// ---- helpers referenced by the draft snippets ----
const toBytes = v => new Uint8Array(v.buffer ?? v, v.byteOffset ?? 0, v.byteLength ?? v.length);
const bytesToHex = b => Buffer.from(b).toString('hex');
const b64u = b => Buffer.from(b).toString('base64').replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');

// ---- draft snippet: deriveKey (verbatim) ----
async function deriveKey(prfOutput, purpose) {
  const ikm = await crypto.subtle.importKey("raw", prfOutput, "HKDF", false, ["deriveKey"]);
  return crypto.subtle.deriveKey(
    { name: "HKDF", hash: "SHA-256", salt: new Uint8Array(0),
      info: new TextEncoder().encode(`example.com|${purpose}|v1`) },
    ikm, { name: "AES-GCM", length: 256 }, false,
    ["encrypt", "decrypt", "wrapKey", "unwrapKey"]);
}

// spec vectors standing in for two passkeys' PRF outputs
const H = h => Uint8Array.from(Buffer.from(h,'hex'));
const prfA = H('3c33e07d202c3b029cc21f1722767021bf27d595933b3d2b6a1b9d5dddc77fae');
const prfB = H('a62a8773b19cda90d7ed4ef72a80a804320dbd3997e2f663805ad1fd3293d50b');
const plaintext = new TextEncoder().encode('sensitive');

// ---- draft snippet: envelope encryption (verbatim) ----
const dek = await crypto.subtle.generateKey({ name: "AES-GCM", length: 256 }, true, ["encrypt", "decrypt"]);
const iv  = crypto.getRandomValues(new Uint8Array(12));
const ciphertext = await crypto.subtle.encrypt(
  { name: "AES-GCM", iv, additionalData: new TextEncoder().encode("doc:42") }, dek, plaintext);

async function wrapDekFor(prfOutput) {
  const kek = await deriveKey(prfOutput, "vault-kek");
  const wIv = crypto.getRandomValues(new Uint8Array(12));
  return { wIv, wrapped: await crypto.subtle.wrapKey("raw", dek, kek, { name: "AES-GCM", iv: wIv }) };
}
async function unwrapDek(prfOutput, rec) {
  const kek = await deriveKey(prfOutput, "vault-kek");
  return crypto.subtle.unwrapKey("raw", rec.wrapped, kek,
    { name: "AES-GCM", iv: rec.wIv }, { name: "AES-GCM", length: 256 }, false, ["encrypt", "decrypt"]);
}

console.log('=== draft snippets, run verbatim ===');
const recA = await wrapDekFor(prfA), recB = await wrapDekFor(prfB);
must('deriveKey runs with extractable:false and still wraps', !!recA.wrapped);
const dekA = await unwrapDek(prfA, recA);
const out = await crypto.subtle.decrypt(
  { name:'AES-GCM', iv, additionalData:new TextEncoder().encode('doc:42') }, dekA, ciphertext);
must('unwrapped DEK (extractable:false) can decrypt', new TextDecoder().decode(out)==='sensitive');
const dekB = await unwrapDek(prfB, recB);
const out2 = await crypto.subtle.decrypt(
  { name:'AES-GCM', iv, additionalData:new TextEncoder().encode('doc:42') }, dekB, ciphertext);
must('second passkey opens the same ciphertext', new TextDecoder().decode(out2)==='sensitive');

// ---- draft snippet: keyCheckValue (verbatim) ----
async function keyCheckValue(prfOutput) {
  const k = await deriveKey(prfOutput, "vault-kek");
  const t = await crypto.subtle.encrypt({ name: "AES-GCM", iv: new Uint8Array(12) }, k,
                                        new TextEncoder().encode("kcv"));
  return bytesToHex(new Uint8Array(t)).slice(0, 32);
}
const k1 = await keyCheckValue(prfA);
must('keyCheckValue stable',  k1 === await keyCheckValue(prfA));
must('keyCheckValue differs', k1 !== await keyCheckValue(prfB));

// ---- draft snippet: rotation (verbatim shape) ----
const results = { first: prfA, second: prfB };
const dekNow  = await unwrapDek(toBytes(results.first), recA);
const nextRec = await wrapDekFor(toBytes(results.second));
const out3 = await crypto.subtle.decrypt(
  { name:'AES-GCM', iv, additionalData:new TextEncoder().encode('doc:42') },
  await unwrapDek(toBytes(results.second), nextRec), ciphertext);
must('rotation re-wrap opens data', new TextDecoder().decode(out3)==='sensitive');

// ---- draft snippet: toBytes on a Uint32Array ----
const u32 = new Uint32Array([0x982e17c4,0xc397902e,0xb70c6c9a,0x5b37cb20,0xadfce392,0xe4634a15,0x09f1933a,0x73191e6b]);
must('toBytes normalizes Uint32Array to 32 bytes',
  bytesToHex(toBytes(u32))==='c4172e982e9097c39a6c0cb720cb375b92e3fcad154a63e43a93f1096b1e1973');
must('b64u helper produces url-safe output', !/[+/=]/.test(b64u(new Uint8Array([251,255,254]))));

console.log(fail ? `\n${fail} FAILURES` : '\nall draft snippets execute correctly');
process.exit(fail?1:0);
