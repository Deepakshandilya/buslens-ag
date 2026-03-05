from app.services.validation import normalize_stop_name, normalize_direction

def test_normalize_stop_name():
    assert normalize_stop_name("  ISBT   Sector 43  ") == "ISBT Sector 43"

def test_normalize_direction():
    assert normalize_direction(" up ") == "UP"
    assert normalize_direction("DOWN") == "DOWN"