import re

with open('src/views/HodDashboard.tsx', 'r') as f:
    content = f.read()

# Add itinfra to departmentMeta
content = content.replace("{ id: 'sports' as const, label: 'Sports', icon: <Trophy className=\"w-3.5 h-3.5\" /> },", "{ id: 'sports' as const, label: 'Sports', icon: <Trophy className=\"w-3.5 h-3.5\" /> },\n    { id: 'itinfra' as const, label: 'IT Infra', icon: <Laptop className=\"w-3.5 h-3.5\" /> },")

with open('src/views/HodDashboard.tsx', 'w') as f:
    f.write(content)

