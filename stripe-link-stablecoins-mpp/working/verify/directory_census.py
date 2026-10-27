"""Summarise the MPP services directory (https://mpp.dev/api/services).

Usage: python3 -I directory_census.py <services.json>
Counts services by payment method, intent, integration type and status,
and endpoint prices for the tempo method (6-decimal stablecoin units).
"""
import json, sys, collections, statistics

d = json.load(open(sys.argv[1]))
items = next(v for v in d.values() if isinstance(v, list))
meth = collections.Counter(); intents = collections.Counter(); integ = collections.Counter()
status = collections.Counter(); combos = collections.Counter(); eps = 0; prices = []
ep_method = collections.Counter(); ep_intent = collections.Counter()
for s in items:
    ms = sorted((s.get("methods") or {}).keys())
    combos["+".join(ms) or "(none)"] += 1
    for m, v in (s.get("methods") or {}).items():
        meth[m] += 1
        for i in v.get("intents", []):
            intents[(m, i)] += 1
    integ[s.get("integration")] += 1
    status[s.get("status")] += 1
    for e in s.get("endpoints") or []:
        eps += 1
        p = e.get("payment") or {}
        ep_method[p.get("method")] += 1; ep_intent[p.get("intent")] += 1
        if p.get("method") == "tempo" and p.get("amount") and p.get("decimals") == 6 and p.get("intent") == "charge":
            prices.append(int(p["amount"]) / 1e6)
print("services:", len(items), "endpoints:", eps)
print("services by method:", dict(meth.most_common()))
print("method combos:", dict(combos.most_common(10)))
print("service intents (method,intent):", {f"{k[0]}/{k[1]}": v for k, v in intents.most_common()})
print("integration:", dict(integ)); print("status:", dict(status))
print("endpoints by method:", dict(ep_method.most_common())); print("endpoints by intent:", dict(ep_intent.most_common()))
if prices:
    q = sorted(prices)
    print("tempo charge price USD: n=%d median=%.4f p10=%.4f p90=%.4f max=%.2f" % (len(q), statistics.median(q), q[len(q)//10], q[len(q)*9//10], q[-1]))
