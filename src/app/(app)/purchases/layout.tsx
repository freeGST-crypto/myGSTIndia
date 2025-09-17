
import React from 'react';

export default function PurchaseLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <div className="mx-auto w-full max-w-7xl">{children}</div>;
}
