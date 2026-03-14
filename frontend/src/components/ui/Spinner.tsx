import clsx from "clsx";

export function Spinner({ size = 20, className }: { size?: number; className?: string }) {
  return (
    <div
      className={clsx("border-2 border-accent/30 border-t-accent rounded-full animate-spin", className)}
      style={{ width: size, height: size }}
    />
  );
}
