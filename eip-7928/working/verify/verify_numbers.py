"""Arithmetic behind figures quoted in the report."""
gl = [60_000_000, 200_000_000]
for g in gl:
    cap, cheapest = g // 2000, g // 2100
    print(f"gas limit {g/1e6:.0f}M: bal_items cap {cap:,}; cold-SLOAD-only max {cheapest:,}; buffer {cap-cheapest:,} = gl/42000 -> {g/42000:,.0f}")
slots_per_epoch, kib_snappy, kib_raw = 32, 92.1, 136.6   # EIP-7928 Oct-2026 analysis averages (60M)
for label, ep in [("EIP-7928 retention (3533 epochs)", 3533), ("post-EIP-8061 WSP (~7.0 d = 1575 epochs)", 7 * 225)]:
    blocks = ep * slots_per_epoch
    print(f"{label}: {ep*32*12/86400:.1f} days, {blocks:,} blocks, ~{blocks*kib_snappy/2**20:.1f} GiB snappy / ~{blocks*kib_raw/2**20:.1f} GiB raw")
print(f"BNB benchmark: throughput {691.48/583-1:+.1%}, p95 block time {440.43/333.44-1:+.1%}")
