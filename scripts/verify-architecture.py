import os
import re

errors = []

# 1. Verify 4 layers in all 7 modules
modules = ['auth', 'users', 'venues', 'bookings', 'staffing', 'feedback', 'notifications']
for m in modules:
    for layer in ['domain', 'infrastructure', 'application', 'presentation']:
        p = os.path.join('src', 'modules', m, layer)
        if not os.path.exists(p):
            errors.append(f'Missing layer: {p}')

# 2. Verify pure TS in domain layer (no @nestjs, no @prisma)
for root, dirs, files in os.walk(os.path.join('src', 'modules')):
    if os.path.basename(root) == 'domain':
        for f in files:
            if f.endswith('.ts'):
                fpath = os.path.join(root, f)
                with open(fpath, encoding='utf-8') as fp:
                    content = fp.read()
                    if '@nestjs/' in content or '@prisma/' in content:
                        errors.append(f'Forbidden import in domain layer ({fpath}): NestJS/Prisma detected')

# 3. Check for the 5 intentional defect hooks
hooks = {
    'HOOK-01': ('src/modules/bookings/application/bookings.service.ts', 'HOOK-01'),
    'HOOK-02': ('src/modules/venues/application/venues.service.ts', 'HOOK-02'),
    'HOOK-03': ('src/modules/notifications/application/notifications.service.ts', 'HOOK-03'),
    'HOOK-04': ('src/common/guards/dynamic-manager.guard.ts', 'HOOK-04'),
    'HOOK-05': ('src/modules/auth/presentation/auth.controller.ts', 'HOOK-05'),
}
for hook, (fpath, kw) in hooks.items():
    if not os.path.exists(fpath):
        errors.append(f'Missing hook file {fpath}')
    else:
        with open(fpath, encoding='utf-8') as fp:
            if kw not in fp.read():
                errors.append(f'Missing keyword {kw} in {fpath}')

# 4. Verify relative import paths
ts_files = []
for root, dirs, files in os.walk('src'):
    for f in files:
        if f.endswith('.ts'):
            ts_files.append(os.path.join(root, f))

for fpath in ts_files:
    dir_path = os.path.dirname(fpath)
    with open(fpath, encoding='utf-8') as fp:
        for line_no, line in enumerate(fp, 1):
            m = re.search(r'from\s+[\'\"](\.[^\'\"]+)[\'\"]', line)
            if m:
                rel = m.group(1)
                cand1 = os.path.normpath(os.path.join(dir_path, rel + '.ts'))
                cand2 = os.path.normpath(os.path.join(dir_path, rel, 'index.ts'))
                cand3 = os.path.normpath(os.path.join(dir_path, rel))
                if not (os.path.exists(cand1) or os.path.exists(cand2) or os.path.isdir(cand3)):
                    errors.append(f'Broken relative import at {fpath}:{line_no} -> {rel}')

print(f'Checked {len(ts_files)} TypeScript files.')
print(f'Errors found: {len(errors)}')
for e in errors:
    print('  ERROR:', e)
if not errors:
    print('SUCCESS: ALL ARCHITECTURAL AND IMPORT CHECKS PASSED!')
