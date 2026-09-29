export default function Spinner({ size = 'md', className = '' }) {
  const sizes = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-8 h-8' };
  return <div className={`${sizes[size]} border-2 border-border border-t-violet-500 rounded-full animate-spin ${className}`} />;
}

export function PageLoader() {
  return (
    <div className="flex-1 flex items-center justify-center min-h-[50vh]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-border border-t-violet-500 rounded-full animate-spin" />
        <p className="text-sm text-text-faint">Loading…</p>
      </div>
    </div>
  );
}
