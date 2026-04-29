"""AI-based evaluation services using only dependencies from requirements.txt."""

from __future__ import annotations

import re
from typing import Any

from ..models import Event, User


def _clamp_score(n: int) -> int:
    """Clamp score between 1 and 10."""
    return max(1, min(10, int(n)))


def _linkedin_ok(url: str | None) -> bool:
    """Check if LinkedIn URL is valid format."""
    if not url or not str(url).strip():
        return False
    u = str(url).lower()
    return "linkedin.com" in u and ("/in/" in u or "/company/" in u)


def _normalize_text(text: str | None) -> str:
    if not text:
        return ""
    return re.sub(r"[^a-z0-9]", "", text.lower())


def _has_repeated_substring(text: str) -> bool:
    normalized = _normalize_text(text)
    return bool(re.search(r"(.{2,4})\1{2,}", normalized))


def _is_suspicious_token(token: str) -> bool:
    normalized = _normalize_text(token)
    if len(normalized) < 3:
        return True
    vowel_count = sum(1 for c in normalized if c in "aeiou")
    vowel_ratio = vowel_count / max(1, len(normalized))
    if len(normalized) >= 6 and vowel_ratio < 0.35:
        return True
    if _has_repeated_substring(token):
        return True
    if re.search(r"([a-z])\1{2,}", normalized):
        return True
    if re.search(r"(?:asdf|qwerty|zxcvbn|kjhg|ghjk|kafshgafgas|asdfgh|zxcvbnm)", token.lower()):
        return True
    if len(normalized) >= 8 and re.search(r"^[bcdfghjklmnpqrstvwxyz]{5,}$", normalized):
        return True
    return False


def _is_suspicious_text(text: str | None) -> bool:
    if not text or not str(text).strip():
        return True
    tokens = re.findall(r"[a-z0-9]+", text.lower())
    suspicious_tokens = [t for t in tokens if _is_suspicious_token(t)]
    if suspicious_tokens:
        if len(tokens) == 1 or any(len(t) >= 6 for t in suspicious_tokens):
            return True
        if len(suspicious_tokens) >= max(1, len(tokens) // 3):
            return True
    normalized = _normalize_text(text)
    if len(normalized) < 3:
        return True
    vowel_count = sum(1 for c in normalized if c in "aeiou")
    vowel_ratio = vowel_count / max(1, len(normalized))
    if vowel_ratio < 0.22:
        return True
    if re.search(r"([a-z])\1{2,}", normalized):
        return True
    if re.search(r"(?:asdf|qwerty|zxcvbn|kjhg|ghjk|kafshgafgas|asdfgh|zxcvbnm)", text.lower()):
        return True
    if len(normalized) >= 8 and re.search(r"^[bcdfghjklmnpqrstvwxyz]{5,}$", normalized):
        return True
    return False


def _location_ok(city: str | None, province: str | None) -> bool:
    """Check if location fields are valid."""
    return bool(city and str(city).strip() and province and str(province).strip())


def _event_location_ok(event: Event) -> bool:
    """Check if event location is meaningful."""
    loc = (event.location or "").strip()
    if len(loc) < 3:
        return False
    if re.match(r"^\s*[,\.\s-]+\s*$", loc):
        return False
    if _is_suspicious_text(loc):
        return False
    return True


def _linkedin_name_matches(full_name: str | None, linkedin_url: str | None) -> bool:
    if not full_name or not linkedin_url:
        return False
    path_segment = linkedin_url.rstrip("/").split("/")[-1]
    full_name_norm = _normalize_text(full_name)
    path_norm = _normalize_text(path_segment)
    if not path_norm or not full_name_norm:
        return False
    return full_name_norm in path_norm or path_norm in full_name_norm


def evaluate_organizer(user: User) -> dict[str, Any]:
    """Evaluate organizer profile using stronger name and LinkedIn checks."""
    checks = {}
    score = 5
    reasons = []

    name_suspicious = _is_suspicious_text(user.full_name)
    checks["name_quality"] = not name_suspicious
    if name_suspicious:
        score -= 2
        reasons.append("Organizer name appears suspicious")
    else:
        score += 1
        reasons.append("Organizer name looks valid")

    location_valid = _location_ok(user.city, user.province)
    checks["location_valid"] = location_valid
    if location_valid:
        score += 1
        reasons.append("Location is valid")
    else:
        score -= 1
        reasons.append("Location is invalid or missing")

    linkedin_valid = _linkedin_ok(user.linkedin)
    checks["linkedin_format"] = linkedin_valid
    if linkedin_valid:
        score += 1
        reasons.append("LinkedIn URL format is valid")
        linkedin_match = _linkedin_name_matches(user.full_name, user.linkedin)
        checks["linkedin_name_match"] = linkedin_match
        if linkedin_match:
            score += 1
            reasons.append("LinkedIn profile name matches organizer name")
        else:
            score -= 1
            reasons.append("LinkedIn profile name does not match organizer name")
    else:
        score -= 2
        reasons.append("LinkedIn URL invalid or missing")

    completeness = sum([
        bool(user.full_name and user.full_name.strip()),
        bool(user.phone_number and user.phone_number.strip()),
        bool(user.skills and user.skills.strip()),
        bool(user.interests and user.interests.strip()),
        bool(user.availability and user.availability.strip()),
    ]) / 5
    checks["profile_completeness"] = completeness
    score += int(completeness * 2)
    reasons.append(f"Profile {completeness:.1%} complete")

    score = _clamp_score(score)
    recommendation = "approve" if score >= 7 else "reject" if score <= 3 else "review"
    summary = "; ".join(reasons)

    return {
        "score": score,
        "recommendation": recommendation,
        "summary": summary,
        "method": "validation_checks",
        "checks": checks,
    }


def evaluate_event(event: Event, organizer: User) -> dict[str, Any]:
    """Evaluate event using stronger suspicious-text checks."""
    checks = {}
    score = 5
    reasons = []

    name_suspicious = _is_suspicious_text(event.name)
    checks["event_name_quality"] = not name_suspicious
    if name_suspicious:
        score -= 2
        reasons.append("Event name looks suspicious or random")
    else:
        score += 1
        reasons.append("Event name looks meaningful")

    details_meaningful = bool(event.details and len(event.details.strip()) > 15 and not _is_suspicious_text(event.details))
    checks["details_meaningful"] = details_meaningful
    if details_meaningful:
        score += 1
        reasons.append("Event details appear meaningful")
    else:
        score -= 1
        reasons.append("Event details appear insufficient or suspicious")

    location_valid = _event_location_ok(event)
    checks["location_valid"] = location_valid
    if location_valid:
        score += 2
        reasons.append("Event location provided and looks valid")
    else:
        score -= 2
        reasons.append("Event location invalid or suspicious")

    organizer_linkedin_valid = _linkedin_ok(organizer.linkedin)
    checks["organizer_linkedin"] = organizer_linkedin_valid
    if organizer_linkedin_valid:
        score += 1
        reasons.append("Organizer LinkedIn is valid")
    else:
        score -= 1
        reasons.append("Organizer LinkedIn invalid or missing")

    skillset_ok = bool(event.skillset and len(event.skillset.strip()) > 3 and not _is_suspicious_text(event.skillset))
    checks["skillset_provided"] = skillset_ok
    if skillset_ok:
        score += 1
        reasons.append("Skillset specified and meaningful")
    else:
        score -= 1
        reasons.append("Skillset missing or suspicious")

    date_ok = bool(event.date and len(event.date.strip()) > 0)
    checks["date_provided"] = date_ok
    if date_ok:
        score += 1
        reasons.append("Event date provided")
    else:
        score -= 1
        reasons.append("Event date missing")

    score = _clamp_score(score)
    recommendation = "approve" if score >= 7 else "reject" if score <= 3 else "review"
    summary = "; ".join(reasons)

    return {
        "score": score,
        "recommendation": recommendation,
        "summary": summary,
        "method": "validation_checks",
        "checks": checks,
    }


def gemini_correct_bio(bio_text: str) -> str:
    """Perform basic bio text correction and normalization."""
    if not bio_text or not str(bio_text).strip():
        return bio_text or ""
    
    # Basic cleanup: strip whitespace and excess punctuation
    corrected = str(bio_text).strip()
    
    # Capitalize first letter of sentences
    corrected = re.sub(
        r'(^|[.!?]\s+)([a-z])',
        lambda m: m.group(1) + m.group(2).upper(),
        corrected
    )
    
    return corrected


# Backward compatibility aliases
def gemini_evaluate_organizer(user: User) -> dict[str, Any]:
    """Backward compatible wrapper for evaluate_organizer."""
    return evaluate_organizer(user)


def gemini_evaluate_event(event: Event, organizer: User) -> dict[str, Any]:
    """Backward compatible wrapper for evaluate_event."""
    return evaluate_event(event, organizer)