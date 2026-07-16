import json
import urllib.error
import urllib.request
import importlib.util

spec = importlib.util.spec_from_file_location("seed", "/tmp/seed_oficioshub.py")
seed = importlib.util.module_from_spec(spec)
spec.loader.exec_module(seed)
seed.API = "http://127.0.0.1:8000"


def api(method, path, token=None, body=None):
    data = None if body is None else json.dumps(body, ensure_ascii=False).encode("utf-8")
    headers = {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0 OficiosHubSeed/1.0",
    }
    if token:
        headers["Authorization"] = f"Bearer {token}"
    headers["X-Account-ID"] = seed.ACCOUNT_ID
    headers["X-Account-Slug"] = seed.ACCOUNT_SLUG
    req = urllib.request.Request(f"{seed.API}{path}", data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req, timeout=60) as resp:
            raw = resp.read().decode("utf-8")
            return resp.status, json.loads(raw) if raw else {}
    except urllib.error.HTTPError as e:
        raw = e.read().decode("utf-8", errors="replace")
        try:
            payload = json.loads(raw)
        except json.JSONDecodeError:
            payload = {"raw": raw[:800]}
        return e.code, payload


seed.api = api
raise SystemExit(seed.main())
