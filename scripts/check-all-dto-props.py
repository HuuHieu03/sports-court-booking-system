import os
import re
import yaml
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('documentation/api/openapi.yaml', 'r', encoding='utf-8') as f:
    openapi = yaml.safe_load(f)

schemas = openapi.get('components', {}).get('schemas', {})

# Map DTO files to their expected OpenAPI schema
dto_map = {
    'src/modules/auth/presentation/dto/register.dto.ts': 'RegisterRequest',
    'src/modules/auth/presentation/dto/login.dto.ts': 'LoginRequest',
    'src/modules/venues/presentation/dto/create-venue.dto.ts': 'CreateVenueRequest',
    'src/modules/venues/presentation/dto/update-venue.dto.ts': 'UpdateVenueRequest',
    'src/modules/venues/presentation/dto/create-court.dto.ts': 'CreateCourtRequest',
    'src/modules/venues/presentation/dto/update-court.dto.ts': 'UpdateCourtRequest',
    'src/modules/feedback/presentation/dto/create-feedback.dto.ts': 'CreateFeedbackRequest',
    'src/modules/bookings/presentation/dto/create-booking.dto.ts': 'CreateBookingRequest',
    'src/modules/bookings/presentation/dto/cancel-venue-booking.dto.ts': 'CancelCustomerBookingRequest',
    'src/modules/staffing/presentation/dto/apply-manager.dto.ts': 'ApplyManagerRequest',
    'src/modules/staffing/presentation/dto/recruitment-toggle.dto.ts': 'UpdateRecruitmentRequest',
    'src/modules/staffing/presentation/dto/appoint-manager.dto.ts': 'AppointManagerRequest',
    'src/modules/users/presentation/dto/update-account-status.dto.ts': 'UpdateAccountStatusRequest',
}

for fpath, sname in dto_map.items():
    sdef = schemas.get(sname, {})
    expected_props = list(sdef.get('properties', {}).keys())
    reqs = sdef.get('required', [])

    with open(fpath, 'r', encoding='utf-8') as fp:
        content = fp.read()

    # Extract class properties: e.g. "propName: type;" or "propName?: type;"
    dto_props = re.findall(r'^\s*([a-zA-Z0-9_]+)\??\s*:', content, re.MULTILINE)

    print(f"\n--- {sname} ({os.path.basename(fpath)}) ---")
    print(f"  OpenAPI expected: {expected_props} (required: {reqs})")
    print(f"  DTO actual:       {dto_props}")

    mismatches = set(expected_props) ^ set(dto_props)
    if mismatches:
        print(f"  ⚠️ MISMATCH: expected {expected_props} but got {dto_props}")
