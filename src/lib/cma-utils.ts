
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
    
    // --- AI Observations ---
    doc.addPage();
    yPos = addHeader(doc, "AI Observations");
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    const splitText = doc.splitTextToSize(reportData.aiObservations, doc.internal.pageSize.width - 28);
    doc.text(splitText, 14, yPos);

    doc.save(`CMA_Report_${companyBranding.name}_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
};


export const exportToExcel = (reportData: any) => {
    const wb = XLSX.utils.book_new();

    Object.keys(reportData).forEach(key => {
        if (key === 'aiObservations' || key === 'loanDetails') return;

        const sheetData = reportData[key];
        const sheetTitle = sheetData.title.substring(0, 31);
        
        // Add company name and report title to the sheet
        const headerData = [
            [companyBranding.name],
            [sheetTitle],
            [] // Empty row for spacing
        ];

        const ws = XLSX.utils.aoa_to_sheet(headerData);
        XLSX.utils.sheet_add_aoa(ws, [sheetData.headers, ...sheetData.body], { origin: -1 }); // Append data after header

        // Auto-fit column widths
        const colWidths = sheetData.headers.map((_: any, i: number) => {
            let maxWidth = 0;
            const allRows = [sheetData.headers, ...sheetData.body];
            allRows.forEach((row: any[]) => {
                const cellValue = row[i] ? String(row[i]) : "";
                if (cellValue.length > maxWidth) {
                    maxWidth = cellValue.length;
                }
            });
            return { wch: maxWidth + 2 }; // +2 for a little padding
        });
        ws['!cols'] = colWidths;
        
        // Right-align numeric columns
        const dataStartIndex = headerData.length + 1; // Row where data starts
        sheetData.body.forEach((row: any[], r: number) => {
            row.forEach((cell: any, c: number) => {
                // Skip the first column (Particulars)
                if (c > 0 && !isNaN(parseFloat(cell))) {
                     const cellRef = XLSX.utils.encode_cell({ r: r + dataStartIndex, c: c });
                     if(ws[cellRef]) {
                         ws[cellRef].s = { alignment: { horizontal: "right" } };
                     }
                }
            });
        });

        XLSX.utils.book_append_sheet(wb, ws, sheetTitle);
    });
    
    // Add AI Observations to a separate sheet
    const obsWs = XLSX.utils.aoa_to_sheet([
        ["AI Generated Observations"],
        [],
        [reportData.aiObservations]
    ]);
    obsWs['!cols'] = [{ wch: 100 }];
    obsWs['C3'].s = { alignment: { wrapText: true } };
    XLSX.utils.book_append_sheet(wb, obsWs, "AI Observations");

    XLSX.writeFile(wb, `CMA_Report_${companyBranding.name}_${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
};

