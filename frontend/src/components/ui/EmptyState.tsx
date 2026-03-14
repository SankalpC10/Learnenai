import type { ReactNode, ElementType } from "react";

export function EmptyState({ icon: Icon, title, description, action }: {
  icon: ElementType;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="mb-4 text-text-secondary">
        <Icon size={48} strokeWidth={1} />
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-text-secondary text-sm max-w-md mb-6">{description}</p>
      {action}
    </div>
  );
}
