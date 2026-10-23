"""Analyse escrow_rawlogs.py output: capture latency, expiry windows, collectors, operator share.

Usage: python3 analyze_rawlogs.py <rawlogs.jsonl> topics.json
Base produces a block every 2 s, so block deltas are converted at 2 s/block.
"""
import json, sys, statistics, collections

V11 = "0xf96815976523e00e65be8f34ca5e64b4f41eb19c"
topics = json.load(open(sys.argv[2]))
auth = {}; first_cap = {}; ops = collections.Counter(); coll = collections.Counter()
win_cap = []; win_ref = []; win_pre = []; refunds = 0; per_ver = collections.Counter()
fee_bps = collections.Counter()
for line in open(sys.argv[1]):
    lg = json.loads(line); ev = topics.get(lg["topics"][0]); blk = int(lg["blockNumber"], 16)
    ver = "v1.1" if lg["address"].lower() == V11 else "v1.0"
    if ev in ("PaymentAuthorized", "PaymentCharged"):
        w = [lg["data"][2 + i:2 + i + 64] for i in range(0, len(lg["data"]) - 2, 64)]
        h = lg["topics"][1]; per_ver[(ver, ev)] += 1
        ops[(ver, "0x" + w[0][24:])] += 1; coll[(ver, "0x" + w[13][24:])] += 1
        pre, authx, ref = int(w[5], 16), int(w[6], 16), int(w[7], 16)
        fee_bps[(ver, int(w[8], 16), int(w[9], 16))] += 1
        if ev == "PaymentAuthorized":
            auth[h] = (blk, ver, pre, authx, ref)
    elif ev == "PaymentCaptured":
        h = lg["topics"][1]
        if h in auth and h not in first_cap:
            first_cap[h] = blk
lat = {"v1.0": [], "v1.1": []}
for h, (blk, ver, pre, authx, ref) in auth.items():
    if h in first_cap:
        lat[ver].append((first_cap[h] - blk) * 2)
    win_cap.append((ver, authx - pre)); win_ref.append((ver, ref - authx))
def q(xs):
    xs = sorted(xs)
    if not xs: return None
    return {"n": len(xs), "p10": xs[len(xs) // 10], "median": statistics.median(xs), "p90": xs[len(xs) * 9 // 10], "max": xs[-1]}
out = {
 "events_by_version": {f"{k[0]} {k[1]}": v for k, v in per_ver.items()},
 "capture_latency_seconds": {v: q(x) for v, x in lat.items()},
 "same_block_capture_share": {v: (sum(1 for s in x if s == 0) / len(x) if x else None) for v, x in lat.items()},
 "authorizationExpiry_minus_preApprovalExpiry_s": {v: q([d for vv, d in win_cap if vv == v]) for v in ("v1.0", "v1.1")},
 "refundExpiry_minus_authorizationExpiry_s": {v: q([d for vv, d in win_ref if vv == v]) for v in ("v1.0", "v1.1")},
 "collectors": {f"{k[0]} {k[1]}": v for k, v in coll.most_common()},
 "operators": {f"{k[0]} {k[1]}": v for k, v in ops.most_common()},
 "fee_bounds(min,max)": {f"{k[0]} {k[1]}-{k[2]}": v for k, v in fee_bps.most_common(8)},
}
print(json.dumps(out, indent=1))
