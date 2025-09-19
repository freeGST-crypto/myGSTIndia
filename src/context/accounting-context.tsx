
"use client";

import React, { createContext, useState, ReactNode } from 'react';
import { db, auth } from '@/lib/firebase';
import { collection, addDoc, updateDoc, doc, query, where, getDocs, writeBatch, setDoc } from "firebase/firestore";
import { useCollection } from 'react-firebase-hooks/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';

type JournalLine = {
    account: string;
    debit: string;
    credit: string;
};

export type JournalVoucher = {
    id: string;
    date: string;
    narration: string;
    lines: JournalLine[];
    amount: number;
    userId?: string;
    customerId?: string;
    vendorId?: string;
    reverses?: string;
};

type AccountingContextType = {
    journalVouchers: JournalVoucher[];
    loading: boolean;
    error: any;
    addJournalVoucher: (voucher: Omit<JournalVoucher, 'userId'>) => Promise<void>;
    updateJournalVoucher: (id: string, voucherData: Partial<Omit<JournalVoucher, 'id' | 'userId'>>) => Promise<void>;
};

export const AccountingContext = createContext<AccountingContextType | undefined>(undefined);

export const AccountingProvider = ({ children }: { children: ReactNode }) => {
    const [user] = useAuthState(auth);

    const journalVouchersRef = collection(db, "journalVouchers");
    const journalVouchersQuery = user ? query(journalVouchersRef, where("userId", "==", user.uid)) : null;
    const [journalVouchersSnapshot, loading, error] = useCollection(journalVouchersQuery);

    const journalVouchers: JournalVoucher[] = journalVouchersSnapshot?.docs.map(doc => doc.data() as JournalVoucher) || [];

    const addJournalVoucher = async (voucher: Omit<JournalVoucher, 'userId'>) => {
        if (!user) throw new Error("User not authenticated");
        
        // Use the provided `id` (e.g., "JV-INV-001") as the document ID in Firestore.
        // Also, ensure the `id` is saved within the document data itself.
        const docRef = doc(db, "journalVouchers", voucher.id);
        await setDoc(docRef, { ...voucher, userId: user.uid, id: voucher.id });
    };
    
    const updateJournalVoucher = async (id: string, voucherData: Partial<Omit<JournalVoucher, 'id' | 'userId'>>) => {
        if (!user) throw new Error("User not authenticated");
        
        // Directly update the document using its known ID.
        const docRef = doc(db, "journalVouchers", id);
        await updateDoc(docRef, voucherData);
    };

    return (
        <AccountingContext.Provider value={{ journalVouchers, loading, error, addJournalVoucher, updateJournalVoucher }}>
            {children}
        </AccountingContext.Provider>
    );
};
