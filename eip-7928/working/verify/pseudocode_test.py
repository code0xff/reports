"""Runs EIP-7928's State Transition Function pseudocode (track_state_changes + build_bal)
verbatim on a two-transaction block: tx1 SLOADs slot 5 of contract C, tx2 SSTOREs it.
Only the get_* helpers are stubbed; the tracking and building logic is copied as written."""
C = "0xcc"
TX = [  # what each transaction touched
    {"reads": {C: [5]}, "writes": {}},          # tx 1: read slot 5
    {"reads": {}, "writes": {C: {5: 0x2a}}},    # tx 2: write slot 5 = 42
]
cur = {}
get_touched_addresses = lambda tx: [C]
get_storage_writes   = lambda addr: cur["tx"]["writes"].get(addr, {})
get_storage_reads    = lambda addr: cur["tx"]["reads"].get(addr, [])
balance_changed = nonce_changed = code_changed = lambda addr: False

# ---- copied from the EIP ----
def track_state_changes(tx, accesses, block_access_index):
    for addr in get_touched_addresses(tx):
        if addr not in accesses:
            accesses[addr] = {'storage_writes': {}, 'storage_reads': set(),
                              'balance_changes': [], 'nonce_changes': [], 'code_changes': []}
        for slot, value in get_storage_writes(addr).items():
            if slot not in accesses[addr]['storage_writes']:
                accesses[addr]['storage_writes'][slot] = []
            accesses[addr]['storage_writes'][slot].append((block_access_index, value))
        for slot in get_storage_reads(addr):
            if slot not in accesses[addr]['storage_writes']:
                accesses[addr]['storage_reads'].add(slot)

def build_bal(accesses):
    bal = []
    for addr in sorted(accesses.keys()):
        data = accesses[addr]
        storage_changes = [[slot, sorted(changes)] for slot, changes in sorted(data['storage_writes'].items())]
        bal.append([addr, storage_changes, sorted(list(data['storage_reads'])),
                    sorted(data['balance_changes']), sorted(data['nonce_changes']), sorted(data['code_changes'])])
    return bal
# -----------------------------

acc = {}
for i, tx in enumerate(TX):
    cur["tx"] = tx
    track_state_changes(tx, acc, i + 1)
bal = build_bal(acc)
addr, changes, reads = bal[0][0], bal[0][1], bal[0][2]
both = {s for s, _ in changes} & set(reads)
print("BAL produced by the EIP's pseudocode:", bal)
print("slot in storage_changes:", [s for s, _ in changes], "| slot in storage_reads:", reads)
print("violates 'MUST NOT appear in both storage_changes and storage_reads':", bool(both))
# Order reversed (write then read) for comparison:
acc2 = {}
for i, tx in enumerate(reversed(TX)):
    cur["tx"] = tx; track_state_changes(tx, acc2, i + 1)
b2 = build_bal(acc2)[0]
print("reversed order (write in tx1, read in tx2) overlap:", bool({s for s, _ in b2[1]} & set(b2[2])))
