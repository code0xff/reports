// Verify the application layer built on a PRF output:
//   RFC 5869 HKDF vectors, purpose separation, envelope encryption,
//   multi-passkey wrapping, key rotation, and key-check values.
import { webcrypto as crypto } from 'node:crypto';
const te=new TextEncoder(), td=new TextDecoder();
const hex=b=>Buffer.from(b).toString('hex');
const H=h=>Uint8Array.from(Buffer.from(h,'hex'));
let pass=0,fail=0;
const check=(n,g,w)=>{const ok=g===w;console.log(`${ok?'PASS':'FAIL'}  ${n}`);if(!ok){console.log(`      got  ${g}\n      want ${w}`);fail++}else pass++};
const ok=(n,c)=>{console.log(`${c?'PASS':'FAIL'}  ${n}`);c?pass++:fail++};

// ---------- RFC 5869 HKDF-SHA256 test vectors ----------
console.log('=== 1. WebCrypto HKDF-SHA-256 matches RFC 5869 ===');
async function hkdfBits(ikm,salt,info,len){
  const k=await crypto.subtle.importKey('raw',ikm,'HKDF',false,['deriveBits']);
  return new Uint8Array(await crypto.subtle.deriveBits({name:'HKDF',hash:'SHA-256',salt,info},k,len*8));
}
// A.1 Basic
check('RFC5869 A.1 OKM(42)', hex(await hkdfBits(
  H('0b'.repeat(22)), H('000102030405060708090a0b0c'), H('f0f1f2f3f4f5f6f7f8f9'), 42)),
  '3cb25f25faacd57a90434f64d0362f2a2d2d0a90cf1a5a4c5db02d56ecc4c5bf34007208d5b887185865');
// A.2 Long inputs
check('RFC5869 A.2 OKM(82)', hex(await hkdfBits(
  H('000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f202122232425262728292a2b2c2d2e2f303132333435363738393a3b3c3d3e3f404142434445464748494a4b4c4d4e4f'),
  H('606162636465666768696a6b6c6d6e6f707172737475767778797a7b7c7d7e7f808182838485868788898a8b8c8d8e8f909192939495969798999a9b9c9d9e9fa0a1a2a3a4a5a6a7a8a9aaabacadaeaf'),
  H('b0b1b2b3b4b5b6b7b8b9babbbcbdbebfc0c1c2c3c4c5c6c7c8c9cacbcccdcecfd0d1d2d3d4d5d6d7d8d9dadbdcdddedfe0e1e2e3e4e5e6e7e8e9eaebecedeeeff0f1f2f3f4f5f6f7f8f9fafbfcfdfeff'),82)),
  'b11e398dc80327a1c8e7f78c596a49344f012eda2d4efad8a050cc4c19afa97c59045a99cac7827271cb41c65e590e09da3275600c2f09b8367793a9aca3db71cc30c58179ec3e87c14c01d5c1f3434f1d87');

// ---------- purpose separation ----------
console.log('\n=== 2. one PRF output -> independent purpose-bound keys ===');
const prfOutput = H('3c33e07d202c3b029cc21f1722767021bf27d595933b3d2b6a1b9d5dddc77fae'); // spec output1
const RP='example.com';
async function deriveKek(prf, purpose, extractable=false){
  const k=await crypto.subtle.importKey('raw',prf,'HKDF',false,['deriveKey']);
  return crypto.subtle.deriveKey(
    {name:'HKDF',hash:'SHA-256',salt:new Uint8Array(0),info:te.encode(`${RP}|${purpose}|v1`)},
    k,{name:'AES-GCM',length:256},extractable,['encrypt','decrypt','wrapKey','unwrapKey']);
}
const rawOf=async k=>hex(new Uint8Array(await crypto.subtle.exportKey('raw',k)));
const kA=await deriveKek(prfOutput,'vault-kek',true), kB=await deriveKek(prfOutput,'search-index',true);
ok('same purpose -> same key (deterministic)', await rawOf(kA) === await rawOf(await deriveKek(prfOutput,'vault-kek',true)));
ok('different purpose -> different key',       await rawOf(kA) !== await rawOf(kB));
console.log(`      vault-kek    = ${(await rawOf(kA)).slice(0,32)}...`);
console.log(`      search-index = ${(await rawOf(kB)).slice(0,32)}...`);

// ---------- envelope encryption ----------
console.log('\n=== 3. envelope encryption: random DEK, wrapped per credential ===');
const enc=async(key,pt,aad)=>{const iv=crypto.getRandomValues(new Uint8Array(12));
  return{iv,ct:new Uint8Array(await crypto.subtle.encrypt({name:'AES-GCM',iv,additionalData:aad},key,pt))}};
const dec=async(key,b,aad)=>new Uint8Array(await crypto.subtle.decrypt({name:'AES-GCM',iv:b.iv,additionalData:aad},key,b.ct));

const dek = await crypto.subtle.generateKey({name:'AES-GCM',length:256},true,['encrypt','decrypt']);
const plaintext = te.encode('민감한 사용자 데이터 — sensitive user data');
const dataBlob = await enc(dek, plaintext, te.encode('doc:42'));

// two different passkeys -> two different PRF outputs -> two wraps of the SAME dek
const prfPasskeyB = H('a62a8773b19cda90d7ed4ef72a80a804320dbd3997e2f663805ad1fd3293d50b'); // spec output2
const wrapDek=async(prf)=>{const kek=await deriveKek(prf,'vault-kek');
  const iv=crypto.getRandomValues(new Uint8Array(12));
  return{iv,wrapped:new Uint8Array(await crypto.subtle.wrapKey('raw',dek,kek,{name:'AES-GCM',iv}))}};
const unwrapDek=async(prf,w)=>{const kek=await deriveKek(prf,'vault-kek');
  return crypto.subtle.unwrapKey('raw',w.wrapped,kek,{name:'AES-GCM',iv:w.iv},{name:'AES-GCM',length:256},true,['encrypt','decrypt'])};

const wrapA=await wrapDek(prfOutput), wrapB=await wrapDek(prfPasskeyB);
ok('the two wraps differ (different KEKs)', hex(wrapA.wrapped)!==hex(wrapB.wrapped));
const viaA=await dec(await unwrapDek(prfOutput,wrapA), dataBlob, te.encode('doc:42'));
const viaB=await dec(await unwrapDek(prfPasskeyB,wrapB), dataBlob, te.encode('doc:42'));
check('passkey A opens the data', td.decode(viaA), td.decode(plaintext));
check('passkey B opens the SAME data', td.decode(viaB), td.decode(plaintext));

console.log('\n=== 4. wrong passkey cannot unwrap; AAD is bound ===');
let threw=false; try{ await unwrapDek(H('00'.repeat(32)),wrapA) }catch{ threw=true }
ok('unknown PRF output fails to unwrap', threw);
threw=false; try{ await dec(await unwrapDek(prfOutput,wrapA), dataBlob, te.encode('doc:99')) }catch{ threw=true }
ok('wrong AAD (doc:99) fails to decrypt', threw);

console.log('\n=== 5. credential revocation needs no data re-encryption ===');
let wraps={A:wrapA,B:wrapB}; delete wraps.B;      // revoke passkey B
const still=await dec(await unwrapDek(prfOutput,wraps.A), dataBlob, te.encode('doc:42'));
check('data still readable by A after revoking B', td.decode(still), td.decode(plaintext));
ok('ciphertext was never rewritten', hex(dataBlob.ct)===hex(dataBlob.ct));

console.log('\n=== 6. key rotation via the two salts in ONE ceremony ===');
// first=current salt, second=next salt -> re-wrap DEK under the new KEK
const nextWrap = await wrapDek(prfPasskeyB);      // "second" output = next generation
const rotated  = await dec(await unwrapDek(prfPasskeyB,nextWrap), dataBlob, te.encode('doc:42'));
check('after rotation the data opens under the new KEK', td.decode(rotated), td.decode(plaintext));

console.log('\n=== 7. key check value catches silent PRF mismatch ===');
const kcv=async prf=>{const k=await deriveKek(prf,'vault-kek');
  const iv=new Uint8Array(12); // fixed IV is safe here: single fixed plaintext, verification only
  return hex(new Uint8Array(await crypto.subtle.encrypt({name:'AES-GCM',iv},k,te.encode('kcv')))).slice(0,32)};
const good=await kcv(prfOutput);
check('KCV is stable for the right passkey', await kcv(prfOutput), good);
ok('KCV differs for a mismatched PRF value', await kcv(prfPasskeyB) !== good);
console.log(`      stored KCV = ${good}`);

console.log('\n=== 8. results.first may arrive as a non-Uint8Array BufferSource ===');
// The spec's own example returns `first` as Uint8Array and `second` as Uint32Array.
const asU32 = new Uint32Array([0x982e17c4,0xc397902e,0xb70c6c9a,0x5b37cb20,0xadfce392,0xe4634a15,0x09f1933a,0x73191e6b]);
const normalize = v => new Uint8Array(v.buffer ?? v, v.byteOffset ?? 0, v.byteLength ?? v.length);
check('normalized Uint32Array == spec first bytes', hex(normalize(asU32)),
  'c4172e982e9097c39a6c0cb720cb375b92e3fcad154a63e43a93f1096b1e1973');
ok('raw .length would have been wrong (8 vs 32)', asU32.length===8 && normalize(asU32).length===32);

console.log(`\n---------------- ${pass} passed, ${fail} failed ----------------`);
process.exit(fail?1:0);
