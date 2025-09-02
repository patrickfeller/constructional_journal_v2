"use client";

import { useTransition } from "react";

export function useFormLoading() {
  const [isPending, startTransition] = useTransition();

  const executeAction = (action: () => void | Promise<void>) => {
    startTransition(() => {
      if (action) {
        // If action returns a promise, wait for it
        const result = action();
        if (result instanceof Promise) {
          result.catch(console.error);
        }
      }
    });
  };

  return {
    isLoading: isPending,
    executeAction
  };
}
