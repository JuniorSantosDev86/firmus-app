import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type PublicSurfaceShellProps = {
  children: ReactNode;
  width: "quote" | "bio";
  className?: string;
  printBleed?: boolean;
  testId?: string;
};

const widthClassByType: Record<PublicSurfaceShellProps["width"], string> = {
  quote: "firmus-public-shell-quote",
  bio: "firmus-public-shell-bio",
};

export function PublicSurfaceShell({
  children,
  width,
  className,
  printBleed = false,
  testId,
}: PublicSurfaceShellProps) {
  return (
    <main
      className={cn(
        "firmus-public-shell",
        widthClassByType[width],
        printBleed && "print:max-w-none print:px-0 print:py-0",
        className
      )}
      data-testid={testId}
    >
      {children}
    </main>
  );
}
