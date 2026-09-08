import re
with open('src/views/HodDashboard.tsx', 'r') as f:
    content = f.read()

content = content.replace("lg:grid-cols-5 gap-2.5", "lg:grid-cols-6 gap-2.5")

with open('src/views/HodDashboard.tsx', 'w') as f:
    f.write(content)

