
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
    userId?: string;
    customerId?: string;
    vendorId?: string;
};

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

    const journalVouchers: JournalVoucher[] = journalVouchersSnapshot?.docs.map(doc => ({ id: doc.id, ...doc.data() } as JournalVoucher)) || [];

    const addJournalVoucher = async (voucher: Omit<JournalVoucher, 'id' | 'userId'>) => {
        if (!user) throw new Error("User not authenticated");
        await addDoc(journalVouchersRef, { ...voucher, userId: user.uid });
    };

    return (
        <AccountingContext.Provider value={{ journalVouchers, loading, error, addJournalVoucher }}>
            {children}
        </AccountingContext.Provider>
    );
};
