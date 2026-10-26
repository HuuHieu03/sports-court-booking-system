import os
import re
import yaml
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('documentation/api/openapi.yaml', 'r', encoding='utf-8') as f:
    openapi = yaml.safe_load(f)

controllers_dir = os.path.join('src', 'modules')

discrepancies = []

for root, dirs, files in os.walk(controllers_dir):
    for file in files:
        if file.endswith('.controller.ts'):
            fpath = os.path.join(root, file)
            with open(fpath, 'r', encoding='utf-8') as fp:
                lines = fp.readlines()

            # Find controller base route
            base_route = ''
            for line in lines:
                m = re.search(r'@Controller\((?:[\'\"](.*?)[\'\"])?\)', line)
                if m and m.group(1):
                    base_route = m.group(1)
                    if not base_route.startswith('/'):
                        base_route = '/' + base_route
                    break

            for i, line in enumerate(lines):
                m = re.search(r'@(Get|Post|Patch|Delete|Put)\((?:[\'\"](.*?)[\'\"])?\)', line)
                if m:
                    http_m = m.group(1).upper()
                    sub = m.group(2) or ''
                    if sub and not sub.startswith('/'):
                        sub = '/' + sub
                    full_path = (base_route + sub).replace('//', '/')
                    if not full_path.startswith('/'):
                        full_path = '/' + full_path
                    norm_path = re.sub(r':([a-zA-Z0-9_]+)', r'{\1}', full_path)

                    # Look for @HttpCode
                    http_code = None
                    for j in range(max(0, i-3), min(len(lines), i+4)):
                        hc = re.search(r'@HttpCode\((?:HttpStatus\.)?([A-Z_]+|\d+)\)', lines[j])
                        if hc:
                            val = hc.group(1)
                            if val == 'CREATED' or val == '201':
                                http_code = '201'
                            elif val == 'NO_CONTENT' or val == '204':
                                http_code = '204'
                            elif val == 'OK' or val == '200':
                                http_code = '200'
                            else:
                                http_code = val
                    if not http_code:
                        http_code = '201' if http_m == 'POST' else '200'

                    # Look up in OpenAPI
                    op_spec = openapi.get('paths', {}).get(norm_path, {}).get(http_m.lower())
                    if op_spec:
                        responses = op_spec.get('responses', {})
                        expected_success_codes = [c for c in responses.keys() if c.startswith('2')]
                        if http_code not in expected_success_codes:
                            discrepancies.append(
                                f"{http_m} {norm_path} in {file}: NestJS uses {http_code}, OpenAPI expects {expected_success_codes}"
                            )

print(f"Status Code Discrepancies: {len(discrepancies)}")
for d in discrepancies:
    print("  *", d)
