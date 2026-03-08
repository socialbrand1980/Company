#!/usr/bin/env python3
"""
SocialBrand 1980 - Analytics Report Generator
Generates PDF reports with analytics, charts, and insights
"""

import json
import sys
from datetime import datetime, timedelta
from pathlib import Path

# Data analysis
import pandas as pd
import numpy as np

# Visualization
import matplotlib.pyplot as plt
import matplotlib
matplotlib.use('Agg')  # Non-interactive backend

# PDF generation
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch, cm
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, Image, PageBreak
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_JUSTIFY
from reportlab.lib.colors import HexColor

def analyze_data(data):
    """Perform comprehensive data analysis"""
    insights = []
    
    # Convert to DataFrame
    leads = data.get('leads', [])
    if not leads:
        return {
            'insights': ['No data available for analysis.'],
            'metrics': {},
            'charts': {}
        }
    
    df = pd.DataFrame(leads)
    
    # Filter Closed Won for revenue analysis
    closed_won = df[df['leadstatus'] == 'Closed Won']
    
    # Calculate metrics
    total_leads = len(df)
    total_revenue = closed_won['budget'].sum() if 'budget' in closed_won.columns else 0
    conversion_rate = (len(closed_won) / total_leads * 100) if total_leads > 0 else 0
    avg_deal_size = closed_won['budget'].mean() if len(closed_won) > 0 else 0
    
    metrics = {
        'total_leads': total_leads,
        'total_revenue': total_revenue,
        'conversion_rate': conversion_rate,
        'avg_deal_size': avg_deal_size,
        'closed_won_count': len(closed_won)
    }
    
    # Generate insights
    # 1. Lead status distribution
    status_counts = df['leadstatus'].value_counts()
    top_status = status_counts.idxmax() if len(status_counts) > 0 else 'N/A'
    insights.append(f"Most leads are in '{top_status}' stage ({status_counts.get(top_status, 0)} leads).")
    
    # 2. Industry analysis
    if 'industry' in df.columns:
        industry_counts = df['industry'].value_counts()
        top_industry = industry_counts.idxmax() if len(industry_counts) > 0 else 'N/A'
        insights.append(f"Top industry: {top_industry} ({industry_counts.get(top_industry, 0)} leads).")
    
    # 3. Revenue insights
    if len(closed_won) > 0:
        insights.append(f"Total revenue from {len(closed_won)} closed deals: Rp {total_revenue:,.0f}.")
        insights.append(f"Average deal size: Rp {avg_deal_size:,.0f}.")
    
    # 4. Conversion insights
    if conversion_rate >= 40:
        insights.append(f"Excellent conversion rate of {conversion_rate:.1f}% - above industry average!")
    elif conversion_rate >= 25:
        insights.append(f"Good conversion rate of {conversion_rate:.1f}% - room for improvement.")
    else:
        insights.append(f"Conversion rate of {conversion_rate:.1f}% - consider optimizing sales process.")
    
    # 5. Top clients by revenue
    if 'brandname' in closed_won.columns and len(closed_won) > 0:
        top_client = closed_won.loc[closed_won['budget'].idxmax()]
        insights.append(f"Top client by revenue: {top_client['brandname']} (Rp {top_client['budget']:,.0f}).")
    
    # 6. Timeline analysis
    if 'timestamp' in df.columns:
        df['date'] = pd.to_datetime(df['timestamp'], errors='coerce')
        df['week'] = df['date'].dt.isocalendar().week
        
        if len(df) > 0:
            weekly_leads = df.groupby('week').size()
            if len(weekly_leads) > 0:
                best_week = weekly_leads.idxmax()
                insights.append(f"Week {best_week} generated the most leads ({weekly_leads[best_week]} leads).")
    
    return {
        'insights': insights,
        'metrics': metrics,
        'status_distribution': status_counts.to_dict(),
        'industry_distribution': df['industry'].value_counts().to_dict() if 'industry' in df.columns else {}
    }

def create_charts(data, output_dir='charts'):
    """Generate charts for the report"""
    Path(output_dir).mkdir(exist_ok=True)
    
    leads = data.get('leads', [])
    if not leads:
        return []
    
    df = pd.DataFrame(leads)
    chart_files = []
    
    # Set style
    plt.style.use('seaborn-v0_8-darkgrid')
    
    # Chart 1: Lead Status Distribution (Pie Chart)
    fig, ax = plt.subplots(figsize=(10, 8))
    status_counts = df['leadstatus'].value_counts()
    colors_pie = ['#2D75FF', '#FFD700', '#9B59B6', '#FF8C00', '#FF1493', '#2ECC71', '#E74C3C']
    
    wedges, texts, autotexts = ax.pie(
        status_counts.values,
        labels=status_counts.index,
        autopct='%1.1f%%',
        colors=colors_pie[:len(status_counts)]
    )
    
    # Make text white and bold
    for autotext in autotexts:
        autotext.set_color('white')
        autotext.set_fontweight('bold')
    
    ax.set_title('Lead Status Distribution', fontsize=16, fontweight='bold')
    
    chart_path = f'{output_dir}/status_distribution.png'
    plt.savefig(chart_path, dpi=150, bbox_inches='tight')
    plt.close()
    chart_files.append(chart_path)
    
    # Chart 2: Revenue Over Time (if closed won exists)
    closed_won = df[df['leadstatus'] == 'Closed Won']
    if len(closed_won) > 0 and 'timestamp' in closed_won.columns:
        fig, ax = plt.subplots(figsize=(12, 6))
        
        closed_won = closed_won.copy()
        closed_won['date'] = pd.to_datetime(closed_won['timestamp'], errors='coerce')
        closed_won = closed_won.sort_values('date')
        
        # Cumulative revenue
        closed_won['cumulative_revenue'] = closed_won['budget'].cumsum()
        
        ax.plot(closed_won['date'], closed_won['cumulative_revenue'], 
                marker='o', linewidth=2, color='#2D75FF', markersize=6)
        
        ax.fill_between(closed_won['date'], closed_won['cumulative_revenue'], 
                       alpha=0.3, color='#2D75FF')
        
        ax.set_title('Cumulative Revenue Over Time', fontsize=16, fontweight='bold')
        ax.set_xlabel('Date', fontsize=12)
        ax.set_ylabel('Revenue (Rp)', fontsize=12)
        
        # Format y-axis to show in millions
        def millions(x, pos):
            return f'Rp {x/1e6:.1f}M'
        
        ax.yaxis.set_major_formatter(plt.FuncFormatter(millions))
        
        plt.xticks(rotation=45)
        plt.tight_layout()
        
        chart_path = f'{output_dir}/revenue_over_time.png'
        plt.savefig(chart_path, dpi=150, bbox_inches='tight')
        plt.close()
        chart_files.append(chart_path)
    
    # Chart 3: Industry Breakdown (Bar Chart)
    if 'industry' in df.columns:
        fig, ax = plt.subplots(figsize=(12, 6))
        industry_counts = df['industry'].value_counts()
        
        bars = ax.bar(range(len(industry_counts)), industry_counts.values, 
                     color=['#2D75FF', '#9B59B6', '#FF8C00', '#FF1493', '#2ECC71', '#E74C3C', '#FFD700'][:len(industry_counts)])
        
        ax.set_xticks(range(len(industry_counts)))
        ax.set_xticklabels(industry_counts.index, rotation=45, ha='right')
        ax.set_ylabel('Number of Leads', fontsize=12)
        ax.set_title('Leads by Industry', fontsize=16, fontweight='bold')
        
        # Add value labels on bars
        for bar, val in zip(bars, industry_counts.values):
            ax.text(bar.get_x() + bar.get_width()/2., bar.get_height(),
                   f'{val}', ha='center', va='bottom', fontsize=10, fontweight='bold')
        
        plt.tight_layout()
        
        chart_path = f'{output_dir}/industry_breakdown.png'
        plt.savefig(chart_path, dpi=150, bbox_inches='tight')
        plt.close()
        chart_files.append(chart_path)
    
    return chart_files

def format_currency(value):
    """Format number as Indonesian Rupiah"""
    return f"Rp {value:,.0f}"

def generate_pdf_report(data, analysis, chart_files, output_path='report.pdf'):
    """Generate PDF report"""
    
    doc = SimpleDocTemplate(
        output_path,
        pagesize=landscape(A4),
        rightMargin=2*cm,
        leftMargin=2*cm,
        topMargin=2*cm,
        bottomMargin=2*cm
    )
    
    elements = []
    styles = getSampleStyleSheet()
    
    # Custom styles
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=24,
        textColor=HexColor('#2D75FF'),
        spaceAfter=30,
        alignment=TA_CENTER,
        fontName='Helvetica-Bold'
    )
    
    heading_style = ParagraphStyle(
        'CustomHeading',
        parent=styles['Heading2'],
        fontSize=16,
        textColor=HexColor('#1a1a2e'),
        spaceAfter=12,
        spaceBefore=12,
        fontName='Helvetica-Bold'
    )
    
    normal_style = ParagraphStyle(
        'CustomNormal',
        parent=styles['Normal'],
        fontSize=11,
        textColor=HexColor('#333333'),
        spaceAfter=6,
        alignment=TA_JUSTIFY
    )
    
    # Title
    elements.append(Paragraph("SocialBrand 1980", title_style))
    elements.append(Paragraph("Analytics Report", heading_style))
    
    # Date range
    date_range = data.get('dateRange', {}).get('label', 'All time')
    generated_date = datetime.now().strftime('%d %B %Y, %H:%M')
    
    elements.append(Paragraph(f"<b>Date Range:</b> {date_range}", normal_style))
    elements.append(Paragraph(f"<b>Generated:</b> {generated_date}", normal_style))
    elements.append(Spacer(1, 0.5*inch))
    
    # Executive Summary
    elements.append(Paragraph("Executive Summary", heading_style))
    
    metrics = analysis.get('metrics', {})
    insights = analysis.get('insights', [])
    
    summary_text = f"""
    This report provides a comprehensive analysis of {metrics.get('total_leads', 0)} leads 
    with a total revenue of {format_currency(metrics.get('total_revenue', 0))} and 
    conversion rate of {metrics.get('conversion_rate', 0):.1f}%. 
    The average deal size is {format_currency(metrics.get('avg_deal_size', 0))}.
    """
    
    elements.append(Paragraph(summary_text, normal_style))
    elements.append(Spacer(1, 0.3*inch))
    
    # Key Metrics Table
    elements.append(Paragraph("Key Metrics", heading_style))
    
    metrics_data = [
        ['Metric', 'Value'],
        ['Total Leads', str(metrics.get('total_leads', 0))],
        ['Closed Won', str(metrics.get('closed_won_count', 0))],
        ['Total Revenue', format_currency(metrics.get('total_revenue', 0))],
        ['Conversion Rate', f"{metrics.get('conversion_rate', 0):.1f}%"],
        ['Average Deal Size', format_currency(metrics.get('avg_deal_size', 0))]
    ]
    
    metrics_table = Table(metrics_data, colWidths=[3*inch, 2*inch])
    metrics_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), HexColor('#2D75FF')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 12),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
        ('TEXTCOLOR', (0, 1), (-1, -1), colors.black),
        ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 1), (-1, -1), 11),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.beige])
    ]))
    
    elements.append(metrics_table)
    elements.append(Spacer(1, 0.5*inch))
    
    # Charts
    elements.append(Paragraph("Analytics Charts", heading_style))
    
    for chart_file in chart_files:
        if Path(chart_file).exists():
            elements.append(Spacer(1, 0.3*inch))
            img = Image(chart_file, width=6*inch, height=3.5*inch)
            elements.append(img)
            elements.append(Spacer(1, 0.3*inch))
    
    elements.append(PageBreak())
    
    # Data Insights
    elements.append(Paragraph("Key Insights", heading_style))
    
    for insight in insights:
        elements.append(Paragraph(f"• {insight}", normal_style))
        elements.append(Spacer(1, 0.1*inch))
    
    elements.append(Spacer(1, 0.5*inch))
    
    # Detailed Data Table
    elements.append(Paragraph("Detailed Lead Data", heading_style))
    
    leads = data.get('leads', [])[:50]  # Limit to 50 rows for PDF
    
    if leads:
        table_data = [['Brand', 'Status', 'Budget', 'Industry']]
        
        for lead in leads:
            table_data.append([
                lead.get('brandname', 'N/A'),
                lead.get('leadstatus', 'N/A'),
                format_currency(lead.get('budget', 0)) if lead.get('budget') else 'N/A',
                lead.get('industry', 'N/A')
            ])
        
        data_table = Table(table_data, colWidths=[2*inch, 1.5*inch, 1.5*inch, 2*inch])
        data_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), HexColor('#2D75FF')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 11),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.white),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
            ('FONTSIZE', (0, 1), (-1, -1), 9),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.beige])
        ]))
        
        elements.append(data_table)
    
    # Build PDF
    doc.build(elements)
    
    return output_path

def main():
    """Main function"""
    if len(sys.argv) < 2:
        print("Error: No data provided")
        sys.exit(1)
    
    # Parse input data
    try:
        data = json.loads(sys.argv[1])
    except json.JSONDecodeError as e:
        print(f"Error parsing JSON: {e}")
        sys.exit(1)
    
    print("📊 Analyzing data...")
    analysis = analyze_data(data)
    
    print("📈 Generating charts...")
    chart_files = create_charts(data)
    
    print("📄 Generating PDF report...")
    date_str = datetime.now().strftime('%d-%m-%Y')
    output_path = f"socialbrand1980-analytics-report-{date_str}.pdf"
    
    generate_pdf_report(data, analysis, chart_files, output_path)
    
    print(f"✅ Report generated: {output_path}")
    
    # Return output path as JSON
    result = {
        'success': True,
        'file': output_path,
        'charts': chart_files,
        'insights': analysis.get('insights', []),
        'metrics': analysis.get('metrics', {})
    }
    
    print(json.dumps(result))

if __name__ == '__main__':
    main()
