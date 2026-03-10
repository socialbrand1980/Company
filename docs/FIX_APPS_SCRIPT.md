# Fix Google Apps Script untuk Update Lead

## 🐛 Masalah

Saat ini saat drag & drop lead di pipeline:
- ✅ API call berhasil
- ❌ Data ter-duplikat (bukan ter-update)
- ❌ Row lama tidak di-update, malah create row baru

## ✅ Solusi

Update Google Apps Script dengan code yang properly handle **update existing row** based on email.

## 📝 Langkah-Langkah

### 1. Buka Google Apps Script

1. Buka Google Sheets kamu
2. Click **Extensions** → **Apps Script**
3. Akan terbuka editor Apps Script

### 2. Replace Semua Code

**Hapus semua code lama** dan **paste code baru** dari file:
```
docs/APPS_SCRIPT_CODE.js
```

Code baru ini punya 3 fungsi:
- `doPost()` - Handle POST requests (create & update)
- `handleCreate()` - Create new lead (existing functionality)
- `handleUpdate()` - **Update existing lead by email** ← FIX!
- `doGet()` - Get all leads (for fetching data)

### 3. Deploy Ulang

1. Click **Deploy** → **Manage deployments**
2. Click **Edit** (icon pensil) pada deployment yang ada
3. **Version**: Select "New version"
4. **Description**: "Add update functionality"
5. Click **Deploy**
6. **Copy Web App URL** (sama dengan yang lama)

### 4. Test

1. **Refresh** `/crm/pipeline`
2. **Drag** lead dari satu stage ke stage lain
3. **Check**:
   - ✅ Alert muncul: "✅ Successfully moved to [stage]"
   - ✅ Console log muncul dengan response
   - ✅ Data di Google Sheets ter-update (bukan duplikat)
   - ✅ Pipeline refresh dan lead pindah stage

## 🔍 Debugging

### Kalau masih duplikat:

Check **Apps Script Logs**:
1. Di Apps Script editor
2. Click **Executions** (icon clock di kiri)
3. Look untuk execution terbaru
4. Check `Logger.log()` output

Expected logs:
```
Action: update
Data: {email: "...", updates: {leadstatus: "Discovery Call"}}
Found lead at row: 5
Updated leadstatus to: Discovery Call
Updated lead: test@example.com
```

### Kalau error "Lead not found":

Artinya email tidak match. Check:
1. Email di Google Sheets exact match dengan yang di request
2. No extra spaces
3. Case-sensitive (harus exact same)

### Kalau error "Column not found":

Artinya header column name tidak match. Check:
1. Header di row 1 Google Sheets
2. Column name harus lowercase (atau code akan auto-convert)
3. No special characters

## 📊 Column Names di Google Sheets

Pastikan column names di Google Sheets **exact same** dengan ini:

```
Timestamp | Brand Name | Website | Industry | Target Market | Year Founded | Team Size | Primary Goal | Run Ads | Channels | Budget | Target Audience | Competitors | Timeline | Services Needed | Full Name | Email | Phone | Role | Lead Status | Notes
```

**Important**: 
- `Lead Status` column harus ada (case-insensitive)
- `Email` column harus ada (case-insensitive)
- Row 1 adalah headers
- Data mulai dari row 2

## ✅ Expected Behavior

Setelah fix:

1. **Drag lead** dari "Contacted" ke "Discovery Call"
2. **API call** ke `/api/crm/leads` dengan:
   ```json
   {
     "email": "test@example.com",
     "updates": { "leadstatus": "Discovery Call" }
   }
   ```
3. **Apps Script**:
   - Find row dengan email matching
   - Update column `leadstatus` di row tersebut
   - **NOT** create new row
4. **Google Sheets**:
   - Row yang sama, column Lead Status berubah
   - **NO** duplicate row
5. **Pipeline UI**:
   - Lead pindah ke stage "Discovery Call"
   - Data refresh
   - Success alert muncul

## 🚀 Test Checklist

- [ ] Drag lead dari New → Contacted
- [ ] Check Google Sheets - row ter-update (bukan duplikat)
- [ ] Drag lead dari Contacted → Discovery Call
- [ ] Check console - no errors
- [ ] Drag lead dari Discovery Call → Proposal Sent
- [ ] Check pipeline - lead pindah dengan benar
- [ ] Edit lead via modal - save successfully
- [ ] Check Google Sheets - data ter-update

## 📞 Troubleshooting

**Q: Data masih duplikat?**
A: Pastikan Apps Script sudah di-deploy ulang dengan version baru

**Q: Error "Sheet not found"?**
A: Check sheet name di code: `const SHEET_NAME = 'Work With Us Leads';`

**Q: Update berhasil tapi UI tidak refresh?**
A: Frontend code sudah benar, akan auto-refresh setelah update

**Q: Email tidak match?**
A: Check exact email value di Google Sheets vs yang di-send

## 📚 Resources

- [Google Apps Script Documentation](https://developers.google.com/apps-script)
- [Sheets API Reference](https://developers.google.com/apps-script/reference/spreadsheet)
- [Deploy Web Apps](https://developers.google.com/apps-script/guides/web)
