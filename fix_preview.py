import re

with open('src/components/CertificatePreviewModal.tsx', 'r') as f:
    content = f.read()

content = content.replace("from all five statutory authorities", "from all six statutory authorities")
content = content.replace("that all five department clearances are complete", "that all six department clearances are complete")

with open('src/components/CertificatePreviewModal.tsx', 'w') as f:
    f.write(content)

