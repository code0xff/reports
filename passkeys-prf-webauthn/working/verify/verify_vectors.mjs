// Verify the WebAuthn PRF chain against the official W3C WebAuthn L3 test vectors (§16.17.1).
import { webcrypto as crypto } from 'node:crypto';
const te = new TextEncoder();
const hex = b => Buffer.from(b).toString('hex');
const H  = h => Uint8Array.from(Buffer.from(h, 'hex'));
const cat = (...a) => { const o = new Uint8Array(a.reduce((n,x)=>n+x.length,0)); let i=0; for(const x of a){o.set(x,i); i+=x.length;} return o; };
const sha256 = async d => new Uint8Array(await crypto.subtle.digest('SHA-256', d));

let pass = 0, fail = 0;
const check = (name, got, want) => {
  const ok = got === want;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`);
  if (!ok) { console.log(`      got  ${got}\n      want ${want}`); fail++; } else pass++;
};

// ---- spec-published values (§16.17.1) ----
const V = {
  prf_eval_first : '576562417574686e20505246207465737420766563746f727302',
  prf_eval_second: '576562417574686e20505246207465737420766563746f727303',
  cred_random    : '437e065e723a98b2f08f39d8baf7c53ecb3c363c5e5104bdaaf5d5ca2e028154',
  salt1          : '527413ebb48293772df30f031c5ac4650c7de14bf9498671ae163447b6a772b3',
  salt2          : 'd68ac03329a10ee5e0ec834492bb9a96a0e547baf563bf78ccbe8789b22e776b',
  output1        : '3c33e07d202c3b029cc21f1722767021bf27d595933b3d2b6a1b9d5dddc77fae',
  output2        : 'a62a8773b19cda90d7ed4ef72a80a804320dbd3997e2f663805ad1fd3293d50b',
  credIdB64u     : 'e02eZ9lPp0UdkF4vGRO4-NxlhWBkL1FCmsmb1tTfRyE',
  apiFirst       : 'c4172e982e9097c39a6c0cb720cb375b92e3fcad154a63e43a93f1096b1e1973',
};

const seed = te.encode('WebAuthn PRF test vectors');

console.log('=== 1. RP-side inputs are seed||0x02 and seed||0x03 ===');
check('prf_eval_first  = seed || 0x02', hex(cat(seed, H('02'))), V.prf_eval_first);
check('prf_eval_second = seed || 0x03', hex(cat(seed, H('03'))), V.prf_eval_second);

console.log('\n=== 2. authenticator CredRandom = SHA-256(seed || 0x06) ===');
check('cred_random', hex(await sha256(cat(seed, H('06')))), V.cred_random);

console.log('\n=== 3. client-side domain separation: SHA-256("WebAuthn PRF" || 0x00 || input) ===');
const ctx = cat(te.encode('WebAuthn PRF'), H('00'));
const saltOf = async input => await sha256(cat(ctx, input));
check('salt1', hex(await saltOf(H(V.prf_eval_first))),  V.salt1);
check('salt2', hex(await saltOf(H(V.prf_eval_second))), V.salt2);

console.log('\n=== 4. authenticator: outputN = HMAC-SHA-256(CredRandom, saltN) ===');
const hkey = await crypto.subtle.importKey('raw', H(V.cred_random), {name:'HMAC',hash:'SHA-256'}, false, ['sign']);
const hmac = async m => new Uint8Array(await crypto.subtle.sign('HMAC', hkey, m));
check('output1', hex(await hmac(H(V.salt1))), V.output1);
check('output2', hex(await hmac(H(V.salt2))), V.output2);

console.log('\n=== 5. end-to-end: RP input -> PRF output, no intermediate values ===');
const prf = async rpInput => hex(await hmac(await saltOf(rpInput)));
check('e2e first  (seed||0x02)', await prf(cat(seed,H('02'))), V.output1);
check('e2e second (seed||0x03)', await prf(cat(seed,H('03'))), V.output2);

console.log('\n=== 6. API-section vectors ===');
const b64u = b => Buffer.from(b).toString('base64').replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
check('credential ID = b64u(SHA-256(seed || 0x00))', b64u(await sha256(cat(seed,H('00')))), V.credIdB64u);
check('API results.first  = SHA-256(seed || 0x01)',  hex(await sha256(cat(seed,H('01')))),  V.apiFirst);

console.log('\n=== 7. determinism + independence properties ===');
check('same input -> same output', await prf(cat(seed,H('02'))), await prf(cat(seed,H('02'))));
const d1 = await prf(cat(seed,H('02'))), d2 = await prf(cat(seed,H('03')))
console.log(`${d1!==d2 ? 'PASS' : 'FAIL'}  different inputs -> different outputs`); d1!==d2?pass++:fail++;

console.log(`\n---------------- ${pass} passed, ${fail} failed ----------------`);
process.exit(fail ? 1 : 0);
