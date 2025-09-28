
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

const addHeaderToElement = (title: string): HTMLDivElement => {
    const headerDiv = document.createElement('div');
    headerDiv.innerHTML = `
        <div style="padding: 20px; font-family: sans-serif; color: #000;">
            <h1 style="font-size: 16px; font-weight: bold;">${companyBranding.name}</h1>
            <p style="font-size: 10px;">${companyBranding.address}</p>
            <p style="font-size: 10px;">GSTIN: ${companyBranding.gstin}</p>
            <h2 style="font-size: 14px; font-weight: bold; text-align: center; margin-top: 20px;">${title}</h2>
        </div>
    `;
    return headerDiv;
};

const createTableElement = (headers: string[], body: (string | number)[][]): HTMLTableElement => {
    const table = document.createElement('table');
    table.style.width = '100%';
    table.style.borderCollapse = 'collapse';
    table.style.fontSize = '10px';
    const thead = table.createTHead();
    const headerRow = thead.insertRow();
    headers.forEach(headerText => {
        const th = document.createElement('th');
        th.textContent = headerText;
        th.style.border = '1px solid #ddd';
        th.style.padding = '4px';
        th.style.textAlign = 'left';
        th.style.backgroundColor = '#f2f2f2';
        headerRow.appendChild(th);
    });

    const tbody = table.createTBody();
    body.forEach(rowData => {
        const row = tbody.insertRow();
        rowData.forEach((cellData, cellIndex) => {
            const cell = row.insertCell();
            cell.textContent = String(cellData);
            cell.style.border = '1px solid #ddd';
            cell.style.padding = '4px';
            if (cellIndex > 0) {
              cell.style.textAlign = 'right';
            }
        });
    });
    return table;
};

export const exportToPdf = async (reportData: any) => {
    const doc = new jsPDF('p', 'pt', 'a4');
    const container = document.createElement('div');
    container.style.width = '210mm'; // A4 width

    const addSection = (title: string, data: { headers: string[], body: (string | number)[][] }) => {
        const sectionDiv = document.createElement('div');
        sectionDiv.style.breakBefore = 'page';
        sectionDiv.appendChild(addHeader(doc, title));
        sectionDiv.appendChild(createTableElement(data.headers, data.body));
        container.appendChild(sectionDiv);
    };

    addSection("Part I: Operating Statement", reportData.operatingStatement);
    addSection("Part II: Analysis of Balance Sheet", reportData.balanceSheet);
    addSection("Part III: Cash Flow Statement", reportData.cashFlow);
    addSection("Part IV: Ratio Analysis", reportData.ratioAnalysis);
    addSection("Part V: Fund Flow Statement", reportData.fundFlow);
    addSection("Part VI: MPBF Assessment", reportData.mpbf);
    if (reportData.repaymentSchedule.body.length > 0) {
        addSection("Part VII: Loan Repayment Schedule", reportData.repaymentSchedule);
    }
    
    // Temporarily append to body to render for html2canvas
    document.body.appendChild(container);
    
    await doc.html(container, {
        callback: function (doc) {
            doc.save(`CMA_Report_${companyBranding.name}_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
        },
        x: 10,
        y: 10,
        width: 190, // A4 width in mm approx
        windowWidth: container.scrollWidth,
        autoPaging: 'slice',
    });

    document.body.removeChild(container);
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
