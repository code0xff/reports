"""Count SYSTEM_ADDRESS logs in the 100 blocks before and after Sepolia's Glamsterdam fork block.
Usage: python3 -I fork_boundary.py [fork_block] [rpc]"""
import json, sys, urllib.request
FORK = int(sys.argv[1]) if len(sys.argv) > 1 else 11856337
RPC = sys.argv[2] if len(sys.argv) > 2 else "https://ethereum-sepolia-rpc.publicnode.com"
def logs(a, b):
    req = urllib.request.Request(RPC, json.dumps({"jsonrpc": "2.0", "id": 1, "method": "eth_getLogs", "params": [{"address": "0xfffffffffffffffffffffffffffffffffffffffe", "fromBlock": hex(a), "toBlock": hex(b)}]}).encode(), {"content-type": "application/json", "user-agent": "eip7708-check"})
    return json.load(urllib.request.urlopen(req, timeout=60))
for a, b in ((FORK - 100, FORK - 1), (FORK, FORK + 99)):
    d = logs(a, b); r = d.get("result")
    print(a, b, len(r) if isinstance(r, list) else d, min((int(x["blockNumber"], 16) for x in r), default=None) if isinstance(r, list) else "")
