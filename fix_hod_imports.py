import re
with open('src/views/HodDashboard.tsx', 'r') as f:
    content = f.read()

content = content.replace("Trophy,\n  KeyRound", "Trophy,\n  Laptop,\n  KeyRound")
with open('src/views/HodDashboard.tsx', 'w') as f:
    f.write(content)
