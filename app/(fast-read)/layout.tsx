import type { ReactNode } from "react";

export default function FastReadLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="mn">
      <body style={{ margin: 0, background: "#f7f8fc" }}>{children}</body>
    </html>
  );
}
