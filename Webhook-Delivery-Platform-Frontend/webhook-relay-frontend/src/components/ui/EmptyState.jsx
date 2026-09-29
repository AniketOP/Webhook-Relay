export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      {Icon && (
        <div className="w-12 h-12 rounded-xl bg-bg-hover border border-border flex items-center justify-center mb-4">
          <Icon className="w-5 h-5 text-text-faint" strokeWidth={1.5} />
        </div>
      )}
      <p className="text-sm font-medium text-text-secondary mb-1">{title}</p>
      {description && <p className="text-xs text-text-faint max-w-xs">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
