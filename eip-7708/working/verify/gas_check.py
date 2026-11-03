"""On recent Sepolia blocks, compare gasUsed for plain (no-calldata, legacy/1559) transactions:
value>0 vs value==0 vs self-transfer, to see how EIP-2780's TX_VALUE_COST (which covers the
EIP-7708 log) shows up. Usage: python3 -I gas_check.py <n_blocks> [rpc]"""
import json, sys, urllib.request, collections
RPC = sys.argv[2] if len(sys.argv) > 2 else "https://ethereum-sepolia-rpc.publicnode.com"
def rpc(m, p):
    for _ in range(6):
        try:
            d = json.load(urllib.request.urlopen(urllib.request.Request(RPC, json.dumps({"jsonrpc": "2.0", "id": 1, "method": m, "params": p}).encode(), {"content-type": "application/json", "user-agent": "eip7708-check"}), timeout=60))
            if "result" in d: return d["result"]
        except Exception: pass
    raise RuntimeError(m)
n = int(sys.argv[1]); head = int(rpc("eth_blockNumber", []), 16)
g = collections.defaultdict(collections.Counter)
for b in range(head - n + 1, head + 1):
    blk = rpc("eth_getBlockByNumber", [hex(b), True]); rc = {r["transactionHash"]: r for r in rpc("eth_getBlockReceipts", [hex(b)])}
    for tx in blk["transactions"]:
        r = rc[tx["hash"]]
        if tx["input"] != "0x" or tx["to"] is None or r["status"] != "0x1" or tx.get("authorizationList"): continue
        v = int(tx["value"], 16); self_ = tx["from"].lower() == tx["to"].lower()
        kind = "self" if self_ else ("value" if v else "zero")
        g[kind][(int(r["gasUsed"], 16), len(r["logs"]))] += 1
for k, c in g.items():
    print(k, "n=%d" % sum(c.values()), "top (gasUsed, n_logs):", c.most_common(5))
