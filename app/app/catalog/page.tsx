import Link from "next/link";
import { requireProject } from "@/lib/current";
import { catalogStats, itemTitle, listItems, PAGE } from "@/lib/control/catalog";
import { Empty, fmtTs, mono, PageHeader, Panel, td, th } from "@/components/ui/PageHeader";
import { SearchBox } from "@/components/ui/SearchBox";
import { Pager } from "@/components/ui/Pager";

export default async function CatalogPage(props: { searchParams: Promise<{ page?: string; q?: string }> }) {
  const { page: pageRaw, q = "" } = await props.searchParams;
  const page = Math.max(1, Number(pageRaw) || 1);
  const { project } = await requireProject("/app/catalog");
  const [stats, items] = await Promise.all([catalogStats(project.project_id), listItems(project.project_id, page, q)]);

  return (
    <div className="px-[24px] pb-[36px] pt-[26px]">
      <PageHeader eyebrow="04 · Serve" title="Catalog" actions={<SearchBox q={q} placeholder="Search item id or fields" />}>
        {stats.total.toLocaleString()} items, {stats.available.toLocaleString()} available. Items arrive through{" "}
        <code className="font-mono text-[12px] text-ink-3">PUT /v1/items</code> or a file import; a deleted item stays
        here as unavailable and is removed from every response.
      </PageHeader>

      <Panel className="mt-[22px]">
        {items.length === 0 ? (
          <Empty>
            {q ? `Nothing matches “${q}”.` : "The catalog is empty. Send items with your secret key: PUT /v1/items with {items:[{item_id, updated_at, fields}]}."}
          </Empty>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-line-soft">
                <th className={th}>Item</th>
                <th className={th}>Fields</th>
                <th className={th}>Available</th>
                <th className={th}>Updated</th>
                <th className={th}>First seen</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it) => {
                const title = itemTitle(it.fields);
                const rest = Object.entries(it.fields).filter(([k, v]) => v !== null && v !== "" && k !== "title" && k !== "name").slice(0, 6);
                return (
                  <tr key={it.item_id} className="border-b border-line-softest last:border-b-0">
                    <td className={td}>
                      {title ? <div className="text-ink">{title}</div> : null}
                      <div className={mono}>{it.item_id}</div>
                    </td>
                    <td className={td}>
                      <div className="flex flex-wrap gap-[4px]">
                        {rest.map(([k, v]) => (
                          <span key={k} className="chip" title={String(v)}>
                            {k} <span className="text-grey-55">{String(v).slice(0, 24)}</span>
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className={td}>{it.available ? "yes" : <span className="text-red-ink">no</span>}</td>
                    <td className={`${td} ${mono}`}>{fmtTs(it.updated_at)}</td>
                    <td className={`${td} ${mono}`}>{fmtTs(it.first_seen_at)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
        <Pager page={page} hasMore={items.length === PAGE} q={q} base="/app/catalog" />
      </Panel>
    </div>
  );
}

