import os
import re
import yaml
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('documentation/api/openapi.yaml', 'r', encoding='utf-8') as f:
    openapi = yaml.safe_load(f)

# Find all requestBody schemas
request_bodies = {}
for path, methods in openapi.get('paths', {}).items():
    for method, spec in methods.items():
        if 'requestBody' in spec:
            content = spec['requestBody'].get('content', {}).get('application/json', {})
            schema_ref = content.get('schema', {}).get('$ref')
            if schema_ref:
                schema_name = schema_ref.split('/')[-1]
                schema_def = openapi.get('components', {}).get('schemas', {}).get(schema_name, {})
                request_bodies[(method.upper(), path)] = (schema_name, schema_def)

print(f"Total OpenAPI request bodies: {len(request_bodies)}")
for (m, p), (sname, sdef) in request_bodies.items():
    props = list(sdef.get('properties', {}).keys())
    reqs = sdef.get('required', [])
    print(f"{m:6} {p:45} -> {sname}: req={reqs}, props={props}")
