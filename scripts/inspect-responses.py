import yaml
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('documentation/api/openapi.yaml', 'r', encoding='utf-8') as f:
    openapi = yaml.safe_load(f)

for path, methods in openapi.get('paths', {}).items():
    for method, spec in methods.items():
        if method.lower() in ['get', 'post', 'patch', 'delete', 'put']:
            responses = spec.get('responses', {})
            succ = {c: r.get('description', '') for c, r in responses.items() if c.startswith('2')}
            schemas = {}
            for c, r in responses.items():
                if c.startswith('2'):
                    schema = r.get('content', {}).get('application/json', {}).get('schema', {})
                    if '$ref' in schema:
                        schemas[c] = schema['$ref'].split('/')[-1]
                    elif 'type' in schema:
                        t = schema['type']
                        if t == 'array':
                            it = schema.get('items', {})
                            ref = it.get('$ref', '').split('/')[-1] if '$ref' in it else it.get('type')
                            schemas[c] = f"array[{ref}]"
                        else:
                            schemas[c] = t
            print(f"{method.upper():6} {path:45} -> success: {succ}, schemas: {schemas}")
