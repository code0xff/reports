// Demonstrates the cross-account replay gap that ERC-7739 exists to close, and
// shows that Safe-style domain binding closes it.
//
// This is a faithful re-implementation in JavaScript of the *verification
// logic* of three isValidSignature variants. It is not an on-chain test: no
// node, no deployment, no real account. The ECDSA signing and recovery are real
// (viem / secp256k1); the key is generated fresh in-process for this run.

import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { keccak256, encodeAbiParameters, parseAbiParameters, recoverAddress, toHex } from "viem";

const OWNER = privateKeyToAccount(generatePrivateKey());   // one EOA owning both accounts
const ACCOUNT_A = "0x000000000000000000000000000000000000aaaa";
const ACCOUNT_B = "0x000000000000000000000000000000000000bbbb";
const CHAIN_ID = 1n;
const MAGIC = "0x1626ba7e";
const FAIL = "0xffffffff";

// --- variant 1: the naive implementation ---------------------------------
// This mirrors EIP-1271's own Reference Implementation (recover, compare to
// `owner`) and ERC-7739's "This implementation is NOT safe" example. Neither
// binds the account address, so the account parameter is unused on purpose.
async function isValidSignature_naive(_account, hash, signature) {
  const signer = await recoverAddress({ hash, signature }).catch(() => null);
  return signer?.toLowerCase() === OWNER.address.toLowerCase() ? MAGIC : FAIL;
}

// --- variant 2: Safe-style domain binding --------------------------------
// CompatibilityFallbackHandler rehashes the incoming hash into a SafeMessage
// under the Safe's own EIP-712 domain before checking signatures.
const SAFE_MSG_TYPEHASH = keccak256(toHex("SafeMessage(bytes message)"));
const DOMAIN_TYPEHASH = keccak256(toHex("EIP712Domain(uint256 chainId,address verifyingContract)"));

function safeMessageHash(account, hash) {
  const domainSeparator = keccak256(
    encodeAbiParameters(parseAbiParameters("bytes32, uint256, address"), [DOMAIN_TYPEHASH, CHAIN_ID, account]),
  );
  const message = encodeAbiParameters(parseAbiParameters("bytes32"), [hash]); // abi.encode(_dataHash)
  const safeMessage = keccak256(
    encodeAbiParameters(parseAbiParameters("bytes32, bytes32"), [SAFE_MSG_TYPEHASH, keccak256(message)]),
  );
  return keccak256(`0x1901${domainSeparator.slice(2)}${safeMessage.slice(2)}`);
}

async function isValidSignature_domainBound(account, hash, signature) {
  const signer = await recoverAddress({ hash: safeMessageHash(account, hash), signature }).catch(() => null);
  return signer?.toLowerCase() === OWNER.address.toLowerCase() ? MAGIC : FAIL;
}

// -------------------------------------------------------------------------
let pass = 0, fail = 0;
const check = (name, got, want) => {
  const ok = got === want;
  console.log(`${ok ? "PASS" : "FAIL"}  ${name.padEnd(62)} -> ${got}`);
  ok ? pass++ : fail++;
};

// An application hash that does not mention which account is signing.
// ERC-7739 names Permit2 as a real example of exactly this shape.
const appHash = keccak256(toHex("transfer 1000 USDC to 0xdead"));

console.log(`owner EOA (generated for this run): ${OWNER.address}`);
console.log(`account A ${ACCOUNT_A}\naccount B ${ACCOUNT_B}\napp hash  ${appHash}\n`);

console.log("naive implementation (EIP-1271 reference shape)");
const sigNaive = await OWNER.sign({ hash: appHash });
check("signature produced for account A is accepted by A", await isValidSignature_naive(ACCOUNT_A, appHash, sigNaive), MAGIC);
check("the SAME signature is also accepted by account B", await isValidSignature_naive(ACCOUNT_B, appHash, sigNaive), MAGIC);

console.log("\nSafe-style domain binding");
const sigBoundToA = await OWNER.sign({ hash: safeMessageHash(ACCOUNT_A, appHash) });
check("signature produced for account A is accepted by A", await isValidSignature_domainBound(ACCOUNT_A, appHash, sigBoundToA), MAGIC);
check("the SAME signature is rejected by account B", await isValidSignature_domainBound(ACCOUNT_B, appHash, sigBoundToA), FAIL);

console.log("\nthe two accounts really do derive different signing hashes");
const hA = safeMessageHash(ACCOUNT_A, appHash), hB = safeMessageHash(ACCOUNT_B, appHash);
console.log(`   A: ${hA}\n   B: ${hB}`);
check("SafeMessage hashes differ per account", String(hA !== hB), "true");

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
