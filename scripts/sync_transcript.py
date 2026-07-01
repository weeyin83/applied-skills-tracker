"""Sync Applied Skills achievements from a public Microsoft Learn transcript.

Reads TRANSCRIPT_SHARE_ID (and optional LEARN_LOCALE) from the environment,
fetches the transcript JSON, and updates data/skills.json in place so every
earned Applied Skill is marked as achieved with the correct date. Fields the
transcript can't tell us about (url, notes, retired, retiresOn) are preserved.

The Microsoft Learn transcript endpoint used here is undocumented and could
change without notice. Suitable for a personal project, not production.
"""

from __future__ import annotations

import json
import os
import re
import sys
import urllib.request
from datetime import date, datetime
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
SKILLS_FILE = REPO_ROOT / "data" / "skills.json"

TRANSCRIPT_URL = (
    "https://learn.microsoft.com/api/profiles/transcript/share/{share_id}"
    "?locale={locale}"
)
TITLE_PREFIX = "Microsoft Applied Skills: "


def fetch_transcript(share_id: str, locale: str) -> dict:
    url = TRANSCRIPT_URL.format(share_id=share_id, locale=locale)
    print(f"Fetching transcript: {url}")
    req = urllib.request.Request(url, headers={"Accept": "application/json"})
    with urllib.request.urlopen(req, timeout=30) as resp:
        return json.load(resp)


def normalise(value: str) -> str:
    return re.sub(r"\s+", " ", value.strip().lower())


def strip_prefix(title: str) -> str:
    return title[len(TITLE_PREFIX):] if title.startswith(TITLE_PREFIX) else title


def to_iso_date(value: str | None) -> str | None:
    if not value:
        return None
    # Handles "2026-07-01T09:57:15+00:00", "...Z", and bare "2026-07-01".
    try:
        return datetime.fromisoformat(value.replace("Z", "+00:00")).date().isoformat()
    except ValueError:
        return value[:10] if len(value) >= 10 and value[4] == "-" == value[7] else None


def main() -> int:
    share_id = os.environ.get("TRANSCRIPT_SHARE_ID", "").strip()
    if not share_id:
        print("TRANSCRIPT_SHARE_ID is not set.", file=sys.stderr)
        return 1
    locale = os.environ.get("LEARN_LOCALE", "en-us").strip() or "en-us"

    payload = fetch_transcript(share_id, locale)
    earned = (payload.get("appliedSkillsData") or {}).get("appliedSkillsCredentials") or []
    print(f"Found {len(earned)} Applied Skills achievement(s) in transcript.")

    with SKILLS_FILE.open("r", encoding="utf-8") as f:
        data = json.load(f)
    catalog: list[dict] = data.get("skills", [])
    by_name = {normalise(entry["name"]): entry for entry in catalog if "name" in entry}

    updated = 0
    unmatched: list[str] = []
    for item in earned:
        title = strip_prefix(item.get("title", ""))
        iso = to_iso_date(item.get("awardedOn"))
        entry = by_name.get(normalise(title))
        if entry is None:
            unmatched.append(title)
            continue
        changed = False
        if entry.get("status") != "achieved":
            entry["status"] = "achieved"
            changed = True
        if iso and entry.get("achievedDate") != iso:
            entry["achievedDate"] = iso
            changed = True
        if changed:
            updated += 1
            print(f"  updated: {entry['id']} -> {iso}")

    data["lastUpdated"] = date.today().isoformat()

    with SKILLS_FILE.open("w", encoding="utf-8", newline="\n") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
        f.write("\n")

    print(f"Applied {updated} update(s) to {SKILLS_FILE.name}.")
    if unmatched:
        print(
            "\nAchievements not found in the catalog (add them to data/skills.json):",
            file=sys.stderr,
        )
        for name in unmatched:
            print(f"  - {name}", file=sys.stderr)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
