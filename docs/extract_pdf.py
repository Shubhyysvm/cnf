import pdfplumber
import json

pdf_path = r'c:\xampp\htdocs\CountryNaturalFoods\docs\CNF PRICE LIST.pdf'

with pdfplumber.open(pdf_path) as pdf:
    all_text = ''
    for page in pdf.pages:
        all_text += page.extract_text() + '\n\n'

print(all_text)

with open(r'c:\xampp\htdocs\CountryNaturalFoods\docs\extracted_text.txt', 'w', encoding='utf-8') as f:
    f.write(all_text)

print('\n\n=== TEXT SAVED TO extracted_text.txt ===')
