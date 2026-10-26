import os
import re
import yaml
import sys

sys.stdout.reconfigure(encoding='utf-8')

# 1. Parse OpenAPI paths
with open('documentation/api/openapi.yaml', 'r', encoding='utf-8') as f:
    openapi = yaml.safe_load(f)

openapi_endpoints = {}
for path, methods in openapi.get('paths', {}).items():
    for method, spec in methods.items():
        if method.lower() in ['get', 'post', 'patch', 'delete', 'put']:
            openapi_endpoints[(method.upper(), path)] = spec

print(f"Total OpenAPI operations: {len(openapi_endpoints)}")

# 2. Extract NestJS controller endpoints
controllers_dir = os.path.join('src', 'modules')
nest_endpoints = []

for root, dirs, files in os.walk(controllers_dir):
    for file in files:
        if file.endswith('.controller.ts'):
            fpath = os.path.join(root, file)
            with open(fpath, 'r', encoding='utf-8') as fp:
                content = fp.read()

            # Class controller route
            c_match = re.search(r'@Controller\((?:[\'\"](.*?)[\'\"])?\)', content)
            base_route = c_match.group(1) if c_match and c_match.group(1) else ''
            if base_route and not base_route.startswith('/'):
                base_route = '/' + base_route

            # Find methods
            method_matches = re.finditer(r'@(Get|Post|Patch|Delete|Put)\((?:[\'\"](.*?)[\'\"])?\)', content)
            for m in method_matches:
                http_m = m.group(1).upper()
                sub = m.group(2) or ''
                if sub and not sub.startswith('/'):
                    sub = '/' + sub
                full_path = (base_route + sub).replace('//', '/')
                if not full_path.startswith('/'):
                    full_path = '/' + full_path
                # Convert :param to {param}
                norm_path = re.sub(r':([a-zA-Z0-9_]+)', r'{\1}', full_path)
                nest_endpoints.append((http_m, norm_path, file, fpath))

print(f"Total NestJS controller endpoints: {len(nest_endpoints)}")

# 3. Compare OpenAPI vs NestJS
missing_in_nest = []
for (m, p) in openapi_endpoints:
    found = any(nm == m and np == p for nm, np, _, _ in nest_endpoints)
    if not found:
        missing_in_nest.append((m, p))

extra_in_nest = []
for (m, p, f, _) in nest_endpoints:
    found = any(om == m and op == p for om, op in openapi_endpoints)
    if not found:
        extra_in_nest.append((m, p, f))

print(f"\n--- Coverage Analysis ---")
print(f"Missing in NestJS: {len(missing_in_nest)}")
for m, p in missing_in_nest:
    print(f"  MISSING: {m:6} {p}")

print(f"Extra in NestJS: {len(extra_in_nest)}")
for m, p, f in extra_in_nest:
    print(f"  EXTRA:   {m:6} {p} in {f}")
