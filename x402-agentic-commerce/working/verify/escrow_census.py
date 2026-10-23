"""Count AuthCaptureEscrow events on Base over a recent block window.

Usage: python3 escrow_census.py <blocks_back> [chunk]
Uses the public Tenderly gateway RPC (1000-block log ranges) (no credentials). Decodes operator, receiver,
token and amount from PaymentAuthorized / PaymentCharged (PaymentInfo is an
inline static tuple: word0 operator, 1 payer, 2 receiver, 3 token, 12 amount).
"""
import json, sys, time, urllib.request, collections

RPC = "https://base.gateway.tenderly.co"
ESCROWS = {"v1.1": "0xf96815976523E00e65Be8f34cA5e64b4f41EB19c",
           "v1.0": "0xBdEA0D1bcC5966192B070Fdf62aB4EF5b4420cff"}

def rpc(method, params):
    d = None
    for attempt in range(6):
        req = urllib.request.Request(RPC, data=json.dumps({"jsonrpc": "2.0", "id": 1, "method": method, "params": params}).encode(),
                                     headers={"content-type": "application/json", "user-agent": "census"})
        try:
            d = json.load(urllib.request.urlopen(req, timeout=60))
        except Exception as e:
            d = {"exception": repr(e)}; time.sleep(2 * (attempt + 1)); continue
        if "result" in d:
            return d["result"]
        time.sleep(2 * (attempt + 1))
    raise RuntimeError(f"{method} failed: {d}")

def main():
    back = int(sys.argv[1]); chunk = int(sys.argv[2]) if len(sys.argv) > 2 else 5000
    topics = json.load(open(sys.argv[3])) if len(sys.argv) > 3 else None
    head = int(rpc("eth_blockNumber", []), 16)
    start = head - back
    t_head = int(rpc("eth_getBlockByNumber", [hex(head), False])["timestamp"], 16)
    t_start = int(rpc("eth_getBlockByNumber", [hex(start), False])["timestamp"], 16)
    out = {"head": head, "start": start, "t_start": t_start, "t_head": t_head, "escrows": {}}
    for name, addr in ESCROWS.items():
        cnt = collections.Counter(); ops = collections.Counter(); recv = collections.Counter()
        vol = collections.Counter(); tokens = collections.Counter(); hashes = set()
        b = start
        while b <= head:
            e = min(b + chunk - 1, head)
            logs = rpc("eth_getLogs", [{"address": addr, "fromBlock": hex(b), "toBlock": hex(e)}])
            for lg in logs:
                t0 = lg["topics"][0]
                ev = topics.get(t0, t0[:10]) if topics else t0[:10]
                cnt[ev] += 1
                data = lg["data"][2:]
                w = [data[i:i + 64] for i in range(0, len(data), 64)]
                if ev in ("PaymentAuthorized", "PaymentCharged"):
                    op = "0x" + w[0][24:]; ops[op] += 1; recv["0x" + w[2][24:]] += 1
                    tok = "0x" + w[3][24:]; tokens[tok] += 1
                    vol[ev] += int(w[12], 16); hashes.add(lg["topics"][1])
                elif ev in ("PaymentCaptured", "PaymentVoided", "PaymentReclaimed", "PaymentRefunded"):
                    vol[ev] += int(w[0], 16)
            b = e + 1
        out["escrows"][name] = {"events": dict(cnt), "volume_atomic": dict(vol), "distinct_payments": len(hashes),
                                "top_operators": ops.most_common(8), "distinct_operators": len(ops),
                                "distinct_receivers": len(recv), "tokens": dict(tokens)}
    print(json.dumps(out, indent=1))

if __name__ == "__main__":
    main()
