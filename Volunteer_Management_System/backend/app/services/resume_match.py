from __future__ import annotations

import re
from pathlib import Path

import pdfplumber

from ..models import Event, User

TEXT_PREVIEW_MAX = 2000

_STOP = {
    "and",
    "or",
    "the",
    "a",
    "an",
    "to",
    "of",
    "in",
    "for",
    "on",
    "with",
    "at",
    "by",
    "from",
    "as",
    "is",
    "was",
    "are",
    "been",
    "be",
    "have",
    "has",
    "had",
    "it",
    "this",
    "that",
    "my",
    "your",
    "our",
    "their",
    "email",
    "phone",
    "www",
    "http",
    "https",
    "com",
    "jan",
    "feb",
    "mar",
    "apr",
    "may",
    "jun",
    "jul",
    "aug",
    "sep",
    "oct",
    "nov",
    "dec",
}


def extract_pdf_text(path: Path) -> str:
    parts: list[str] = []
    with pdfplumber.open(str(path)) as pdf:
        for page in pdf.pages:
            t = page.extract_text()
            if t:
                parts.append(t)
    return "\n".join(parts)


def tokenize(text: str) -> set[str]:
    words = re.findall(r"\b[a-z][a-z0-9+\-.#]{2,}\b", text.lower())
    return {w for w in words if w not in _STOP}


def profile_skill_tokens(skills_str: str | None) -> set[str]:
    if not skills_str:
        return set()
    out: set[str] = set()
    for part in re.split(r"[,;\n]+", skills_str.lower()):
        p = part.strip()
        if len(p) > 2:
            out.add(p)
            out.update(tokenize(p))
    return out


def combined_skill_tokens(resume_text: str, profile_skills: str | None) -> set[str]:
    return tokenize(resume_text) | profile_skill_tokens(profile_skills)


def jaccard(a: set[str], b: set[str]) -> float:
    if not a or not b:
        return 0.0
    inter = len(a & b)
    union = len(a | b)
    return inter / union if union else 0.0


def score_event(combined: set[str], event: Event) -> tuple[float, list[str]]:
    blob = f"{event.name} {event.details} {event.skillset}"
    ev_tokens = tokenize(blob)
    overlap = sorted(combined & ev_tokens)
    score = jaccard(combined, ev_tokens)
    low = blob.lower()
    extra: list[str] = []
    if not overlap:
        for t in combined:
            if len(t) > 4 and t in low:
                extra.append(t)
        if extra:
            score = max(score, min(0.9, 0.12 * len(set(extra))))
            overlap = sorted(set(extra))[:20]
    return round(min(1.0, score), 4), overlap


def rank_active_events(combined: set[str], events: list[Event]) -> list[tuple[Event, float, list[str]]]:
    ranked: list[tuple[Event, float, list[str]]] = []
    for ev in events:
        if ev.status != "active":
            continue
        score, keys = score_event(combined, ev)
        ranked.append((ev, score, keys))
    ranked.sort(key=lambda x: (-x[1], x[0].name))
    return ranked


def volunteer_tokens_for_matching(volunteer: User) -> set[str]:
    blob = " ".join(
        filter(
            None,
            [volunteer.skills, volunteer.interests, volunteer.availability],
        )
    )
    tokens = tokenize(blob)
    tokens |= profile_skill_tokens(volunteer.skills)
    tokens |= profile_skill_tokens(volunteer.interests)
    return tokens


def skill_match_score_1_9(volunteer: User, event: Event) -> int:
    """Map volunteer profile tokens vs event requirements to an integer 1–9."""
    vol_tokens = volunteer_tokens_for_matching(volunteer)
    jacc, _ = score_event(vol_tokens, event)
    scaled = 1.0 + 8.0 * min(1.0, float(jacc))
    return max(1, min(9, int(round(scaled))))
