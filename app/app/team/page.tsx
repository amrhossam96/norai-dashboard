import { requireProject } from "@/lib/current";
import { auditLog, listMembers } from "@/lib/control/team";
import { Empty, fmtTs, mono, PageHeader, Panel, td, th } from "@/components/ui/PageHeader";
import { TeamPanel } from "@/components/team/TeamPanel";

export default async function TeamPage() {
  const { user, project } = await requireProject("/app/team");
  const [members, audit] = await Promise.all([listMembers(project.project_id), auditLog(project.project_id)]);

  return (
    <div className="px-[24px] pb-[36px] pt-[26px]">
      <PageHeader eyebrow="Settings" title="Team & audit log">
        Who can open {project.name}, and what has been done to it. The audit log is the backend&apos;s own
        (public.audit_log): config uploads, key changes and project events, whoever made them.
      </PageHeader>

      <div className="mt-[22px] grid gap-[12px] lg:grid-cols-2">
        <TeamPanel members={members} canManage={project.role !== "member"} me={user.user_id} />
        <Panel title="Audit log" aside={<span className={mono}>last 50</span>}>
          {audit.length === 0 ? (
            <Empty>Nothing recorded yet.</Empty>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-line-soft">
                  <th className={th}>When</th>
                  <th className={th}>Action</th>
                  <th className={th}>Resource</th>
                  <th className={th}>Actor</th>
                </tr>
              </thead>
              <tbody>
                {audit.map((a) => (
                  <tr key={a.audit_id} className="border-b border-line-softest last:border-b-0">
                    <td className={`${td} ${mono}`}>{fmtTs(a.created_at)}</td>
                    <td className={td}><span className="chip">{a.action}</span></td>
                    <td className={`${td} ${mono}`}>{a.resource}</td>
                    <td className={`${td} ${mono}`}>{a.actor}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Panel>
      </div>
    </div>
  );
}
