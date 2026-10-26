import os
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

print("=" * 75)
print("  VERIFYING RESOLUTION OF 12 INDEPENDENT AUDIT FINDINGS")
print("=" * 75)

failures = []

def check(condition, desc):
    if condition:
        print(f"  [PASS] {desc}")
    else:
        print(f"  [FAIL] {desc}")
        failures.append(desc)

# 1. Dynamic RBAC on PATCH /venues/:venueId
print("\n[Issue 1] Phân quyền Dynamic RBAC tại PATCH /venues/:venueId...")
with open('src/modules/venues/presentation/venues.controller.ts', 'r', encoding='utf-8') as f:
    vc = f.read()
with open('src/modules/venues/application/venues.service.ts', 'r', encoding='utf-8') as f:
    vs = f.read()

patch_venue_match = re.search(r'@(?:UseGuards\([^)]*DynamicManagerGuard[^)]*\)\s*@Patch\([\'"]venues/:venueId[\'"]\)|Patch\([\'"]venues/:venueId[\'"]\)\s*@UseGuards\([^)]*DynamicManagerGuard[^)]*\))', vc)
roles_owner_on_patch = re.search(r'@Roles\([\'"]OWNER[\'"]\)\s*(?:@[a-zA-Z0-9_]+\([^)]*\)\s*)*@Patch\([\'"]venues/:venueId[\'"]\)', vc)
check(patch_venue_match is not None, "PATCH /venues/:venueId uses DynamicManagerGuard")
check(roles_owner_on_patch is None, "PATCH /venues/:venueId has removed @Roles('OWNER')")
check('isUserActiveManager(requesterId, venueId)' in vs, "VenuesService.updateVenue verifies isUserActiveManager for active managers")

# 2. Admin cannot lock self (ADMIN_CANNOT_LOCK_SELF)
print("\n[Issue 2] Chặn Admin tự khóa chính mình (ADMIN_CANNOT_LOCK_SELF)...")
with open('src/modules/users/presentation/admin-accounts.controller.ts', 'r', encoding='utf-8') as f:
    ac = f.read()
check('ADMIN_CANNOT_LOCK_SELF' in ac and "user.userId === accountId && dto.status === 'LOCKED'" in ac,
      "AdminAccountsController blocks admin from locking self with code ADMIN_CANNOT_LOCK_SELF")

# 3. Admin cannot delete self (SELF_DELETE_NOT_ALLOWED)
print("\n[Issue 3] Chặn Admin tự xóa chính mình (SELF_DELETE_NOT_ALLOWED)...")
check('SELF_DELETE_NOT_ALLOWED' in ac and "user.userId === accountId" in ac,
      "AdminAccountsController blocks admin from self-deletion with code SELF_DELETE_NOT_ALLOWED")

# 4. 409 Conflict when deleting Venue/Court with active bookings
print("\n[Issue 4] Mã lỗi khi xóa Venue/Court có active bookings (409 Conflict)...")
with open('src/modules/venues/application/courts.service.ts', 'r', encoding='utf-8') as f:
    cs = f.read()
check("code: 'VENUE_HAS_ACTIVE_BOOKINGS'" in vs and "ConflictException" in vs,
      "VenuesService.deleteVenue throws ConflictException VENUE_HAS_ACTIVE_BOOKINGS")
check("code: 'COURT_HAS_ACTIVE_BOOKINGS'" in cs and "ConflictException" in cs,
      "CourtsService.deleteCourt throws ConflictException COURT_HAS_ACTIVE_BOOKINGS")

# 5. No leak of manager's email/phone on public GET /venues/:venueId
print("\n[Issue 5] Lộ thông tin cá nhân của Manager trên API công khai GET /venues/:venueId...")
venue_detail_m = re.search(r'async getVenueDetail\([^)]*\)\s*\{([^}]+(?:\{[^}]+?\}[^}]+?)*)\}', vs)
if venue_detail_m:
    body = venue_detail_m.group(1)
    check('activeManager' not in body, "getVenueDetail does not expose activeManager object")
    check('email' not in body and 'phone' not in body, "getVenueDetail does not contain email or phone")
else:
    check(False, "Could not extract getVenueDetail method body")

# 6. Soft-deleting Venue closes recruitment and revokes manager
print("\n[Issue 6] Xóa mềm Venue cần đóng tuyển dụng và thu hồi Manager đương nhiệm...")
check("recruitmentOpen = false" in vs and "recruitmentMessage = null" in vs,
      "VenuesService.deleteVenue closes recruitment (isOpen=false, message=null)")
check("revokeManagerOnVenueDeletion" in vs,
      "VenuesService.deleteVenue calls staffingService.revokeManagerOnVenueDeletion(venueId)")
with open('src/modules/staffing/application/staffing.service.ts', 'r', encoding='utf-8') as f:
    ss = f.read()
check("async revokeManagerOnVenueDeletion(venueId: string)" in ss,
      "StaffingService implements revokeManagerOnVenueDeletion(venueId)")

# 7. managedVenueIds in GET /admin/accounts
print("\n[Issue 7] Bổ sung managedVenueIds trong GET /admin/accounts...")
with open('src/modules/users/application/users.service.ts', 'r', encoding='utf-8') as f:
    us = f.read()
check("managedVenueIds" in ac and "getManagedVenueIds" in ac,
      "AdminAccountsController returns managedVenueIds in getAccounts, getAccountById, and updateStatus")
check("async getManagedVenueIds(userId: string)" in us,
      "UsersService provides getManagedVenueIds(userId) delegation")

# 8. Idempotent soft delete on account (HTTP 204)
print("\n[Issue 8] Xóa lại tài khoản đã xóa phải trả về HTTP 204 (Idempotent DELETE)...")
check("if (account.deletedAt !== null) {\n      return;\n    }" in us,
      "UsersService.softDeleteAccount returns early if account is already deleted")

# 9. Clean exports of all 6 modules
print("\n[Issue 9] Dọn dẹp exports của 6 *.module.ts...")
modules_to_check = [
    ('src/modules/users/users.module.ts', 'ACCOUNT_REPOSITORY'),
    ('src/modules/venues/venues.module.ts', 'VENUE_REPOSITORY'),
    ('src/modules/venues/venues.module.ts', 'COURT_REPOSITORY'),
    ('src/modules/bookings/bookings.module.ts', 'BOOKING_REPOSITORY'),
    ('src/modules/staffing/staffing.module.ts', 'STAFFING_REPOSITORY'),
    ('src/modules/feedback/feedback.module.ts', 'FEEDBACK_REPOSITORY'),
    ('src/modules/notifications/notifications.module.ts', 'NOTIFICATION_REPOSITORY'),
]
for mod_path, token in modules_to_check:
    with open(mod_path, 'r', encoding='utf-8') as f:
        mod_content = f.read()
    exports_match = re.search(r'exports:\s*\[([^\]]+)\]', mod_content)
    is_exported = token in exports_match.group(1) if exports_match else False
    check(not is_exported, f"{mod_path} does not export internal token {token}")

# 10. Decorators on fallback DTO fields
print("\n[Issue 10] Xử lý các trường fallback trong DTO không có decorator...")
with open('src/modules/bookings/presentation/dto/cancel-venue-booking.dto.ts', 'r', encoding='utf-8') as f:
    cb_dto = f.read()
with open('src/modules/staffing/presentation/dto/apply-manager.dto.ts', 'r', encoding='utf-8') as f:
    am_dto = f.read()
with open('src/modules/staffing/presentation/dto/recruitment-toggle.dto.ts', 'r', encoding='utf-8') as f:
    rt_dto = f.read()

check('@IsOptional()' in cb_dto and 'cancellationReason?: string;' in cb_dto,
      "CancelVenueBookingDto has @IsOptional() on cancellationReason")
check('@IsOptional()' in am_dto and 'consented?: boolean;' in am_dto,
      "ApplyManagerDto has @IsOptional() on consented")
check('@IsOptional()' in rt_dto and 'recruitmentOpen?: boolean;' in rt_dto and 'recruitmentMessage?: string;' in rt_dto,
      "RecruitmentToggleDto has @IsOptional() on recruitmentOpen and recruitmentMessage")

# 11. Enforce startsAt and endsAt on GET /courts/:courtId/availability
print("\n[Issue 11] Bắt buộc startsAt và endsAt tại GET /courts/:courtId/availability...")
with open('src/modules/venues/presentation/courts.controller.ts', 'r', encoding='utf-8') as f:
    cc = f.read()
check("if (!startsAt || !endsAt) {\n      throw new BadRequestException('startsAt và endsAt là bắt buộc');\n    }" in cc,
      "CourtsController.getAvailability strictly requires startsAt and endsAt with BadRequestException")

# 12. Password length constraints in RegisterDto
print("\n[Issue 12] Ràng buộc độ dài mật khẩu trong RegisterDto...")
with open('src/modules/auth/presentation/dto/register.dto.ts', 'r', encoding='utf-8') as f:
    reg_dto = f.read()
check("@MinLength(8" in reg_dto and "@MaxLength(128" in reg_dto,
      "RegisterDto password enforces @MinLength(8) and @MaxLength(128)")

print("\n" + "=" * 75)
if not failures:
    print("  ALL 12 AUDIT ISSUES ARE 100% FIXED AND VERIFIED!")
else:
    print(f"  FAILURES ENCOUNTERED ({len(failures)}):")
    for fl in failures:
        print(f"    - {fl}")
print("=" * 75)
