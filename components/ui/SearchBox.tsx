/** A GET form: the page re-renders with ?q= so the URL stays shareable. */
export function SearchBox({ q, placeholder }: { q: string; placeholder: string }) {
  return (
    <form method="get" className="flex items-center gap-[6px]">
      <input
        name="q"
        defaultValue={q}
        placeholder={placeholder}
        className="w-[260px] rounded-[7px] border border-line bg-surface px-[10px] py-[7px] font-sans text-[12px] text-ink outline-none placeholder:text-grey-60 focus:border-grey-70"
      />
      <button type="submit" className="cta cta-ghost cta-sm">Search</button>
    </form>
  );
}
