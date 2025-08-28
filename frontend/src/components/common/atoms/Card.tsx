import * as React from "react";

export const Card: React.FC<React.PropsWithChildren<{ className?: string }>> = ({ className = "", children }) => (
  <div className={`bg-white rounded-lg shadow ${className}`}>{children}</div>
);
