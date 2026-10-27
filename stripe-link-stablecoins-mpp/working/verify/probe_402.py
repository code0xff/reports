"""Send one unauthenticated GET to the first priced GET endpoint of each directory
service and record the HTTP status and the WWW-Authenticate Payment challenges.
No credential is sent, so nothing is paid.

Usage: python3 -I probe_402.py <services.json> > probe_402.json
"""
import json, sys, re, urllib.request, urllib.error, collections

d = json.load(open(sys.argv[1]))
items = next(v for v in d.values() if isinstance(v, list))
out = []
for s in items:
    base = s.get("serviceUrl") or ""
    ep = next((e for e in s.get("endpoints") or [] if e.get("method") == "GET" and e.get("payment") and "{" not in e.get("path", "")), None)
    if not base or not ep:
        continue
    url = base.rstrip("/") + ep["path"]
    rec = {"id": s["id"], "listed_methods": sorted((s.get("methods") or {}).keys())}
    try:
        r = urllib.request.urlopen(urllib.request.Request(url, headers={"user-agent": "mpp-directory-probe"}), timeout=20)
        rec["status"] = r.status; hdrs = r.headers
    except urllib.error.HTTPError as e:
        rec["status"] = e.code; hdrs = e.headers
    except Exception as e:
        rec["status"] = "error:" + type(e).__name__; hdrs = None
    if hdrs is not None:
        wa = hdrs.get_all("WWW-Authenticate") or []
        rec["payment_challenges"] = sum(1 for h in wa for _ in re.finditer(r'(?i)\bPayment\b', h))
        rec["challenge_methods"] = sorted(set(m.lower() for h in wa for m in re.findall(r'method="([^"]+)"', h)))
    out.append(rec)
json.dump(out, sys.stdout, indent=1)
