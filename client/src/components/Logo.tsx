export function Logo() {
  return (
    <div className="flex items-center gap-3">
      <div className="h-9 w-9 rounded-lg border border-[color:var(--line)] bg-[color:var(--surface-3)]" />
      <div>
        <div className="text-xs uppercase tracking-[0.4em] text-[color:var(--muted)]">Team</div>
        <div className="text-lg font-semibold uppercase tracking-[0.2em]">Flow</div>
      </div>
    </div>
  );
}
