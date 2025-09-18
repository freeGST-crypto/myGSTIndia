
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
    // 3. Credit Note for Sales Return
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
    // 4. Debit Note for Purchase Return
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
];
// --- END: Sample Transactions ---


type AccountingContextType = {
    journalVouchers: JournalVoucher[];
    loading: boolean;
    error: any;
    addJournalVoucher: (voucher: Omit<JournalVoucher, 'userId'>) => Promise<void>;
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

    const addJournalVoucher = async (voucher: Omit<JournalVoucher, 'userId'>) => {
        if (!user) throw new Error("User not authenticated");
        await addDoc(journalVouchersRef, { ...voucher, userId: user.uid });
    };

    return (
        <AccountingContext.Provider value={{ journalVouchers: combinedVouchers, loading, error, addJournalVoucher }}>
            {children}
        </AccountingContext.Provider>
    );
};
