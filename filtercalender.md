Supaya AI benar-benar ngerti, kamu harus jelasin **3 bagian utama**:

1️⃣ **UI Layout** (calendar + sidebar preset)
2️⃣ **Behavior** (apa yang terjadi saat diklik)
3️⃣ **Preset date logic** (Today, Last 7 days, dll)

Kalau cuma bilang *“date filter seperti Meta Ads”* kadang AI masih bingung. Jadi lebih baik jelasin **struktur komponennya**.

Aku buatkan **prompt yang jelas untuk AI builder / coding AI**.

---

# Prompt – Date Filter Like Meta Ads / Shopee Analytics

```
Create a date range filter component similar to the one used in Meta Ads Manager or Shopee Analytics.

UI Structure:

When the user clicks the "Date Range" filter button, a dropdown panel should appear.

Inside the panel:

LEFT SIDEBAR (Preset Date Options)
- Today
- Yesterday
- Last 7 Days
- Last 14 Days
- Last 30 Days
- This Month
- Last Month
- Custom Range

RIGHT PANEL (Calendar Picker)
- A calendar date picker for selecting start date and end date
- Users can select a date range directly from the calendar
- When selecting a preset option, the calendar automatically updates

Bottom Section:
- Apply Button
- Cancel Button

Behavior:

- Clicking a preset date automatically sets the start date and end date
- Clicking "Custom Range" allows the user to manually select dates
- The selected range should appear on the filter button (example: "Last 30 Days")
- When the user clicks Apply, the dashboard data updates based on the selected date range

Design Style:

- Similar to Meta Ads Manager / Shopee Seller Center
- Modern SaaS dashboard style
- White background
- Light shadow dropdown
- Rounded corners
- Compact layout

Output:

A reusable Date Range Filter component suitable for analytics dashboards or CRM systems.
```

---

# Gambaran UI yang Kamu Maksud

Biasanya tampilannya seperti ini:

```
[ Date Range ▼ ]
```

Ketika diklik:

```
-----------------------------------------
| Today           |   [ Calendar       |
| Yesterday       |   March 2026       |
| Last 7 Days     |                   |
| Last 30 Days    |   10 11 12 13     |
| This Month      |   14 15 16 17     |
| Last Month      |                   |
| Custom Range    |                   |
|                 |                   |
-----------------------------------------
           [Cancel]   [Apply]
```

Jadi:

* **kiri = quick filter**
* **kanan = calendar**

Ini sama seperti di:

* **Meta Ads Manager**
* **Shopee Seller Center**
* **Google Analytics**

---


