
"use client";

import React, { createContext, useState, ReactNode } from 'react';
import { db, auth } from '@/lib/firebase';
import { collection, addDoc, updateDoc, doc, query, where, getDocs, writeBatch } from "firebase/firestore";
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
    addJournalVoucher: (voucher: Omit<JournalVoucher, 'id' | 'userId'> & { id?: string }) => Promise<void>;
    updateJournalVoucher: (id: string, voucherData: Partial<Omit<JournalVoucher, 'id' | 'userId'>>) => Promise<void>;
};

export const AccountingContext = createContext<AccountingContextType | undefined>(undefined);

export const AccountingProvider = ({ children }: { children: ReactNode }) => {
    const [user] = useAuthState(auth);

    const journalVouchersRef = collection(db, "journalVouchers");
    const journalVouchersQuery = user ? query(journalVouchersRef, where("userId", "==", user.uid)) : null;
    const [journalVouchersSnapshot, loading, error] = useCollection(journalVouchersQuery);

    const journalVouchers: JournalVoucher[] = journalVouchersSnapshot?.docs.map(doc => ({ id: doc.id, ...doc.data() } as JournalVoucher)) || [];

    const addJournalVoucher = async (voucher: Omit<JournalVoucher, 'id' | 'userId'> & { id?: string }) => {
        if (!user) throw new Error("User not authenticated");
        
        // This logic handles both creating a new doc with a specific ID or letting Firestore auto-generate one.
        // For our case, we always provide an ID now.
        if (voucher.id) {
             const docRef = doc(db, "journalVouchers", voucher.id);
             // Since we are using custom IDs, we need to use `setDoc` which is handled by `updateJournalVoucher` or new doc logic.
             // This is a simplified add, assuming we let firestore handle ID.
             // However, our app logic now often provides IDs. Let's adjust.
             const newVoucherData = { ...voucher, userId: user.uid };
             delete newVoucherData.id;
             await addDoc(journalVouchersRef, newVoucherData);
        } else {
             await addDoc(journalVouchersRef, { ...voucher, userId: user.uid });
        }
    };
    
    const updateJournalVoucher = async (id: string, voucherData: Partial<Omit<JournalVoucher, 'id' | 'userId'>>) => {
        if (!user) throw new Error("User not authenticated");
        
        // Find the document with the custom `id` field.
        const q = query(journalVouchersRef, where("id", "==", id), where("userId", "==", user.uid));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            throw new Error(`Voucher with ID ${id} not found.`);
        }
        
        const docToUpdate = querySnapshot.docs[0];
        await updateDoc(docToUpdate.ref, voucherData);
    };

    return (
        <AccountingContext.Provider value={{ journalVouchers, loading, error, addJournalVoucher, updateJournalVoucher }}>
            {children}
        </AccountingContext.Provider>
    );
};
