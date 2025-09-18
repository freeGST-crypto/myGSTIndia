
"use client";

import React, { createContext, useState, ReactNode } from 'react';
import { db, auth } from '@/lib/firebase';
import { collection, addDoc, query, where } from "firebase/firestore";
import { useCollection } from 'react-firebase-hooks/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';

type JournalLine = {
    account: string;
    debit: string;
    credit: string;
};

type JournalVoucher = {
    id: string;
    date: string;
    narration: string;
    lines: JournalLine[];
    amount: number;
    userId?: string; // Made optional for initial data
    customerId?: string;
    vendorId?: string;
};

// --- START: Sample Transactions for Testing ---
const sampleTransactions: JournalVoucher[] = [
    // 1. Sale to Global Tech Inc.
    {
        id: 'JV-INV-001',
        date: '2024-05-15',
        narration: 'Sale to Global Tech Inc. via Invoice #INV-001',
        amount: 29500,
        lines: [
            { account: '1210', debit: '29500', credit: '0' },
            { account: '4010', debit: '0', credit: '25000' },
            { account: '2110', debit: '0', credit: '4500' },
        ],
        customerId: 'CUST-001',
    },
    // 2. Purchase from Supplier Alpha
    {
        id: 'JV-BILL-101',
        date: '2024-05-16',
        narration: 'Purchase from Supplier Alpha against Bill #101',
        amount: 11800,
        lines: [
            { account: '5050', debit: '10000', credit: '0' },
            { account: '2110', debit: '1800', credit: '0' }, // ITC
            { account: '2010', debit: '0', credit: '11800' },
        ],
        vendorId: 'VEND-001',
    },
    // 3. Cash Receipt from Global Tech Inc.
    {
        id: 'JV-RV-001',
        date: '2024-05-20',
        narration: 'Receipt from Global Tech Inc. against INV-001',
        amount: 29500,
        lines: [
            { account: '1020', debit: '29500', credit: '0' }, // HDFC Bank
            { account: '1210', debit: '0', credit: '29500' }, // Accounts Receivable
        ],
        customerId: 'CUST-001',
    },
    // 4. Cash Payment to Supplier Alpha
    {
        id: 'JV-PV-001',
        date: '2024-05-22',
        narration: 'Payment to Supplier Alpha for Bill #101',
        amount: 11800,
        lines: [
            { account: '2010', debit: '11800', credit: '0' }, // Accounts Payable
            { account: '1020', debit: '0', credit: '11800' }, // HDFC Bank
        ],
        vendorId: 'VEND-001',
    },
    // 5. Credit Note for Sales Return
    {
        id: 'JV-CN-001',
        date: '2024-05-25',
        narration: 'Credit Note issued to Global Tech Inc. against Invoice #INV-001',
        amount: 5900,
        lines: [
            { account: '4010', debit: '5000', credit: '0' }, // Sales Return
            { account: '2110', debit: '900', credit: '0' },  // GST Reversal
            { account: '1210', debit: '0', credit: '5900' }, // Accounts Receivable
        ],
        customerId: 'CUST-001',
    },
    // 6. Debit Note for Purchase Return
    {
        id: 'JV-DN-001',
        date: '2024-05-26',
        narration: 'Debit Note issued to Supplier Alpha against Bill #101',
        amount: 2360,
        lines: [
            { account: '2010', debit: '2360', credit: '0' }, // Accounts Payable
            { account: '5050', debit: '0', credit: '2000' }, // Purchase Return
            { account: '2110', debit: '0', credit: '360' },  // ITC Reversal
        ],
        vendorId: 'VEND-001',
    },
    // 7. Journal Voucher for Rent
     {
        id: 'JV-001',
        date: '2024-05-31',
        narration: 'To record monthly office rent',
        amount: 50000,
        lines: [
            { account: '5010', debit: '50000', credit: '0' }, // Rent Expense
            { account: '1020', debit: '0', credit: '50000' }, // HDFC Bank
        ],
    },
    // 8. Journal Voucher for Depreciation
    {
        id: 'JV-002',
        date: '2024-05-31',
        narration: 'To record monthly depreciation',
        amount: 5000,
        lines: [
            { account: '5150', debit: '5000', credit: '0' },  // Depreciation Expense
            { account: '1455', debit: '0', credit: '5000' }, // Accumulated Depreciation
        ],
    },
];
// --- END: Sample Transactions ---


type AccountingContextType = {
    journalVouchers: JournalVoucher[];
    loading: boolean;
    error: any;
    addJournalVoucher: (voucher: Omit<JournalVoucher, 'id' | 'userId'>) => Promise<void>;
};

export const AccountingContext = createContext<AccountingContextType | undefined>(undefined);

export const AccountingProvider = ({ children }: { children: ReactNode }) => {
    const [user] = useAuthState(auth);

    const journalVouchersRef = collection(db, "journalVouchers");
    const journalVouchersQuery = user ? query(journalVouchersRef, where("userId", "==", user.uid)) : null;
    const [journalVouchersSnapshot, loading, error] = useCollection(journalVouchersQuery);

    // Combine Firestore data with sample data for testing
    const combinedVouchers = [
        ...sampleTransactions,
        ...(journalVouchersSnapshot?.docs.map(doc => ({ id: doc.id, ...doc.data() } as JournalVoucher)) || [])
    ];

    const addJournalVoucher = async (voucher: Omit<JournalVoucher, 'id' | 'userId'>) => {
        if (!user) throw new Error("User not authenticated");
        await addDoc(journalVouchersRef, { ...voucher, userId: user.uid });
    };

    return (
        <AccountingContext.Provider value={{ journalVouchers: combinedVouchers, loading, error, addJournalVoucher }}>
            {children}
        </AccountingContext.Provider>
    );
};
