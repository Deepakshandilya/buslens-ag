import re 

_space_re = re.compile(r"\s+")

def normalize_stop_name(name: str) -> str:
    """
    Normalize user input / imported stop names:
    -trim
    -collapse multiple spaces
    """

    name = (name or "").strip()
    name = _space_re.sub(" ",name)
    return name 

