
"use client";

import React, { createContext, useState, ReactNode } from 'react';

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
};

type AccountingContextType = {
    journalVouchers: JournalVoucher[];
    addJournalVoucher: (voucher: JournalVoucher) => void;
};

export const AccountingContext = createContext<AccountingContextType | undefined>(undefined);

const initialVouchers: JournalVoucher[] = [
  {
    id: "JV-001",
    date: "2024-05-30",
    narration: "To record monthly office rent.",
    amount: 25000.0,
    lines: [
        { account: '5010', debit: '25000', credit: '0' },
        { account: '1020', debit: '0', credit: '25000' }
    ]
  },
  {
    id: "JV-002",
    date: "2024-05-31",
    narration: "To record depreciation on office equipment for the month.",
    amount: 5000.0,
    lines: [
        { account: '5150', debit: '5000', credit: '0' },
        { account: '1455', debit: '0', credit: '5000' }
    ]
  },
];

export const AccountingProvider = ({ children }: { children: ReactNode }) => {
    const [journalVouchers, setJournalVouchers] = useState<JournalVoucher[]>(initialVouchers);

    const addJournalVoucher = (voucher: JournalVoucher) => {
        setJournalVouchers(prevVouchers => [...prevVouchers, voucher]);
    };

    return (
        <AccountingContext.Provider value={{ journalVouchers, addJournalVoucher }}>
            {children}
        </AccountingContext.Provider>
    );
};
