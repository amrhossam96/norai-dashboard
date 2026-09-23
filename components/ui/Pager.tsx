import Link from "next/link";
import { mono } from "@/components/ui/PageHeader";

export function Pager({ page, hasMore, q, base }: { page: number; hasMore: boolean; q: string; base: string }) {
  const link = (p: number) => `${base}?page=${p}${q ? `&q=${encodeURIComponent(q)}` : ""}`;
  if (page === 1 && !hasMore) return null;
  return (
    <div className="flex items-center justify-between border-t border-line-soft px-[18px] py-[10px]">
      {page > 1 ? <Link href={link(page - 1)} className="font-sans text-[12px] text-ink-3 hover:text-ink">← Previous</Link> : <span />}
      <span className={mono}>page {page}</span>
      {hasMore ? <Link href={link(page + 1)} className="font-sans text-[12px] text-ink-3 hover:text-ink">Next →</Link> : <span />}
    </div>
  );
}
