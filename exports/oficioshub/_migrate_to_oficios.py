#!/usr/bin/env python3
"""Crea github.com/andrescunier/Oficios y deja listo el remote local."""
from __future__ import annotations

import base64
import json
import subprocess
import urllib.error
import urllib.request
from pathlib import Path

OWNER = "andrescunier"
NAME = "Oficios"
ROOT = Path(__file__).resolve().parents[2]


def git_credential() -> tuple[str, str]:
    proc = subprocess.run(
        ["git", "credential", "fill"],
        input="protocol=https\nhost=github.com\n\n",
        text=True,
        capture_output=True,
        timeout=20,
        check=True,
        cwd=str(ROOT),
    )
    data: dict[str, str] = {}
    for line in proc.stdout.splitlines():
        if "=" in line:
            key, value = line.split("=", 1)
            data[key] = value
    username = data.get("username") or ""
    password = data.get("password") or ""
    if not username or not password:
        raise SystemExit("No hay credenciales git para github.com")
    return username, password


def api(method: str, url: str, username: str, password: str, body: dict | None = None) -> tuple[int, dict]:
    data = None if body is None else json.dumps(body).encode("utf-8")
    token = base64.b64encode(f"{username}:{password}".encode("utf-8")).decode("ascii")
    headers = {
        "Accept": "application/vnd.github+json",
        "Authorization": f"Basic {token}",
        "X-GitHub-Api-Version": "2022-11-28",
        "User-Agent": "OficiosMigrate/1.0",
    }
    if data is not None:
        headers["Content-Type"] = "application/json"
    request = urllib.request.Request(url, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(request, timeout=60) as resp:
            raw = resp.read().decode("utf-8")
            return resp.status, json.loads(raw) if raw else {}
    except urllib.error.HTTPError as exc:
        raw = exc.read().decode("utf-8", errors="replace")
        try:
            payload = json.loads(raw)
        except json.JSONDecodeError:
            payload = {"message": raw[:800]}
        return exc.code, payload


def run_git(args: list[str]) -> None:
    print("+", " ".join(args))
    subprocess.check_call(["git", *args], cwd=str(ROOT))


def main() -> int:
    username, password = git_credential()
    print("auth_user=", username)

    status, user = api("GET", "https://api.github.com/user", username, password)
    if status >= 400:
        # Retry as bearer token (PAT stored as password)
        headers_mode = "bearer"
    else:
        headers_mode = "basic"
        print("api_user=", user.get("login"))

    def call(method: str, url: str, body: dict | None = None) -> tuple[int, dict]:
        if headers_mode == "basic":
            return api(method, url, username, password, body)
        data = None if body is None else json.dumps(body).encode("utf-8")
        headers = {
            "Accept": "application/vnd.github+json",
            "Authorization": f"Bearer {password}",
            "X-GitHub-Api-Version": "2022-11-28",
            "User-Agent": "OficiosMigrate/1.0",
        }
        if data is not None:
            headers["Content-Type"] = "application/json"
        request = urllib.request.Request(url, data=data, headers=headers, method=method)
        try:
            with urllib.request.urlopen(request, timeout=60) as resp:
                raw = resp.read().decode("utf-8")
                return resp.status, json.loads(raw) if raw else {}
        except urllib.error.HTTPError as exc:
            raw = exc.read().decode("utf-8", errors="replace")
            try:
                payload = json.loads(raw)
            except json.JSONDecodeError:
                payload = {"message": raw[:800]}
            return exc.code, payload

    if headers_mode == "bearer":
        status, user = call("GET", "https://api.github.com/user")
        if status >= 400:
            raise SystemExit(f"GitHub auth failed {status}: {user}")
        print("api_user=", user.get("login"), "(bearer)")

    status, repo = call("GET", f"https://api.github.com/repos/{OWNER}/{NAME}")
    if status == 404:
        print("creating repo", NAME)
        status, repo = call(
            "POST",
            "https://api.github.com/user/repos",
            {
                "name": NAME,
                "description": "OficiosHub — marketplace de personas con oficio (storefront)",
                "private": False,
                "has_issues": True,
                "has_projects": False,
                "has_wiki": False,
                "auto_init": False,
            },
        )
        if status >= 400:
            raise SystemExit(f"create failed {status}: {repo}")
    elif status >= 400:
        raise SystemExit(f"lookup failed {status}: {repo}")
    else:
        print("repo already exists")

    print("html_url=", repo.get("html_url"))
    clone_url = repo.get("clone_url") or f"https://github.com/{OWNER}/{NAME}.git"

    # Remotes: keep DIAP as 'diap', point origin to Oficios
    remotes = subprocess.check_output(["git", "remote"], cwd=str(ROOT), text=True).split()
    if "diap" not in remotes and "origin" in remotes:
        run_git(["remote", "rename", "origin", "diap"])
        remotes = subprocess.check_output(["git", "remote"], cwd=str(ROOT), text=True).split()
    if "origin" in remotes:
        run_git(["remote", "set-url", "origin", clone_url])
    else:
        run_git(["remote", "add", "origin", clone_url])
    if "diap" not in remotes and "diap" not in subprocess.check_output(["git", "remote"], cwd=str(ROOT), text=True):
        run_git(["remote", "add", "diap", "https://github.com/andrescunier/DIAP.git"])

    print("remotes:")
    subprocess.check_call(["git", "remote", "-v"], cwd=str(ROOT))
    Path(ROOT / "exports/oficioshub/_oficios_clone_url.txt").write_text(clone_url + "\n", encoding="utf-8")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
