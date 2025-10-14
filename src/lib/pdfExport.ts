import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export const generateInvestmentReport = async (analysis: any, elementId: string) => {
  const pdf = new jsPDF("p", "mm", "a4");
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 20;

  // Add header
  pdf.setFillColor(59, 130, 246); // Primary color
  pdf.rect(0, 0, pageWidth, 40, "F");
  
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(24);
  pdf.text("Investment Analysis Report", margin, 25);
  
  pdf.setFontSize(10);
  pdf.text(`Generated on ${new Date().toLocaleDateString()}`, margin, 33);

  // Add property details
  let yPos = 55;
  pdf.setTextColor(0, 0, 0);
  pdf.setFontSize(16);
  pdf.text("Investment Summary", margin, yPos);
  
  yPos += 10;
  pdf.setFontSize(11);
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const summaryData = [
    { label: "Purchase Price", value: formatCurrency(analysis.purchase_price) },
    { label: "Down Payment", value: `${analysis.down_payment_percent}%` },
    { label: "Loan Interest Rate", value: `${analysis.loan_interest_rate}%` },
    { label: "Loan Term", value: `${analysis.loan_term_years} years` },
    { label: "Annual Rental Income", value: formatCurrency(analysis.annual_rental_income) },
    { label: "Vacancy Rate", value: `${analysis.vacancy_rate}%` },
    { label: "Operating Expenses", value: formatCurrency(analysis.annual_operating_expenses) },
    { label: "Holding Period", value: `${analysis.holding_period_years} years` },
  ];

  summaryData.forEach((item) => {
    pdf.text(`${item.label}:`, margin, yPos);
    pdf.text(item.value, pageWidth - margin - 40, yPos, { align: "right" });
    yPos += 7;
  });

  // Add ROI metrics
  yPos += 5;
  pdf.setFontSize(16);
  pdf.text("Key Financial Metrics", margin, yPos);
  
  yPos += 10;
  pdf.setFontSize(12);
  pdf.setFillColor(240, 240, 240);
  
  const metrics = [
    { label: "Internal Rate of Return (IRR)", value: `${analysis.irr?.toFixed(2)}%` },
    { label: "Net Present Value (NPV)", value: formatCurrency(analysis.npv) },
    { label: "Capitalization Rate", value: `${analysis.cap_rate?.toFixed(2)}%` },
    { label: "Cash on Cash Return", value: `${analysis.cash_on_cash_return?.toFixed(2)}%` },
    { label: "Payback Period", value: `${analysis.payback_period_years?.toFixed(1)} years` },
  ];

  metrics.forEach((metric, index) => {
    if (yPos > pageHeight - 30) {
      pdf.addPage();
      yPos = margin;
    }
    
    pdf.rect(margin, yPos - 5, pageWidth - 2 * margin, 10, "F");
    pdf.setTextColor(0, 0, 0);
    pdf.text(metric.label, margin + 5, yPos);
    pdf.setFont(undefined, "bold");
    pdf.text(metric.value, pageWidth - margin - 5, yPos, { align: "right" });
    pdf.setFont(undefined, "normal");
    yPos += 12;
  });

  // Add risk assessment
  yPos += 5;
  if (yPos > pageHeight - 50) {
    pdf.addPage();
    yPos = margin;
  }
  
  pdf.setFontSize(16);
  pdf.text("Risk Assessment", margin, yPos);
  yPos += 10;
  
  pdf.setFontSize(11);
  const riskColor = analysis.risk_score > 60 ? [220, 38, 38] : 
                    analysis.risk_score > 40 ? [234, 179, 8] : [34, 197, 94];
  
  pdf.setFillColor(riskColor[0], riskColor[1], riskColor[2]);
  pdf.rect(margin, yPos - 5, (analysis.risk_score / 100) * (pageWidth - 2 * margin), 8, "F");
  pdf.text(`Risk Score: ${analysis.risk_score}/100`, margin, yPos);
  
  yPos += 15;

  // Add AI insights on new page
  pdf.addPage();
  yPos = margin;
  
  pdf.setFontSize(16);
  pdf.text("AI-Generated Insights", margin, yPos);
  yPos += 10;
  
  pdf.setFontSize(11);
  
  // Summary
  pdf.setFont(undefined, "bold");
  pdf.text("Investment Summary:", margin, yPos);
  yPos += 7;
  pdf.setFont(undefined, "normal");
  
  const summaryLines = pdf.splitTextToSize(analysis.ai_summary || "No summary available", pageWidth - 2 * margin);
  summaryLines.forEach((line: string) => {
    if (yPos > pageHeight - 30) {
      pdf.addPage();
      yPos = margin;
    }
    pdf.text(line, margin, yPos);
    yPos += 6;
  });
  
  yPos += 5;
  
  // Recommendations
  if (yPos > pageHeight - 40) {
    pdf.addPage();
    yPos = margin;
  }
  
  pdf.setFont(undefined, "bold");
  pdf.text("Recommendations:", margin, yPos);
  yPos += 7;
  pdf.setFont(undefined, "normal");
  
  const recommendationLines = pdf.splitTextToSize(analysis.ai_recommendations || "No recommendations available", pageWidth - 2 * margin);
  recommendationLines.forEach((line: string) => {
    if (yPos > pageHeight - 30) {
      pdf.addPage();
      yPos = margin;
    }
    pdf.text(line, margin, yPos);
    yPos += 6;
  });

  // Capture charts if element provided
  const element = document.getElementById(elementId);
  if (element) {
    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        logging: false,
        useCORS: true,
      });
      
      const imgData = canvas.toDataURL("image/png");
      pdf.addPage();
      
      const imgWidth = pageWidth - 2 * margin;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      pdf.text("Visual Analysis", margin, margin);
      pdf.addImage(imgData, "PNG", margin, margin + 10, imgWidth, Math.min(imgHeight, pageHeight - 2 * margin - 10));
    } catch (error) {
      console.error("Error capturing charts:", error);
    }
  }

  // Add footer
  const totalPages = pdf.internal.pages.length - 1;
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i);
    pdf.setFontSize(8);
    pdf.setTextColor(128, 128, 128);
    pdf.text(
      `Page ${i} of ${totalPages} | PlansureAI Investment Analysis`,
      pageWidth / 2,
      pageHeight - 10,
      { align: "center" }
    );
  }

  // Save the PDF
  const fileName = `Investment_Analysis_${new Date().toISOString().split('T')[0]}.pdf`;
  pdf.save(fileName);
};
