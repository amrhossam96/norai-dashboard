import { requireProject } from "@/lib/current";
import { catalogStats, listUsers, PAGE } from "@/lib/control/catalog";
import { Empty, fmtTs, mono, PageHeader, Panel, td, th } from "@/components/ui/PageHeader";
import { SearchBox } from "@/components/ui/SearchBox";
import { Pager } from "@/components/ui/Pager";

export default async function UsersPage(props: { searchParams: Promise<{ page?: string; q?: string }> }) {
  const { page: pageRaw, q = "" } = await props.searchParams;
  const page = Math.max(1, Number(pageRaw) || 1);
  const { project } = await requireProject("/app/users");
  const [stats, users] = await Promise.all([catalogStats(project.project_id), listUsers(project.project_id, page, q)]);

  return (
    <div className="px-[24px] pb-[36px] pt-[26px]">
      <PageHeader eyebrow="Inspect" title="Users" actions={<SearchBox q={q} placeholder="Search user id" />}>
        {stats.users.toLocaleString()} known users with attributes, sent through{" "}
        <code className="font-mono text-[12px] text-ink-3">PUT /v1/users</code>. Ids are opaque: norai never parses
        them. Anonymous visitors are not listed here; they exist only as events.
      </PageHeader>

      <Panel className="mt-[22px] max-w-[900px]">
        {users.length === 0 ? (
          <Empty>{q ? `No user id matches “${q}”.` : "No user attributes have been sent. Recommendations still work for anonymous and cold visitors."}</Empty>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-line-soft">
                <th className={th}>User</th>
                <th className={th}>Attributes</th>
                <th className={th}>Updated</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.user_id} className="border-b border-line-softest last:border-b-0">
                  <td className={`${td} font-mono text-ink`}>{u.user_id}</td>
                  <td className={td}>
                    <div className="flex flex-wrap gap-[4px]">
                      {Object.entries(u.attributes).slice(0, 8).map(([k, v]) => (
                        <span key={k} className="chip">{k} <span className="text-grey-55">{String(v).slice(0, 24)}</span></span>
                      ))}
                    </div>
                  </td>
                  <td className={`${td} ${mono}`}>{fmtTs(u.updated_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <Pager page={page} hasMore={users.length === PAGE} q={q} base="/app/users" />
      </Panel>
    </div>
  );
}
