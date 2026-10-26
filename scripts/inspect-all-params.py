import yaml
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('documentation/api/openapi.yaml', 'r', encoding='utf-8') as f:
    openapi = yaml.safe_load(f)

for path, methods in openapi.get('paths', {}).items():
    # Path-level params
    path_params = [p['name'] for p in methods.get('parameters', []) if isinstance(p, dict)]
    for method, spec in methods.items():
        if method.lower() in ['get', 'post', 'patch', 'delete', 'put']:
            op_params = spec.get('parameters', [])
            q_params = [p['name'] for p in op_params if isinstance(p, dict) and p.get('in') == 'query']
            p_params = [p['name'] for p in op_params if isinstance(p, dict) and p.get('in') == 'path']
            all_path = path_params + p_params
            print(f"{method.upper():6} {path:50} -> path: {all_path}, query: {q_params}")
