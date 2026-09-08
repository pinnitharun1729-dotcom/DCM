import re
with open('src/components/CertificatePreviewModal.tsx', 'r') as f:
    content = f.read()

content = content.replace("{ id: 'sports' as const, name: 'Sports & Physical Ed.' },", "{ id: 'sports' as const, name: 'Sports & Physical Ed.' },\n    { id: 'itinfra' as const, name: 'IT Infrastructure' },")

with open('src/components/CertificatePreviewModal.tsx', 'w') as f:
    f.write(content)

