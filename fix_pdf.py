import re

with open('src/utils/certificate.ts', 'r') as f:
    content = f.read()

# Fix spacing in left/right columns
content = content.replace("doc.text('Candidate Name:', 20, 67);", "doc.text('Candidate Name:', 15, 67);")
content = content.replace("doc.text(student.name, 55, 67);", "doc.text(student.name, 45, 67);")
content = content.replace("doc.text('Student ID (Roll):', 115, 67);", "doc.text('Student ID (Roll):', 125, 67);")
content = content.replace("doc.text(student.id.toUpperCase(), 150, 67);", "doc.text(student.id.toUpperCase(), 160, 67);")

content = content.replace("doc.text('Program & Branch:', 20, 74);", "doc.text('Program & Branch:', 15, 74);")
content = content.replace("doc.text(`${student.studentType === 'puc' ? 'PUC' : 'B.Tech'} - ${student.branch}`, 55, 74);", "doc.text(`${student.studentType === 'puc' ? 'PUC' : 'B.Tech'} - ${student.branch}`, 45, 74);")
content = content.replace("doc.text('Academic Batch:', 115, 74);", "doc.text('Academic Batch:', 125, 74);")
content = content.replace("doc.text(student.batch, 150, 74);", "doc.text(student.batch, 160, 74);")

content = content.replace("doc.text('Institutional Email:', 20, 81);", "doc.text('Institutional Email:', 15, 81);")
content = content.replace("doc.text(student.email, 55, 81);", "doc.text(student.email, 45, 81);")
content = content.replace("doc.text('Clearance Status:', 115, 81);", "doc.text('Clearance Status:', 125, 81);")
content = content.replace("doc.text('ALL DUES CLEARED (VERIFIED)', 150, 81);", "doc.text('ALL DUES CLEARED (VERIFIED)', 160, 81);")

# Update cert text
content = content.replace("from all five statutory departments", "from all six statutory departments")

# Update col widths
content = content.replace("dept: 38,", "dept: 35,")
content = content.replace("status: 24,", "status: 22,")
content = content.replace("signatory: 55,", "signatory: 46,")
content = content.replace("timestamp: 33,", "timestamp: 32,")
content = content.replace("hash: 32,", "hash: 43,")

# Add itinfra to table
content = content.replace("{ id: 'sports', label: 'Sports & Physical Ed.' },", "{ id: 'sports', label: 'Sports & Physical Ed.' },\n    { id: 'itinfra', label: 'IT Infrastructure' },")

# Update bottom text
content = content.replace("all five department clearances", "all six department clearances")

with open('src/utils/certificate.ts', 'w') as f:
    f.write(content)

