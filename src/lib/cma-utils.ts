
import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from 'xlsx';
import { format } from "date-fns";

// Extend the jsPDF interface for autoTable
declare module "jspdf" {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

// Mock company data - in a real app, this would come from a context or settings
const companyBranding = {
    name: "GSTEase Solutions Pvt. Ltd.",
    address: "123 Business Avenue, Commerce City, Maharashtra - 400001",
    gstin: "27ABCDE1234F1Z5",
};

const addHeader = (doc: jsPDF, title: string) => {
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text(companyBranding.name, 14, 15);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(companyBranding.address, 14, 22);
    doc.text(`GSTIN: ${companyBranding.gstin}`, 14, 29);

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(title, doc.internal.pageSize.getWidth() / 2, 40, { align: 'center' });
    return 45; // Return Y position after header
};

export const exportToPdf = (reportData: any) => {
    const doc = new jsPDF();
    let yPos: number;

    // --- Operating Statement ---
    yPos = addHeader(doc, "Part I: Operating Statement");
    doc.autoTable({
        head: [reportData.operatingStatement.headers],
        body: reportData.operatingStatement.body,
        startY: yPos,
        headStyles: { fillColor: [41, 128, 185] },
    });
    
    // --- Analysis of Balance Sheet ---
    doc.addPage();
    yPos = addHeader(doc, "Part II: Analysis of Balance Sheet");
    doc.autoTable({
        head: [reportData.balanceSheet.headers],
        body: reportData.balanceSheet.body,
        startY: yPos,
        headStyles: { fillColor: [41, 128, 185] },
    });
    
    // --- Cash Flow Statement ---
    doc.addPage();
    yPos = addHeader(doc, "Part III: Cash Flow Statement");
    doc.autoTable({
        head: [reportData.cashFlow.headers],
        body: reportData.cashFlow.body,
        startY: yPos,
        headStyles: { fillColor: [41, 128, 185] },
    });

    // --- Ratio Analysis ---
    doc.addPage();
    yPos = addHeader(doc, "Part IV: Ratio Analysis");
    doc.autoTable({
        head: [reportData.ratioAnalysis.headers],
        body: reportData.ratioAnalysis.body,
        startY: yPos,
        headStyles: { fillColor: [41, 128, 185] },
    });

    // --- Fund Flow Statement ---
    doc.addPage();
    yPos = addHeader(doc, "Part V: Fund Flow Statement");
    doc.autoTable({
        head: [reportData.fundFlow.headers],
        body: reportData.fundFlow.body,
        startY: yPos,
        headStyles: { fillColor: [41, 128, 185] },
    });

    // --- MPBF Assessment ---
    doc.addPage();
    yPos = addHeader(doc, "Part VI: MPBF Assessment");
    doc.autoTable({
        head: [reportData.mpbf.headers],
        body: reportData.mpbf.body,
        startY: yPos,
        headStyles: { fillColor: [41, 128, 185] },
    });

    // --- Loan Repayment Schedule ---
    if (reportData.repaymentSchedule.body.length > 0) {
        doc.addPage();
        yPos = addHeader(doc, "Part VII: Loan Repayment Schedule");
        doc.autoTable({
            head: [reportData.repaymentSchedule.headers],
            body: reportData.repaymentSchedule.body,
            startY: yPos,
            headStyles: { fillColor: [41, 128, 185] },
        });
    }

    doc.save(`CMA_Report_${companyBranding.name}_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
};


export const exportToExcel = (reportData: any) => {
    const wb = XLSX.utils.book_new();

    const processSheet = (data: any[], sheetName: string) => {
        const ws = XLSX.utils.aoa_to_sheet(data);

        // Auto-fit column widths
        const colWidths = data[0].map((_: any, i: number) => {
            let maxWidth = 0;
            data.forEach((row: any[]) => {
                const cellValue = row[i] ? String(row[i]) : "";
                if (cellValue.length > maxWidth) {
                    maxWidth = cellValue.length;
                }
            });
            return { wch: maxWidth + 2 }; // +2 for a little padding
        });
        ws['!cols'] = colWidths;
        XLSX.utils.book_append_sheet(wb, ws, sheetName);
    }
    
    processSheet([reportData.operatingStatement.headers, ...reportData.operatingStatement.body], "Operating Statement");
    processSheet([reportData.balanceSheet.headers, ...reportData.balanceSheet.body], "Balance Sheet");
    processSheet([reportData.cashFlow.headers, ...reportData.cashFlow.body], "Cash Flow");
    processSheet([reportData.ratioAnalysis.headers, ...reportData.ratioAnalysis.body], "Ratio Analysis");
    processSheet([reportData.fundFlow.headers, ...reportData.fundFlow.body], "Fund Flow");
    processSheet([reportData.mpbf.headers, ...reportData.mpbf.body], "MPBF");
    if(reportData.repaymentSchedule.body.length > 0) {
        processSheet([reportData.repaymentSchedule.headers, ...reportData.repaymentSchedule.body], "Repayment Schedule");
    }

    XLSX.writeFile(wb, `CMA_Report_${companyBranding.name}_${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
};
