# Analytics Report Export

Generate professional PDF analytics reports with Python-powered analysis, charts, and insights.

## Features

✅ **Comprehensive Analysis**
- Total leads, revenue, conversion rate
- Average deal size
- Status distribution
- Industry breakdown

✅ **Visual Charts**
- Lead status distribution (pie chart)
- Revenue over time (line chart)
- Industry breakdown (bar chart)

✅ **AI-Powered Insights**
- Performance analysis
- Trend detection
- Top client identification
- Conversion optimization tips

✅ **Professional PDF Report**
- Company branding
- Executive summary
- Key metrics table
- Charts and visualizations
- Detailed insights
- Data tables

## Setup

### 1. Install Python Dependencies

```bash
cd scripts
pip install -r requirements.txt
```

Or manually:

```bash
pip install pandas numpy matplotlib reportlab
```

### 2. Verify Python Installation

```bash
python3 --version
# or
python --version
```

### 3. Test Report Generation

```bash
cd scripts
python generate_report.py '{"leads": [], "dateRange": {"label": "Test"}}'
```

## Usage

### From CRM Dashboard

1. Navigate to `/crm/analytics`
2. Select desired date range (Today, Last 7 Days, Custom, etc.)
3. Click **Export** button
4. PDF report will be generated and downloaded automatically

### Report Contents

The generated PDF includes:

1. **Header**
   - Company name (SocialBrand 1980)
   - Report title
   - Date range
   - Generated date

2. **Executive Summary**
   - Overview of key metrics
   - Brief narrative analysis

3. **Key Metrics Table**
   - Total Leads
   - Closed Won count
   - Total Revenue
   - Conversion Rate
   - Average Deal Size

4. **Analytics Charts**
   - Lead Status Distribution
   - Revenue Over Time
   - Industry Breakdown

5. **Key Insights**
   - Performance analysis
   - Trend detection
   - Recommendations

6. **Detailed Data**
   - Lead-by-lead breakdown
   - Up to 50 rows

## File Output

**Filename format:**
```
socialbrand1980-analytics-report-DD-MM-YYYY.pdf
```

**Example:**
```
socialbrand1980-analytics-report-08-03-2026.pdf
```

## Troubleshooting

### Python Not Found

**Error:** `Failed to start Python process`

**Solution:**
```bash
# Install Python 3.8+
# macOS
brew install python3

# Ubuntu/Debian
sudo apt-get install python3 python3-pip

# Windows
# Download from python.org
```

### Missing Dependencies

**Error:** `ModuleNotFoundError: No module named 'pandas'`

**Solution:**
```bash
cd scripts
pip install -r requirements.txt
```

### Permission Issues

**Error:** `Permission denied`

**Solution:**
```bash
chmod +x scripts/generate_report.py
```

## Technical Details

### Data Flow

```
User clicks Export
    ↓
Frontend collects filtered data
    ↓
POST /api/export-report
    ↓
Next.js API Route
    ↓
Spawn Python process
    ↓
generate_report.py
    ├── Analyze data (pandas)
    ├── Generate charts (matplotlib)
    ├── Create insights
    └── Generate PDF (reportlab)
    ↓
Return PDF file
    ↓
Browser downloads file
```

### Python Script

**Location:** `scripts/generate_report.py`

**Functions:**
- `analyze_data()` - Perform data analysis
- `create_charts()` - Generate chart images
- `generate_pdf_report()` - Create PDF document
- `main()` - Entry point

### API Route

**Location:** `app/api/export-report/route.ts`

**Method:** POST

**Request Body:**
```json
{
  "leads": [...],
  "dateRange": {...},
  "stats": {...}
}
```

**Response:** PDF file (application/pdf)

## Customization

### Modify Report Template

Edit `scripts/generate_report.py`:
- Change colors in `HexColor('#2D75FF')`
- Modify layout in `generate_pdf_report()`
- Add/remove sections

### Add More Charts

In `create_charts()` function:
```python
# Create new figure
fig, ax = plt.subplots(figsize=(12, 6))
# ... create chart ...
plt.savefig('new_chart.png')
```

### Customize Insights

In `analyze_data()` function:
```python
# Add custom insight
if some_condition:
    insights.append("Your custom insight here.")
```

## Performance

- **Small datasets** (<100 leads): ~2-3 seconds
- **Medium datasets** (100-500 leads): ~3-5 seconds
- **Large datasets** (>500 leads): ~5-10 seconds

## Security Notes

- Python script runs server-side only
- No external API calls
- Temporary files cleaned up after generation
- No data persistence (reports generated on-demand)

## Support

For issues or questions:
1. Check console logs in browser DevTools
2. Check server logs for Python errors
3. Verify Python dependencies are installed
4. Ensure Python 3.8+ is available
