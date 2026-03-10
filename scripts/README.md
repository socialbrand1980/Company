# Generate Dummy Data

Script untuk generate 50 data dummy leads untuk testing CRM.

## Cara Menjalankan

### Option 1: Direct Node.js

```bash
cd /Users/jhordideamarall/Projects/SocialBrand1980
node scripts/generate-dummy-data.js
```

### Option 2: NPM Script

Tambahkan ke `package.json`:

```json
{
  "scripts": {
    "generate-dummy": "node scripts/generate-dummy-data.js"
  }
}
```

Lalu jalankan:

```bash
npm run generate-dummy
```

## Output

Script akan:
1. Generate 50 data leads dummy
2. Submit ke Google Sheets via Apps Script webhook
3. Tampilkan progress dan hasil

Expected output:
```
🚀 Generating 50 dummy leads...

✅ Successfully submitted: TechVision A1
✅ Successfully submitted: StyleHub B2
...
✅ Successfully submitted: DataDrive T50

=================================
✅ Generation Complete!
✅ Success: 50
❌ Failed: 0
=================================

📊 Check your Google Sheets to see the new leads!
🔗 Visit /crm/pipeline to see the data in action
```

## Data yang Di-Generate

Setiap lead dummy memiliki:
- **Brand Name**: Random brand + letter + number
- **Industry**: Random dari 8 industries
- **Status**: Random dari pipeline stages (weighted towards New)
- **Budget**: Random antara 5M - 100M
- **Contact**: Random name, email, phone
- **Timestamp**: Random date dalam 30 hari terakhir

## Troubleshooting

### Error: "Failed to submit"

Pastikan:
1. Apps Script URL benar
2. Google Sheets accessible
3. Internet connection stabil

### Error: "Rate limiting"

Script sudah ada delay 200ms per request. Kalau masih error, tambah delay:

```javascript
await new Promise(resolve => setTimeout(resolve, 500)); // 500ms delay
```

### Data tidak muncul di Sheets

Check:
1. Apps Script deployment status
2. Google Sheets permissions
3. Console logs untuk error details

## Delete Dummy Data

Untuk menghapus data dummy:
1. Buka Google Sheets
2. Filter by "Dummy lead" di kolom Notes
3. Select all filtered rows
4. Delete rows

Atau manual delete satu per satu.
