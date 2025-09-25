
'use server';
/**
 * @fileOverview An AI financial analyst that can answer questions about user's accounting data.
 *
 * - askFinancialAnalyst - A function that streams answers to financial questions.
 * - getFinancialData - A Genkit tool for the AI to fetch financial data.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

// In a real app, these would come from the database based on the authenticated user.
// For this demo, we'll use some sample data.
const sampleData = {
    sales: 120000,
    purchases: 45000,
    overdueInvoices: [
        { customer: "Innovate LLC", amount: 25000, dueDate: "2024-05-20" },
        { customer: "Synergy Corp", amount: 15000, dueDate: "2024-05-15" },
    ],
    expenses: {
        'Rent': 20000,
        'Salaries': 50000,
        'Marketing': 10000,
    }
};

const getFinancialData = ai.defineTool(
  {
    name: 'getFinancialData',
    description: 'Retrieves key financial data for the user. Use this tool to answer any questions about sales, purchases, expenses, or overdue invoices.',
    inputSchema: z.object({
        dataType: z.enum(['overdueInvoices', 'totalSales', 'totalPurchases', 'expensesByCategory']).describe("The type of financial data to retrieve."),
    }),
    outputSchema: z.any(),
  },
  async ({ dataType }) => {
    console.log(`Tool called for: ${dataType}`);
    switch (dataType) {
        case 'overdueInvoices':
            return sampleData.overdueInvoices;
        case 'totalSales':
            return { totalSales: sampleData.sales };
        case 'totalPurchases':
            return { totalPurchases: sampleData.purchases };
        case 'expensesByCategory':
            return sampleData.expenses;
        default:
            return { error: 'Invalid data type requested.' };
    }
  }
);


const financialAnalystPrompt = ai.definePrompt({
  name: 'financialAnalystPrompt',
  system: `You are an expert financial analyst for a company using GSTEase.
    Your role is to answer questions based on the user's financial data.
    Use the provided 'getFinancialData' tool to access the necessary information.
    Be concise, helpful, and provide answers in a clear, easy-to-understand format.
    When presenting lists (like overdue invoices), use bullet points.
    All monetary values are in INR.`,
  tools: [getFinancialData],
});


export async function askFinancialAnalyst(question: string) {
    const { stream, response } = await ai.generate({
        model: 'googleai/gemini-2.5-flash',
        prompt: financialAnalystPrompt,
        messages: [{ role: 'user', content: [{ text: question }] }],
        stream: true,
    });
    
    return new ReadableStream({
        async start(controller) {
            for await (const chunk of stream) {
                controller.enqueue(chunk.text);
            }
            
            const final = await response;
            if (final.finishReason !== 'stop') {
                 controller.enqueue('\n\nAI processing was interrupted.');
            }
            
            controller.close();
        }
    });
}
