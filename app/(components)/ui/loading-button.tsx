"use client";

import { useFormLoading } from "@/lib/hooks/useFormLoading";
import { Button, ButtonProps } from "./button";

interface LoadingButtonProps extends Omit<ButtonProps, 'loading'> {
  action?: () => void | Promise<void>;
  loadingText?: string;
}

export function LoadingButton({ 
  action, 
  loadingText = "Loading...", 
  onClick,
  children,
  ...props 
}: LoadingButtonProps) {
  const { isLoading, executeAction } = useFormLoading();

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (action) {
      e.preventDefault();
      executeAction(action);
    } else if (onClick) {
      onClick(e);
    }
  };

  return (
    <Button
      {...props}
      loading={isLoading}
      loadingText={loadingText}
      onClick={handleClick}
      disabled={props.disabled || isLoading}
    >
      {children}
    </Button>
  );
}
