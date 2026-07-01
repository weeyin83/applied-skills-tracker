"""Sync the catalog of available Microsoft Applied Skills into data/skills.json.

Fetches the public Microsoft Learn catalog API and merges every Applied Skills
credential into data/skills.json:

* New credentials are appended with status="not-started".
* Existing entries have their name, url, retired, and retiresOn fields refreshed
  from the catalog. Progress fields (status, achievedDate, notes) are preserved.
* Entries that used to be in the catalog but have disappeared are kept and
  marked retired=true so previously earned credentials still count.

The catalog endpoint is undocumented and may change without notice. The script
fails loudly rather than silently overwriting data/skills.json.
"""

from __future__ import annotations

import json
import re
import sys
import urllib.request
from datetime import date, datetime
from pathlib import Path
from urllib.parse import urlsplit, urlunsplit

REPO_ROOT = Path(__file__).resolve().parent.parent
SKILLS_FILE = REPO_ROOT / "data" / "skills.json"

CATALOG_URL = "https://learn.microsoft.com/api/catalog/?type=appliedSkills&locale=en-us"
UID_PREFIX = "applied-skill."
TITLE_PREFIX = "Microsoft Applied Skills: "

# Matches the retirement banner Learn injects into the summary HTML.
RETIRED_RE = re.compile(r"has been retired", re.IGNORECASE)
RETIRES_ON_RE = re.compile(
    r"will retire on ([A-Za-z]+ \d{1,2},\s*\d{4})", re.IGNORECASE
)


def fetch_catalog() -> list[dict]:
    print(f"Fetching catalog: {CATALOG_URL}")
    req = urllib.request.Request(
        CATALOG_URL, headers={"Accept": "application/json"})
    with urllib.request.urlopen(req, timeout=30) as resp:
        payload = json.load(resp)
    skills = payload.get("appliedSkills")
    if not isinstance(skills, list) or not skills:
        raise RuntimeError(
            "Catalog response missing a non-empty 'appliedSkills' list. "
            "Refusing to touch data/skills.json."
        )
    return skills


def clean_url(url: str) -> str:
    """Strip the WT.mc_id tracking query the catalog API appends."""
    if not url:
        return url
    parts = urlsplit(url)
    return urlunsplit((parts.scheme, parts.netloc, parts.path, "", ""))


def parse_retires_on(summary: str) -> str | None:
    match = RETIRES_ON_RE.search(summary or "")
    if not match:
        return None
    try:
        return datetime.strptime(match.group(1), "%B %d, %Y").date().isoformat()
    except ValueError:
        return None


def normalise_entry(item: dict) -> dict | None:
    uid = item.get("uid", "")
    if not uid.startswith(UID_PREFIX):
        return None
    title = item.get("title", "")
    if title.startswith(TITLE_PREFIX):
        title = title[len(TITLE_PREFIX):]
    summary = item.get("summary", "") or ""
    entry = {
        "id": uid[len(UID_PREFIX):],
        "name": title.strip(),
        "url": clean_url(item.get("url", "")),
        "retired": bool(RETIRED_RE.search(summary)),
    }
    retires_on = parse_retires_on(summary)
    if retires_on:
        entry["retiresOn"] = retires_on
    return entry


def apply_catalog(catalog: list[dict], data: dict) -> tuple[int, int, int]:
    existing: list[dict] = data.get("skills", [])
    by_id = {s["id"]: s for s in existing if "id" in s}
    catalog_ids: set[str] = set()

    added = 0
    updated = 0
    for item in catalog:
        entry = normalise_entry(item)
        if entry is None:
            continue
        catalog_ids.add(entry["id"])
        current = by_id.get(entry["id"])
        if current is None:
            existing.append(
                {
                    "id": entry["id"],
                    "name": entry["name"],
                    "url": entry["url"],
                    "status": "not-started",
                    "achievedDate": None,
                    "notes": "",
                    **({"retired": True} if entry["retired"] else {}),
                    **({"retiresOn": entry["retiresOn"]} if "retiresOn" in entry else {}),
                }
            )
            added += 1
            print(f"  added:   {entry['id']}")
            continue

        changed = False
        for field in ("name", "url"):
            if entry[field] and current.get(field) != entry[field]:
                current[field] = entry[field]
                changed = True
        if entry["retired"] and current.get("retired") is not True:
            current["retired"] = True
            changed = True
        if "retiresOn" in entry and current.get("retiresOn") != entry["retiresOn"]:
            current["retiresOn"] = entry["retiresOn"]
            changed = True
        if changed:
            updated += 1
            print(f"  updated: {entry['id']}")

    # Anything in skills.json but no longer in the catalog is treated as retired.
    dropped = 0
    for skill in existing:
        sid = skill.get("id")
        if sid and sid not in catalog_ids and skill.get("retired") is not True:
            skill["retired"] = True
            dropped += 1
            print(f"  retired: {sid} (no longer in catalog)")

    return added, updated, dropped


def main() -> int:
    catalog = fetch_catalog()
    print(f"Catalog returned {len(catalog)} Applied Skills credential(s).")

    with SKILLS_FILE.open("r", encoding="utf-8") as f:
        data = json.load(f)

    added, updated, dropped = apply_catalog(catalog, data)
    data["lastUpdated"] = date.today().isoformat()

    with SKILLS_FILE.open("w", encoding="utf-8", newline="\n") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
        f.write("\n")

    print(
        f"Applied catalog sync: {added} added, {updated} updated, "
        f"{dropped} auto-retired."
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
