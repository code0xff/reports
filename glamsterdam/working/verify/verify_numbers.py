"""Recomputes the Glamsterdam numbers this report quotes, from the EIPs' own inputs."""
import math
ok = fail = 0
def check(name, got, want, tol=0.0):
    global ok, fail
    good = abs(got - want) <= tol if isinstance(want, (int, float)) else got == want
    print(f"{'PASS' if good else 'FAIL'}  {name:62} {got}")
    ok += good; fail += (not good)

# --- EIP-8037: cost per state byte -------------------------------------------
GiB = 2**30
blocks_per_year = (86400 // 12) * 365
state_gas_per_year = (150_000_000 // 2) * blocks_per_year
cpsb_exact = state_gas_per_year / (120 * GiB)
check("8037 blocks/year (12 s slots)", blocks_per_year, 2_628_000)
check("8037 CPSB exact (EIP rounds to 1530)", round(cpsb_exact, 2), 1529.69, 0.01)
CPSB = 1530
new_acct, storage_set = 120 * CPSB, 64 * CPSB
check("8037 new-account state gas (was 25,000)", new_acct, 183_600)
check("8037 new storage slot state gas (was 20,000)", storage_set, 97_920)
print(f"      ratios: new account x{new_acct/25_000:.2f}, new slot x{storage_set/20_000:.2f}, code byte x{CPSB/200:.2f}")

# EIP-8037's own deploy-size figures (21,000 base + 5M constructor exec + account creation)
def max_code(tx_budget):
    return (tx_budget - 21_000 - 5_000_000 - 120 * CPSB) / CPSB
check("8037 max code under EIP-7825 16,777,216 cap (EIP: ~7,564)", round(max_code(2**24)), 7_564, 1)
check("8037 max code under 2^32-1 cap (EIP: ~2,803,766)", round(max_code(2**32 - 1)), 2_803_766, 1)

# Block-level: tx.gas <= block_gas_limit - block_state_gas_used. At mainnet's live 60M limit:
mainnet_gl = 60_000_000
m60 = max_code(mainnet_gl)
print(f"INFO  max single deploy at 60M block gas limit (same assumptions): {math.floor(m60):,} bytes")
need = 21_000 + 5_000_000 + 120 * CPSB + 65_536 * CPSB
print(f"      a 65,536-byte (EIP-7954 max) deploy needs tx.gas >= {need:,} -> block gas limit >= {need/1e6:.1f}M")
print(f"      old 24,576-byte max deploy needs {21_000+5_000_000+120*CPSB+24_576*CPSB:,} gas")

# --- EIP-7976: calldata floor ---------------------------------------------------
MiB = 2**20
check("7976 10 MiB at 10 gas/byte (EIP: ~105M)", round(10*MiB*10/1e6, 1), 104.9, 0.1)
check("7976 10 MiB at 64 gas/byte (EIP: ~671M)", round(10*MiB*64/1e6, 1), 671.1, 0.1)
check("7976 worst-case size cut, non-zero bytes 40->64 (EIP: ~37%)", round((1-40/64)*100, 1), 37.5, 0.1)
check("7976 worst-case size cut, zero bytes 10->64", round((1-10/64)*100, 1), 84.4, 0.1)

# --- Sepolia: fastest possible 60M -> 200M ramp under EIP-1559's 1/1024 rule ----
g, n = 60_000_000, 0
while g < 200_000_000:
    g += g // 1024 - 1; n += 1
print(f"INFO  Sepolia 60M -> 200M minimum: {n} blocks = {n*12/3600:.1f} h at 12 s slots")
print(f"\n{ok} passed, {fail} failed")
