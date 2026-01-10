"use client";

import { useState, useEffect } from "react";

interface InvoiceLinkProps {
  invoiceUrl: string;
}

export function InvoiceLink({ invoiceUrl }: InvoiceLinkProps) {
  const [isValid, setIsValid] = useState<boolean | null>(null);

  useEffect(() => {
    const checkInvoiceAvailability = async () => {
      try {
        const response = await fetch(invoiceUrl, { method: 'HEAD' });
        setIsValid(response.ok);
      } catch {
        setIsValid(false);
      }
    };

    checkInvoiceAvailability();
  }, [invoiceUrl]);

  // Don't show anything while checking or if invalid
  if (isValid === null || isValid === false) {
    return null;
  }

  return (
    <div className="mt-2">
      <a
        href={invoiceUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
      >
        View Invoice
      </a>
    </div>
  );
}
