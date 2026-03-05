import re

_space_re = re.compile(r"\s+")

def normalize_text(s: str) -> str:
    s = (s or "").strip()
    s = _space_re.sub(" ", s)
    return s

def normalize_stop_name(name: str) -> str:
    return normalize_text(name)

def normalize_direction(direction: str) -> str:
    d = normalize_text(direction).upper()
    if d not in {"UP", "DOWN"}:
        raise ValueError("direction must be UP or DOWN")
    return d