// verify the helper block exactly as printed in the draft
const toBytes    = v => new Uint8Array(v.buffer ?? v, v.byteOffset ?? 0, v.byteLength ?? v.length);
const bytesToHex = b => [...toBytes(b)].map(x => x.toString(16).padStart(2, "0")).join("");
const b64u       = b => btoa(String.fromCharCode(...toBytes(b)))
                          .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
let fail=0; const must=(n,c)=>{console.log(`${c?'PASS':'FAIL'}  ${n}`); if(!c)fail++;};
const u32 = new Uint32Array([0x982e17c4,0xc397902e,0xb70c6c9a,0x5b37cb20,0xadfce392,0xe4634a15,0x09f1933a,0x73191e6b]);
must('toBytes(Uint32Array) -> spec bytes', bytesToHex(u32)==='c4172e982e9097c39a6c0cb720cb375b92e3fcad154a63e43a93f1096b1e1973');
must('bytesToHex zero-pads',  bytesToHex(new Uint8Array([0,1,15,16,255]))==='00010f10ff');
must('bytesToHex on ArrayBuffer', bytesToHex(new Uint8Array([0xde,0xad]).buffer)==='dead');
must('b64u url-safe, unpadded', b64u(new Uint8Array([251,255,254]))==='-__-');
must('b64u matches Buffer base64url', b64u(new Uint8Array([1,2,3,4,5]))===Buffer.from([1,2,3,4,5]).toString('base64url'));
console.log(fail?`${fail} FAILURES`:'helper block correct'); process.exit(fail?1:0);
