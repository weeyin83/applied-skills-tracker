# Applied Skills Tracker

A tiny, dependency-free website that lets you track your progress through the
[Microsoft Applied Skills](https://learn.microsoft.com/en-us/credentials/browse/?credential_types=applied%20skills)
credentials catalog. Fork it, drop in your own completion dates, and share
your journey with the community.

- **Zero build step** — plain HTML, CSS, and JavaScript.
- **No backend, no database, no auth.**
- **Deploys to Azure Static Web Apps (Free plan)** in a couple of clicks.
- **One data file to edit** (`data/skills.json`).
- Responsive, accessible, dark-mode friendly out of the box.

> Inspired by community projects like
> [`guygregory/exam-timeline`](https://github.com/guygregory/exam-timeline) — build
> your own visible learning story.

---

## Preview

- Progress panel with total / achieved / remaining / percent complete.
- Card grid of every Applied Skill with status pill and achieved date.
- Filter (All / Achieved / Not yet achieved), text search, and sort options.
- Direct links to each skill's Microsoft Learn credential page.

---

## Folder structure

```
applied-skills-tracker/
├── .devcontainer/
│   └── devcontainer.json               # One-click dev environment
├── .github/
│   └── workflows/
│       └── sync-transcript.yml         # Daily Learn catalog + transcript sync
├── .vscode/
│   └── extensions.json                 # Recommended editor extensions
├── assets/
│   └── avatar.svg                      # Placeholder headshot (swap for your own)
├── data/
│   └── skills.json                     # ← THE file you edit to mark progress
├── scripts/
│   ├── sync_catalog.py                 # Refresh the list of Applied Skills from Learn
│   └── sync_transcript.py              # Pull achievements from Microsoft Learn
├── app.js                              # Front-end logic (vanilla JS)
├── config.json                         # ← Your name, headshot, and social links
├── index.html                          # Single-page markup
├── staticwebapp.config.json            # Azure SWA runtime config
├── styles.css                          # Design system + layout
├── .gitignore
├── LICENSE                             # MIT
└── README.md
```

---

## Personalise the page

The site pulls your name, photo, and links from
[`config.json`](config.json). Edit that one file and everything on the page
updates.

```json
{
  "owner": {
    "name": "Sarah Lean",
    "headline": "Cloud engineer chasing every Microsoft Applied Skill.",
    "avatarUrl": "./assets/avatar.jpg",
    "location": "Scotland"
  },
  "links": [
    {
      "label": "LinkedIn",
      "url": "https://www.linkedin.com/in/your-handle/",
      "icon": "linkedin"
    },
    {
      "label": "GitHub",
      "url": "https://github.com/your-handle",
      "icon": "github"
    },
    { "label": "Website", "url": "https://your-site.dev", "icon": "website" }
  ],
  "repoUrl": "https://github.com/your-handle/applied-skills-tracker"
}
```

### Add your headshot

Drop a square image into the `assets/` folder (JPG, PNG, or WebP work best) and
point `owner.avatarUrl` at it, for example `"./assets/avatar.jpg"`. If you leave
the default, the built-in gradient SVG avatar is used.

### Supported link icons

Use any of these `icon` values &mdash; anything else falls back to a generic
link glyph:

`linkedin` &middot; `github` &middot; `website` &middot; `twitter` &middot;
`bluesky` &middot; `youtube` &middot; `mastodon` &middot; `email` &middot; `link`

The header **GitHub** button and the footer "Fork this project" link both
follow `repoUrl`, so update that when you fork.

---

## Update your progress

Everything you need is in [`data/skills.json`](data/skills.json). Each entry
looks like this:

```json
{
  "id": "deploy-and-configure-azure-monitor",
  "name": "Deploy and configure Azure Monitor",
  "url": "https://learn.microsoft.com/en-us/credentials/applied-skills/deploy-and-configure-azure-monitor/",
  "status": "not-started",
  "achievedDate": null,
  "notes": ""
}
```

To mark a skill as achieved:

1. Change `"status"` from `"not-started"` to `"achieved"`.
2. Set `"achievedDate"` to the date you earned it, in `YYYY-MM-DD` format.
3. Optionally add a short `"notes"` string — it appears on the card.

Save the file, refresh the site, and your progress panel updates instantly.

### Field reference

| Field          | Type                            | Notes                                                                                                                                                                 |
| -------------- | ------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `id`           | string                          | Stable slug. Keep it unique; don't rename existing ones.                                                                                                              |
| `name`         | string                          | Display name shown on the card.                                                                                                                                       |
| `url`          | string (optional)               | Link to the Microsoft Learn credential page.                                                                                                                          |
| `status`       | `"not-started"` \| `"achieved"` | Anything other than `"achieved"` counts as not started.                                                                                                               |
| `achievedDate` | ISO date or null                | Shown on the card and used by the "Recently achieved" sort.                                                                                                           |
| `notes`        | string                          | Free-text note. Blank strings are hidden automatically.                                                                                                               |
| `retired`      | boolean (optional)              | `true` for credentials Microsoft has retired. Retired skills stay on the page so previously earned ones still count, but they're excluded from the "Remaining" total. |
| `retiresOn`    | ISO date (optional)             | Scheduled retirement date. The card shows a "Retires &lt;date&gt;" badge, and the skill is treated as retired automatically once the date passes.                     |

---

## Auto-sync the Applied Skills catalog

You don't need to hand-maintain the list of available credentials. The
[`scripts/sync_catalog.py`](scripts/sync_catalog.py) helper fetches the public
Microsoft Learn catalog and merges it into `data/skills.json`:

- New credentials are **appended** with `status: "not-started"`.
- Existing entries have their `name`, `url`, `retired`, and `retiresOn` fields
  refreshed from the catalog. Your progress fields (`status`, `achievedDate`,
  `notes`) are always preserved.
- Credentials that disappear from the catalog are kept and auto-marked
  `retired: true` so previously earned ones still count.

The [daily workflow](.github/workflows/sync-transcript.yml) runs this before
the transcript sync (see below), so a fresh fork stays in sync with Microsoft's
catalog with **zero configuration** — no secrets required.

> **Heads-up:** the catalog endpoint (`/api/catalog/?type=appliedSkills`) is
> undocumented and could change without notice. The script fails loudly rather
> than silently overwriting `data/skills.json`.

Run it locally at any time:

```powershell
python scripts/sync_catalog.py
```

---

## Sync progress from your Microsoft Learn transcript (optional)

Prefer not to edit JSON by hand? A helper script can pull your Applied Skills
achievements straight from your public Microsoft Learn transcript and update
`data/skills.json` for you. A daily GitHub Actions workflow keeps the site up
to date without you touching a file.

> **Heads-up:** the Learn transcript endpoint used here is undocumented and
> not officially supported by Microsoft. It works well for a personal project
> but could change without notice. Inspired by
> [`guygregory/exam-timeline`](https://github.com/guygregory/exam-timeline),
> which uses the same endpoint for exam data.

### One-time setup

1. **Make your Learn transcript public.** Sign in to
   [Microsoft Learn](https://learn.microsoft.com/), open your profile → Settings,
   and set the transcript to public. Copy the share ID from the URL:
   `https://learn.microsoft.com/en-us/users/<you>/transcript/`**`<share_id>`**
2. In your GitHub fork, add a repository secret named `TRANSCRIPT_SHARE_ID`
   with that value (Settings → Secrets and variables → Actions → New
   repository secret).
3. _(Optional)_ Add a repository variable `LEARN_LOCALE` (e.g. `en-gb`) if you
   want a locale other than `en-us`.

Without `TRANSCRIPT_SHARE_ID` the workflow still runs the catalog sync — it
just skips the transcript step.

### How it works

- [`scripts/sync_transcript.py`](scripts/sync_transcript.py) fetches the
  transcript JSON, reads `appliedSkillsData.appliedSkillsCredentials`, and
  merges each earned skill into `data/skills.json` — only ever setting
  `status` and `achievedDate`. Your `notes`, `url`, `retired`, and
  `retiresOn` values are left alone.
- [`.github/workflows/sync-transcript.yml`](.github/workflows/sync-transcript.yml)
  runs the catalog sync followed by the transcript sync daily at 03:00 UTC
  (and on demand via _Actions → Run workflow_). If the file changed, it commits
  and pushes — which then triggers the Azure Static Web Apps deploy workflow.
- Matching is by display name. Because the catalog sync runs first, any newly
  published credential you've earned will already exist in `data/skills.json`
  by the time the transcript step looks for a match.

### Run it locally

```powershell
$env:TRANSCRIPT_SHARE_ID = "your-share-id"
python scripts/sync_transcript.py
```

---

## Run it locally

Because it is pure static content, any local static server will do. Pick one:

```powershell
# Windows PowerShell — using Python 3 (comes with most dev setups)
python -m http.server 5173

# Or with Node.js
npx serve .
```

Then open <http://localhost:5173>.

> Opening `index.html` directly from the file system will fail to load
> `data/skills.json` and `config.json` because browsers block `fetch()` on
> `file://` URLs. Always serve the folder over HTTP.

### Or use the included Dev Container (recommended)

The repo ships with a [`.devcontainer/devcontainer.json`](.devcontainer/devcontainer.json)
so you get a ready-to-go environment with zero local setup.

- **Locally:** open the folder in VS Code, click _Reopen in Container_ when
  prompted (requires Docker Desktop + the _Dev Containers_ extension).
- **In the cloud:** click the _Code &rarr; Codespaces &rarr; Create codespace_
  button on your GitHub fork.

When the container finishes building it automatically starts a static server
on port **8080**, forwards it, and pops open the VS Code preview panel. Every
change to `index.html`, `styles.css`, `app.js`, `config.json`, or
`data/skills.json` is picked up on the next refresh.

To restart the server manually:

```bash
serve --listen 8080 .
```

---

## Create your own copy on Azure Static Web Apps (Free plan)

Want your own live tracker? Fork this repo and deploy it to the Free tier of
Azure Static Web Apps — no custom domain fees, generous bandwidth, and free
HTTPS included.

This repo deliberately does **not** ship a GitHub Actions workflow. When you
connect your fork to Azure Static Web Apps, Azure will generate a workflow
tailored to your deployment token and commit it to your repository for you.

1. **Fork this repo** into your own GitHub account (or click _Use this template_).
2. In the [Azure portal](https://portal.azure.com), create a new
   **Static Web App** resource:
   - **Plan type:** Free.
   - **Source:** GitHub → select your fork and the `main` branch.
   - **Build presets:** `Custom`.
   - **App location:** `/`
   - **Api location:** _(leave empty)_
   - **Output location:** _(leave empty)_
3. Azure commits a new workflow file to `.github/workflows/` in your fork and
   adds the `AZURE_STATIC_WEB_APPS_API_TOKEN` secret automatically.
4. Pull that workflow back down locally (`git pull`), then edit
   [`config.json`](config.json) and [`data/skills.json`](data/skills.json)
   with your details.
5. Push to `main` — the workflow builds and deploys automatically.

Your site is live at the `*.azurestaticapps.net` URL shown in the Azure
portal. Every push to `main` redeploys, and pull requests get their own
preview environment automatically.

### If you prefer no workflow

You can also deploy this repository with the
[SWA CLI](https://azure.github.io/static-web-apps-cli/):

```powershell
npm install -g @azure/static-web-apps-cli
swa deploy . --env production
```

---

## Keep the skill list up to date

Microsoft occasionally publishes new Applied Skills or retires old ones. The
canonical list lives at:

- <https://learn.microsoft.com/en-us/credentials/browse/?credential_types=applied%20skills>
- <https://learn.microsoft.com/en-us/credentials/browse/?credential_types=applied%20skills&skip=30>

To add a new skill, append an entry to the `skills` array in
[`data/skills.json`](data/skills.json) using a unique `id`. To remove a
retired one, delete its entry.

---

## Customise the look

- **Colours** — edit the CSS custom properties at the top of
  [`styles.css`](styles.css) (both light and dark palettes).
- **Title / tagline** — change the copy inside the `<header>` in
  [`index.html`](index.html).
- **Footer / links** — edit the `<footer>` in `index.html`.
- **Favicon** — replace the inline SVG data URI on the `<link rel="icon">`
  in `index.html`.

---

## Contributing

Issues and pull requests are welcome. Please keep the project dependency-free
so anyone can clone, edit a JSON file, and ship.

---

## License

[MIT](LICENSE). Not affiliated with, or endorsed by, Microsoft.
