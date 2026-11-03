"""Check EIP-7708 transfer logs on Sepolia against the spec, block by block.

Usage: python3 -I check_sepolia.py <n_blocks> [rpc]
For each of the last n blocks: fetch the block (full txs) and eth_getBlockReceipts, then
 - every successful tx with value>0 and to != from must have, as its FIRST log, a
   SYSTEM_ADDRESS Transfer(from,to,value) log (contract creation: to = contractAddress);
 - no tx-level Transfer log for zero-value or self-transfer txs;
 - failed txs carry no logs;
 - every SYSTEM_ADDRESS log uses the Transfer topic, 3 topics, 32-byte data, nonzero amount, from != to.
Also measures how many system logs are internal (not the tx-level one) and their share of all logs.
"""
import json, sys, urllib.request, collections

RPC = sys.argv[2] if len(sys.argv) > 2 else "https://ethereum-sepolia-rpc.publicnode.com"
SYS = "0xfffffffffffffffffffffffffffffffffffffffe"
TOPIC = "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef"

def rpc(m, p):
    for _ in range(6):
        try:
            req = urllib.request.Request(RPC, json.dumps({"jsonrpc": "2.0", "id": 1, "method": m, "params": p}).encode(),
                                         {"content-type": "application/json", "user-agent": "eip7708-check"})
            d = json.load(urllib.request.urlopen(req, timeout=60))
            if "result" in d: return d["result"]
        except Exception: pass
    raise RuntimeError(m)

def addr(topic): return "0x" + topic[-40:]
n = int(sys.argv[1]); head = int(rpc("eth_blockNumber", []), 16)
c = collections.Counter(); viol = []
for b in range(head - n + 1, head + 1):
    blk = rpc("eth_getBlockByNumber", [hex(b), True]); rcpts = {r["transactionHash"]: r for r in rpc("eth_getBlockReceipts", [hex(b)])}
    c["blocks"] += 1
    for tx in blk["transactions"]:
        r = rcpts[tx["hash"]]; logs = r["logs"]; c["txs"] += 1; c["logs_total"] += len(logs)
        ok = r["status"] == "0x1"; val = int(tx["value"], 16); frm = tx["from"].lower()
        to = (tx["to"] or r.get("contractAddress") or "").lower()
        sys_logs = [l for l in logs if l["address"].lower() == SYS]
        c["sys_logs"] += len(sys_logs)
        for l in sys_logs:
            t = l["topics"]
            if not (len(t) == 3 and t[0] == TOPIC and len(l["data"]) == 66 and int(l["data"], 16) > 0 and addr(t[1]) != addr(t[2])):
                viol.append((b, tx["hash"], "malformed system log"))
        if not ok:
            c["failed"] += 1
            if logs: viol.append((b, tx["hash"], "failed tx with logs"))
            continue
        first = logs[0] if logs else None
        first_is_tx = bool(first and first["address"].lower() == SYS and addr(first["topics"][1]) == frm and addr(first["topics"][2]) == to and int(first["data"], 16) == val)
        if val > 0 and to != frm:
            c["value_txs"] += 1; c["value_creations"] += tx["to"] is None
            if first_is_tx: c["value_txs_with_first_log"] += 1
            else: viol.append((b, tx["hash"], "missing/misplaced tx-level log"))
            internal = len(sys_logs) - 1
        else:
            c["nonvalue_or_self_txs"] += 1
            if val > 0 and to == frm: c["self_value_txs"] += 1
            internal = len(sys_logs)
        c["internal_sys_logs"] += max(internal, 0)
        if internal > 0: c["txs_with_internal_transfers"] += 1
        # tx-level log must precede EVM logs: any non-system log before the first system log?
print(json.dumps({"rpc": RPC, "range": [head - n + 1, head], "counts": dict(c), "violations": viol[:20], "n_violations": len(viol)}, indent=1))
