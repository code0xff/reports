"""Dump raw AuthCaptureEscrow logs (both deployments) for a block window to JSONL.

Usage: python3 escrow_rawlogs.py <from_block> <to_block> <out.jsonl>
Public Tenderly gateway RPC, 1000-block ranges, no credentials.
"""
import json, sys, time, urllib.request

RPC = "https://base.gateway.tenderly.co"
ADDRS = ["0xf96815976523E00e65Be8f34cA5e64b4f41EB19c", "0xBdEA0D1bcC5966192B070Fdf62aB4EF5b4420cff"]

def rpc(method, params):
    d = None
    for attempt in range(8):
        req = urllib.request.Request(RPC, data=json.dumps({"jsonrpc": "2.0", "id": 1, "method": method, "params": params}).encode(),
                                     headers={"content-type": "application/json", "user-agent": "census"})
        try:
            d = json.load(urllib.request.urlopen(req, timeout=60))
            if "result" in d:
                return d["result"]
        except Exception as e:
            d = {"exception": repr(e)}
        time.sleep(2 * (attempt + 1))
    raise RuntimeError(f"{method} failed: {d}")

lo, hi, out = int(sys.argv[1]), int(sys.argv[2]), sys.argv[3]
with open(out, "w") as f:
    b = lo
    while b <= hi:
        e = min(b + 999, hi)
        for lg in rpc("eth_getLogs", [{"address": ADDRS, "fromBlock": hex(b), "toBlock": hex(e)}]):
            f.write(json.dumps({k: lg[k] for k in ("address", "blockNumber", "transactionHash", "topics", "data")}) + "\n")
        b = e + 1
