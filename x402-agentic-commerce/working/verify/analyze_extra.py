"""Per-operator breakdown: payers, receivers, median capture window, amount, latency share <=10 s.
Usage: python3 analyze_extra.py <rawlogs.jsonl> topics.json"""
import json, sys, statistics, collections
topics = json.load(open(sys.argv[2]))
auth = {}; cap = {}; d = collections.defaultdict(lambda: {"n": 0, "payers": set(), "recv": set(), "win": [], "amt": []})
allpayers = set()
for line in open(sys.argv[1]):
    lg = json.loads(line); ev = topics.get(lg["topics"][0]); blk = int(lg["blockNumber"], 16)
    if ev in ("PaymentAuthorized", "PaymentCharged"):
        w = [lg["data"][2 + i:2 + i + 64] for i in range(0, len(lg["data"]) - 2, 64)]
        op = "0x" + w[0][24:]; r = d[op]; r["n"] += 1; r["payers"].add(w[1][24:]); r["recv"].add(w[2][24:])
        allpayers.add(w[1][24:]); r["win"].append(int(w[6], 16) - int(w[5], 16)); r["amt"].append(int(w[12], 16) / 1e6)
        if ev == "PaymentAuthorized": auth[lg["topics"][1]] = (blk, op)
    elif ev == "PaymentCaptured" and lg["topics"][1] not in cap:
        cap[lg["topics"][1]] = blk
fast = collections.Counter(); tot = collections.Counter()
for h, (b, op) in auth.items():
    if h in cap:
        tot[op] += 1; fast[op] += (cap[h] - b) * 2 <= 10
print("distinct payers (all):", len(allpayers))
for op, r in sorted(d.items(), key=lambda x: -x[1]["n"]):
    print(op, "n=%d payers=%d receivers=%d median_capture_window_days=%.1f median_amount=%.2f mean_amount=%.2f captured<=10s=%s/%s" % (
        r["n"], len(r["payers"]), len(r["recv"]), statistics.median(r["win"]) / 86400, statistics.median(r["amt"]), statistics.mean(r["amt"]), fast[op], tot[op]))
