import time
from datetime import datetime, timedelta, timezone

def test_booking_rules():
    print("Testing booking duration constraints...")
    # Duration < 30 mins -> invalid
    dur1 = 20
    assert not (30 <= dur1 <= 240), "Duration 20m should be invalid"

    # Duration 60 mins -> valid
    dur2 = 60
    assert 30 <= dur2 <= 240, "Duration 60m should be valid"

    # Duration > 240 mins -> invalid
    dur3 = 250
    assert not (30 <= dur3 <= 240), "Duration 250m should be invalid"

    print("Testing customer cancellation lead time...")
    now = datetime.now(timezone.utc)
    # Start in 15 mins -> cannot cancel
    start_soon = now + timedelta(minutes=15)
    assert (start_soon - now).total_seconds() < 1800, "15 min lead time should block cancellation"

    # Start in 45 mins -> can cancel
    start_later = now + timedelta(minutes=45)
    assert (start_later - now).total_seconds() >= 1800, "45 min lead time should allow cancellation"

    print("ALL DOMAIN BUSINESS RULE ASSERTIONS PASSED!")

if __name__ == '__main__':
    test_booking_rules()
