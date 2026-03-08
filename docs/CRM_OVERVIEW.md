# CRM Analytics - Complete Overview

## 📊 What is This CRM?

**SocialBrand 1980 CRM** is a comprehensive Customer Relationship Management system built specifically for tracking leads, analyzing sales performance, and generating detailed analytics reports.

## 🎯 Purpose

This CRM helps you:
1. **Track Leads** - Monitor all incoming leads from your website
2. **Analyze Performance** - View conversion rates, revenue, and funnel metrics
3. **Generate Reports** - Export detailed CSV reports with AI-powered insights
4. **Filter by Date** - View data for specific time periods (Today, Last 7 Days, Custom Range, etc.)

## 🌐 Access & Deployment

### **Current Setup:**
- ✅ **Local Access**: `http://localhost:3000/crm/analytics`
- ❌ **Production (Vercel)**: Currently restricted for security

### **Why Empty on Vercel?**

The CRM API (`/api/crm/leads`) has a **local-only restriction** by default:

```typescript
// Line 15-19 in app/api/crm/leads/route.ts
if (!isLocal && process.env.NODE_ENV === 'production') {
  return NextResponse.json(
    { error: 'CRM is only accessible locally' },
    { status: 403 }
  )
}
```

This is a **security measure** to prevent unauthorized access to your lead data.

## 🔓 Enable Production Access (Optional)

If you want to access CRM on Vercel:

### **Option 1: Remove Local-Only Restriction**

Edit `app/api/crm/leads/route.ts`:

```typescript
// Comment out or remove these lines (15-19):
/*
if (!isLocal && process.env.NODE_ENV === 'production') {
  return NextResponse.json(
    { error: 'CRM is only accessible locally' },
    { status: 403 }
  )
}
*/
```

⚠️ **Warning**: This makes CRM publicly accessible. Anyone with the URL can view your analytics!

### **Option 2: Add Authentication (Recommended)**

Add password protection or NextAuth.js authentication before enabling production access.

### **Option 3: Keep Local-Only (Current)**

Access CRM only on your local machine. This is the **most secure** option.

## 📁 Pages & Features

### **1. Analytics Dashboard** (`/crm/analytics`)

**Main Features:**
- **Date Filter** - Meta Ads style calendar picker
  - All time
  - Today
  - Yesterday
  - Last 7/14/30 days
  - This month
  - Last month
  - Custom range

- **Key Metrics Cards** (All filter by date range):
  - Total Leads
  - Active Deals
  - Total Revenue
  - Conversion Rate

- **Sales Funnel** - Visual pipeline breakdown
  - New Leads
  - Contacted
  - Discovery Call
  - Proposal
  - Negotiation
  - Closed Won

- **Revenue Overview Chart** - Smart grouping
  - Daily (≤14 days)
  - Weekly (15-90 days)
  - Monthly (>90 days)
  - Interactive tooltips
  - Gradient bars with glow effect

- **Industry Breakdown** - Top industries bar chart

- **Export Button** - Detailed CSV report
  - Executive summary
  - Key metrics
  - AI-powered insights (5 insights)
  - Sales funnel data
  - Detailed lead table

### **2. Data Source**

**Google Sheets Integration:**
- Fetches data from: `Work With Us Leads` spreadsheet
- Spreadsheet ID: `13ruAstGIxEl9y-9BQ1eWJsfTkYiwPAYK5obLug2q7N0`
- Real-time data sync
- Parses Google Sheets timestamp format: `Date(2026,2,8,14,26,56)`

**Data Fields:**
- Brand Name
- Contact Name
- Email
- Phone
- Industry
- Budget
- Lead Status (New, Contacted, Discovery Call, Proposal Sent, Negotiation, Closed Won, Closed Lost)
- Timestamp
- Services Needed
- Target Audience
- Competitors
- Timeline
- Notes

## 📊 Analytics Features

### **Smart Date Filtering:**
All metrics automatically filter based on selected date range:
- Total Leads → Only leads in date range
- Revenue → Only closed deals in date range
- Funnel → Only leads in date range
- Industry → Only leads in date range

### **AI-Powered Insights:**
When you export CSV, you get:
1. **Top Status** - Most common lead stage
2. **Top Industry** - Industry with most leads
3. **Revenue Analysis** - Total & average deal size
4. **Conversion Analysis** - Performance evaluation (Excellent/Good/Needs Improvement)
5. **Top Client** - Highest revenue client

### **Chart Grouping Logic:**
- **≤14 days** → Show daily bars (8 Mar, 9 Mar, etc.)
- **15-90 days** → Show weekly bars (Week 1, Week 2, etc.)
- **>90 days** → Show monthly bars (Jan, Feb, Mar, etc.)

## 🚀 How to Use

### **Local Development:**

1. **Run dev server:**
   ```bash
   npm run dev
   ```

2. **Access CRM:**
   ```
   http://localhost:3000/crm/analytics
   ```

3. **Select date range** from dropdown

4. **View metrics** - All update automatically

5. **Export report** - Click "Export" button

### **Production (Vercel):**

Currently **restricted** for security. To enable:

1. **Remove local-only check** (see Option 1 above)

2. **Deploy to Vercel**

3. **Access:**
   ```
   https://your-domain.vercel.app/crm/analytics
   ```

⚠️ **Remember to add authentication if enabling production access!**

## 📊 Export CSV Format

**Filename:** `socialbrand1980-analytics-report-2026-03-08.csv`

**Sections:**
```
SOCIALBRAND 1980 - ANALYTICS REPORT
Generated: 08-Mar-2026, 14:30:00
Date Range: Today
Total Leads: 5

EXECUTIVE SUMMARY
================
Total Leads: 5
Closed Won: 2
Total Revenue: Rp 170,000,000
Conversion Rate: 40.0%
Average Deal Size: Rp 85,000,000

KEY INSIGHTS
============
• Most leads are in 'New' stage (2 leads)
• Top industry: Fashion (2 leads)
• Total revenue from 2 closed deals: Rp 170,000,000
• Average deal size: Rp 85,000,000
• Excellent conversion rate of 40.0% - above industry average!
• Top client by revenue: Noa (Rp 50,000,000)

SALES FUNNEL
============
Stage,Count,Percentage
New Leads,2,40.0%
Contacted,1,20.0%
Discovery Call,1,20.0%
Proposal,1,20.0%
Negotiation,0,0.0%
Closed Won,2,40.0%

DETAILED LEAD DATA
==================
Brand Name,Status,Industry,Budget,Email,Phone,Timestamp
"Noa","Closed Won","Fashion","50000000","john@noa.com","08123456789","Date(2026,2,8,13,3,42)"
"Trueve","Closed Won","Beauty","150000000","jane@trueve.com","08123456788","Date(2026,2,8,14,26,56)"
```

## 🔒 Security Considerations

### **Current Security:**
✅ Local-only access (localhost)
✅ No authentication required (because local-only)
✅ Data fetched from Google Sheets (read-only)

### **If Enabling Production:**
⚠️ Add authentication (NextAuth.js, Clerk, etc.)
⚠️ Add role-based access control
⚠️ Add rate limiting
⚠️ Add audit logging
⚠️ Consider data encryption

## 📈 Tech Stack

- **Frontend**: React + Next.js 16
- **Charts**: Custom CSS/SVG charts
- **Data Source**: Google Sheets API
- **Export**: Client-side CSV generation
- **Styling**: Tailwind CSS
- **Deployment**: Vercel

## 🎨 Design Features

- **Dark theme** with neon blue accents
- **Glassmorphism** effects
- **Responsive** design (mobile-friendly)
- **Interactive** tooltips and hover states
- **Smooth** animations and transitions

## 📝 Summary

**CRM Analytics** is a powerful, locally-accessible analytics dashboard for tracking your SocialBrand 1980 leads and sales performance. It's currently **restricted to local access only** for security, but can be enabled for production with proper authentication.

**Key Strengths:**
✅ Real-time Google Sheets sync
✅ Smart date filtering
✅ AI-powered insights
✅ Detailed CSV exports
✅ Beautiful, modern UI
✅ Secure by default (local-only)

**Best For:**
- Internal team use on local machine
- Quick analytics and reporting
- Lead performance tracking
- Export for presentations/reports

---

**Need help enabling production access?** Check the "Enable Production Access" section above!
