import os
import re

dto_files = []
for root, dirs, files in os.walk('src'):
    for f in files:
        if f.endswith('.dto.ts'):
            dto_files.append(os.path.join(root, f))

for fpath in dto_files:
    with open(fpath, 'r', encoding='utf-8') as fp:
        lines = fp.readlines()
    for i, line in enumerate(lines):
        line_str = line.strip()
        m = re.match(r'^([a-zA-Z0-9_]+)\??\s*:\s*[^=;]+;', line_str)
        if m:
            prop_name = m.group(1)
            # check immediate preceding lines (stopping at any other property or closing brace)
            preceding_decorators = []
            for j in range(i-1, -1, -1):
                prev = lines[j].strip()
                if not prev or prev.startswith('//') or prev.startswith('/*') or prev.startswith('*'):
                    continue
                if prev.startswith('@'):
                    preceding_decorators.append(prev)
                else:
                    break
            has_validator = any(re.search(r'@(?:Is[A-Z]|MinLength|MaxLength|Matches|IsIn)', d) for d in preceding_decorators)
            if not has_validator:
                print(f'{fpath}:{i+1} -> property "{prop_name}" has NO validator decorator! Preceding: {preceding_decorators}')
