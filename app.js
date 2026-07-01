/**
 * Applied Skills Tracker
 * Loads the skills catalog from data/skills.json and renders a filterable,
 * sortable dashboard with progress statistics.
 */

const STATE = {
    skills: [],
    filter: 'all',
    sort: 'default',
    search: '',
};

const ICONS = {
    linkedin: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.05-1.86-3.05-1.86 0-2.15 1.45-2.15 2.95v5.67H9.34V9h3.4v1.56h.05c.47-.9 1.63-1.86 3.36-1.86 3.6 0 4.26 2.37 4.26 5.45v6.3zM5.34 7.44a2.06 2.06 0 110-4.12 2.06 2.06 0 010 4.12zm1.78 13.01H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.72V1.72C24 .77 23.2 0 22.22 0z"/></svg>',
    github: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 .5C5.73.5.75 5.48.75 11.75c0 4.94 3.2 9.13 7.64 10.61.56.1.77-.24.77-.54v-1.9c-3.11.68-3.77-1.5-3.77-1.5-.51-1.29-1.24-1.64-1.24-1.64-1.02-.7.08-.68.08-.68 1.13.08 1.72 1.16 1.72 1.16 1 1.71 2.62 1.22 3.26.93.1-.73.39-1.22.71-1.5-2.48-.28-5.09-1.24-5.09-5.53 0-1.22.44-2.22 1.16-3-.12-.28-.5-1.43.11-2.99 0 0 .95-.3 3.1 1.15.9-.25 1.86-.38 2.82-.38.96 0 1.92.13 2.82.38 2.15-1.45 3.1-1.15 3.1-1.15.61 1.56.23 2.71.11 2.99.72.78 1.16 1.78 1.16 3 0 4.3-2.61 5.24-5.1 5.52.4.34.76 1.02.76 2.06v3.05c0 .3.2.65.78.54 4.43-1.48 7.63-5.67 7.63-10.61C23.25 5.48 18.27.5 12 .5z"/></svg>',
    website: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2a10 10 0 100 20 10 10 0 000-20zm7.93 9h-3.06a15.55 15.55 0 00-1.06-4.94A8.03 8.03 0 0119.93 11zM12 4c1.06 1.4 1.85 3.24 2.13 5H9.87C10.15 7.24 10.94 5.4 12 4zM4.07 13h3.06c.13 1.72.5 3.4 1.06 4.94A8.03 8.03 0 014.07 13zm0-2a8.03 8.03 0 014.12-4.94A15.55 15.55 0 007.13 11H4.07zM12 20c-1.06-1.4-1.85-3.24-2.13-5h4.26c-.28 1.76-1.07 3.6-2.13 5zm3.87-2.06c.56-1.54.93-3.22 1.06-4.94h3.06a8.03 8.03 0 01-4.12 4.94z"/></svg>',
    twitter: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M18.244 2H21.5l-7.5 8.57L23 22h-6.828l-4.79-6.26L5.7 22H2.44l8.02-9.17L1.5 2h6.98l4.33 5.72L18.244 2zm-2.393 18h1.9L7.24 4H5.2l10.65 16z"/></svg>',
    bluesky: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 10.8C10.9 8.7 8 4.9 5.2 3 3.5 1.9 2 2.3 2 4.4c0 .5.3 4.2.4 4.8.5 2 2 2.5 3.5 2.7-2.5.4-4.7 1.3-1.8 4.5 3.2 3.6 4.4-.8 5-2.9.2-.6.3-.9.9-.9.6 0 .7.3.9.9.6 2.2 1.8 6.5 5 2.9 2.9-3.3.7-4.1-1.8-4.5 1.5-.2 3-.7 3.5-2.7.1-.6.4-4.3.4-4.8 0-2.1-1.5-2.5-3.2-1.4C16 4.9 13.1 8.7 12 10.8z"/></svg>',
    email: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M20 4H4a2 2 0 00-2 2v12a2 2 0 002 2h16a2 2 0 002-2V6a2 2 0 00-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>',
    youtube: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M23.5 6.2a3 3 0 00-2.1-2.1C19.6 3.6 12 3.6 12 3.6s-7.6 0-9.4.5A3 3 0 00.5 6.2C0 8 0 12 0 12s0 4 .5 5.8a3 3 0 002.1 2.1c1.8.5 9.4.5 9.4.5s7.6 0 9.4-.5a3 3 0 002.1-2.1c.5-1.8.5-5.8.5-5.8s0-4-.5-5.8zM9.6 15.6V8.4l6.4 3.6-6.4 3.6z"/></svg>',
    mastodon: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M21.6 8.5c0-4.8-3.1-6.2-3.1-6.2C16.9 1.6 14.2 1.3 11.4 1.3h-.1c-2.8 0-5.5.3-7 1-1 .6-3 1.9-3 6.2 0 4.8-.1 10.7 3.4 11.7 1.3.3 2.5.6 3.4.7 1.7.2 3.3 0 3.3 0v-2.2s-1.9.1-4-.6c-2-.7-2.2-2.9-2.3-3.7 0 0 2 .5 4.6.6h1.5c2.6 0 5-.1 6.6-.5 3.5-.9 4.4-3.9 4.5-6.6.1-.9.1-1.7.1-2.4zm-3.7 5.5h-2.3V8.5c0-1.2-.5-1.8-1.5-1.8s-1.5.6-1.5 1.9v2.7h-2.3V8.6c0-1.3-.5-1.9-1.5-1.9s-1.5.6-1.5 1.8V14H5v-5.6c0-1.2.3-2.2 1-2.9.6-.7 1.5-1 2.6-1 1.3 0 2.2.5 2.8 1.4l.6 1 .6-1c.6-.9 1.5-1.4 2.8-1.4 1.1 0 2 .3 2.6 1 .7.7 1 1.7 1 2.9V14z"/></svg>',
    link: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M3.9 12a3.1 3.1 0 013.1-3.1h4V7H7a5 5 0 000 10h4v-1.9H7A3.1 3.1 0 013.9 12zM8 13h8v-2H8v2zm9-6h-4v1.9h4a3.1 3.1 0 010 6.2h-4V17h4a5 5 0 000-10z"/></svg>',
};

const els = {
    grid: document.getElementById('skills-grid'),
    empty: document.getElementById('empty-state'),
    loading: document.getElementById('loading-state'),
    search: document.getElementById('search'),
    sort: document.getElementById('sort'),
    chips: document.querySelectorAll('.chip[data-filter]'),
    progressFill: document.querySelector('[data-progress-fill]'),
    progressBar: document.querySelector('.progress-bar'),
    progressCaption: document.querySelector('[data-progress-caption]'),
    profile: {
        avatar: document.querySelector('[data-profile-avatar]'),
        name: document.querySelector('[data-profile-name]'),
        headline: document.querySelector('[data-profile-headline]'),
        location: document.querySelector('[data-profile-location]'),
        links: document.querySelector('[data-profile-links]'),
    },
    repoLinks: document.querySelectorAll('[data-repo-link]'),
    stats: {
        total: document.querySelector('[data-stat="total"]'),
        achieved: document.querySelector('[data-stat="achieved"]'),
        remaining: document.querySelector('[data-stat="remaining"]'),
        percent: document.querySelector('[data-stat="percent"]'),
    },
};

init();

async function init() {
    try {
        const [skillsResponse, configResponse] = await Promise.all([
            fetch('./data/skills.json', { cache: 'no-cache' }),
            fetch('./config.json', { cache: 'no-cache' }).catch(() => null),
        ]);

        if (!skillsResponse.ok) {
            throw new Error(`Failed to load skills (${skillsResponse.status})`);
        }

        const payload = await skillsResponse.json();
        STATE.skills = Array.isArray(payload.skills) ? payload.skills : [];

        const config = configResponse && configResponse.ok ? await configResponse.json() : null;
        applyConfig(config);

        els.loading.hidden = true;
        wireEvents();
        render();
    } catch (error) {
        console.error(error);
        els.loading.textContent = 'Could not load skills. Check that data/skills.json is present and valid.';
    }
}

function applyConfig(config) {
    if (!config) return;
    const { owner, links, repoUrl } = config;

    if (owner) {
        if (owner.name) {
            els.profile.name.textContent = owner.name;
            document.title = `${owner.name}'s Applied Skills Tracker`;
            els.profile.avatar.alt = `${owner.name}'s avatar`;
        }
        if (owner.headline) {
            els.profile.headline.textContent = owner.headline;
        }
        if (owner.avatarUrl) {
            els.profile.avatar.src = owner.avatarUrl;
        }
        if (owner.location && els.profile.location) {
            els.profile.location.textContent = owner.location;
            els.profile.location.hidden = false;
        }
    }

    if (Array.isArray(links) && links.length > 0 && els.profile.links) {
        els.profile.links.innerHTML = '';
        links.forEach((link) => {
            if (!link || !link.url) return;
            const li = document.createElement('li');
            const a = document.createElement('a');
            a.className = 'profile-link';
            a.href = link.url;
            a.target = '_blank';
            a.rel = 'noopener noreferrer';
            a.setAttribute('aria-label', link.label ? `${link.label} profile` : link.url);
            const iconKey = (link.icon || '').toLowerCase();
            const iconSvg = ICONS[iconKey] || ICONS.link;
            a.innerHTML = iconSvg;
            const span = document.createElement('span');
            span.textContent = link.label || link.url;
            a.appendChild(span);
            li.appendChild(a);
            els.profile.links.appendChild(li);
        });
    }

    if (repoUrl && els.repoLinks) {
        els.repoLinks.forEach((el) => {
            el.href = repoUrl;
        });
    }
}

function wireEvents() {
    els.chips.forEach((chip) => {
        chip.addEventListener('click', () => {
            STATE.filter = chip.dataset.filter;
            els.chips.forEach((c) => {
                const active = c === chip;
                c.classList.toggle('is-active', active);
                c.setAttribute('aria-selected', active ? 'true' : 'false');
            });
            render();
        });
    });

    els.search.addEventListener('input', (event) => {
        STATE.search = event.target.value.trim().toLowerCase();
        render();
    });

    els.sort.addEventListener('change', (event) => {
        STATE.sort = event.target.value;
        render();
    });
}

function render() {
    renderStats();
    renderGrid();
}

function renderStats() {
    const total = STATE.skills.length;
    const achieved = STATE.skills.filter(isAchieved).length;
    const retired = STATE.skills.filter(isRetired).length;
    const retiredUnearned = STATE.skills.filter((s) => isRetired(s) && !isAchieved(s)).length;

    // Retired skills you never earned can no longer be earned, so exclude
    // them from the "earnable" denominator — otherwise your % would be
    // permanently capped below 100.
    const earnable = total - retiredUnearned;
    const remaining = earnable - achieved;
    const percent = earnable === 0 ? 0 : Math.round((achieved / earnable) * 100);

    els.stats.total.textContent = earnable;
    els.stats.achieved.textContent = achieved;
    els.stats.remaining.textContent = Math.max(remaining, 0);
    els.stats.percent.textContent = `${percent}%`;

    els.progressFill.style.width = `${percent}%`;
    els.progressBar.setAttribute('aria-valuenow', String(percent));
    els.progressBar.setAttribute('aria-valuetext', `${percent}% complete, ${achieved} of ${earnable} earnable skills achieved`);

    if (els.progressCaption) {
        const parts = [`${total} total in catalog`];
        if (retired > 0) {
            parts.push(`${retired} retired`);
        }
        els.progressCaption.textContent = parts.join(' \u00b7 ');
    }
}

function renderGrid() {
    const visible = getVisibleSkills();
    els.grid.innerHTML = '';

    if (visible.length === 0) {
        els.empty.hidden = false;
        return;
    }

    els.empty.hidden = true;
    const fragment = document.createDocumentFragment();
    visible.forEach((skill, index) => {
        fragment.appendChild(buildCard(skill, index));
    });
    els.grid.appendChild(fragment);
}

function getVisibleSkills() {
    let list = [...STATE.skills];

    if (STATE.filter === 'achieved') {
        list = list.filter(isAchieved);
    } else if (STATE.filter === 'not-started') {
        list = list.filter((s) => !isAchieved(s) && !isRetired(s));
    } else if (STATE.filter === 'retired') {
        list = list.filter(isRetired);
    }

    if (STATE.search) {
        list = list.filter((s) => s.name.toLowerCase().includes(STATE.search));
    }

    switch (STATE.sort) {
        case 'name-asc':
            list.sort((a, b) => a.name.localeCompare(b.name));
            break;
        case 'name-desc':
            list.sort((a, b) => b.name.localeCompare(a.name));
            break;
        case 'date-desc':
            list.sort(compareByDateDesc);
            break;
        case 'date-asc':
            list.sort(compareByDateAsc);
            break;
        default:
            break;
    }

    return list;
}

function compareByDateDesc(a, b) {
    const da = a.achievedDate ? new Date(a.achievedDate).getTime() : -Infinity;
    const db = b.achievedDate ? new Date(b.achievedDate).getTime() : -Infinity;
    return db - da;
}

function compareByDateAsc(a, b) {
    const da = a.achievedDate ? new Date(a.achievedDate).getTime() : Infinity;
    const db = b.achievedDate ? new Date(b.achievedDate).getTime() : Infinity;
    return da - db;
}

function isAchieved(skill) {
    return skill.status === 'achieved';
}

function isRetired(skill) {
    if (skill.retired === true) {
        return true;
    }
    if (skill.retiresOn) {
        const retireDate = new Date(skill.retiresOn);
        if (!Number.isNaN(retireDate.getTime()) && retireDate.getTime() <= Date.now()) {
            return true;
        }
    }
    return false;
}

function isRetiringSoon(skill) {
    if (skill.retired === true || !skill.retiresOn) {
        return false;
    }
    const retireDate = new Date(skill.retiresOn);
    return !Number.isNaN(retireDate.getTime()) && retireDate.getTime() > Date.now();
}

function buildCard(skill, index) {
    const achieved = isAchieved(skill);
    const retired = isRetired(skill);
    const retiringSoon = isRetiringSoon(skill);

    const card = document.createElement('article');
    card.className = 'skill-card';
    if (achieved) card.classList.add('is-achieved');
    if (retired) card.classList.add('is-retired');
    if (retiringSoon) card.classList.add('is-retiring-soon');
    card.style.animationDelay = `${Math.min(index * 25, 400)}ms`;

    const badges = document.createElement('div');
    badges.className = 'skill-card__badges';

    const status = document.createElement('span');
    status.className = 'skill-card__status';
    const dot = document.createElement('span');
    dot.className = 'skill-card__status-dot';
    dot.setAttribute('aria-hidden', 'true');
    status.appendChild(dot);
    status.append(achieved ? 'Achieved' : 'Not yet');
    badges.appendChild(status);

    if (retired) {
        const retiredBadge = document.createElement('span');
        retiredBadge.className = 'skill-card__badge skill-card__badge--retired';
        retiredBadge.textContent = 'Retired';
        badges.appendChild(retiredBadge);
    } else if (retiringSoon) {
        const soonBadge = document.createElement('span');
        soonBadge.className = 'skill-card__badge skill-card__badge--soon';
        soonBadge.textContent = `Retires ${formatDate(skill.retiresOn)}`;
        badges.appendChild(soonBadge);
    }

    card.appendChild(badges);

    const title = document.createElement('h3');
    title.className = 'skill-card__title';
    title.textContent = skill.name;
    card.appendChild(title);

    if (skill.notes && skill.notes.trim().length > 0) {
        const notes = document.createElement('p');
        notes.className = 'skill-card__notes';
        notes.textContent = skill.notes;
        card.appendChild(notes);
    }

    const meta = document.createElement('div');
    meta.className = 'skill-card__meta';

    const dateEl = document.createElement('span');
    dateEl.className = 'skill-card__date';
    if (achieved && skill.achievedDate) {
        dateEl.innerHTML = `<strong>&#10003;</strong> ${formatDate(skill.achievedDate)}`;
    } else if (retired) {
        dateEl.textContent = 'No longer available';
    } else {
        dateEl.textContent = 'Ready when you are';
    }
    meta.appendChild(dateEl);

    if (skill.url) {
        const link = document.createElement('a');
        link.className = 'skill-card__link';
        link.href = skill.url;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.textContent = 'Details';
        link.setAttribute('aria-label', `View ${skill.name} on Microsoft Learn`);
        meta.appendChild(link);
    }

    card.appendChild(meta);
    return card;
}

function formatDate(iso) {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) {
        return iso;
    }
    return date.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
}
