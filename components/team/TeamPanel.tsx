"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { postJson } from "@/lib/api/client";
import type { Member } from "@/lib/api/types";
import { fmtTs, mono, Panel, td, th } from "@/components/ui/PageHeader";

export function TeamPanel({ members, canManage, me }: { members: Member[]; canManage: boolean; me: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"admin" | "member">("member");
  const [pending, setPending] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (pending) return;
    setPending(true);
    setMsg(null);
    const res = await postJson<Member>("/api/team", { email, role });
    setPending(false);
    if (res.status === "success") {
      setEmail("");
      router.refresh();
    } else setMsg(res.message);
  }

  async function remove(m: Member) {
    if (!window.confirm(`Remove ${m.email} from this project?`)) return;
    await postJson("/api/team", { user_id: m.user_id }, "DELETE");
    router.refresh();
  }

  return (
    <Panel title="People">
      <table className="w-full">
        <thead>
          <tr className="border-b border-line-soft">
            <th className={th}>Person</th>
            <th className={th}>Role</th>
            <th className={th}>Added</th>
            <th className={th}></th>
          </tr>
        </thead>
        <tbody>
          {members.map((m) => (
            <tr key={m.user_id} className="border-b border-line-softest last:border-b-0">
              <td className={td}>
                <div className="text-ink">{[m.first_name, m.last_name].filter(Boolean).join(" ") || m.email}{m.user_id === me ? <span className="text-grey-55"> (you)</span> : null}</div>
                <div className={mono}>{m.email}</div>
              </td>
              <td className={td}><span className="chip">{m.role}</span></td>
              <td className={`${td} ${mono}`}>{fmtTs(m.created_at)}</td>
              <td className={`${td} text-right`}>
                {canManage && m.role !== "owner" && m.user_id !== me ? (
                  <button type="button" onClick={() => remove(m)} className="font-sans text-[12px] text-ink-3 hover:text-red-ink">Remove</button>
                ) : null}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {canManage ? (
        <form onSubmit={add} className="flex items-center gap-[8px] border-t border-line-soft px-[18px] py-[12px]">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="colleague@company.com (must have a dashboard account)"
            className="flex-1 rounded-[7px] border border-line bg-shell px-[10px] py-[7px] font-sans text-[12.5px] text-ink outline-none placeholder:text-grey-60 focus:border-grey-70"
          />
          <select value={role} onChange={(e) => setRole(e.target.value as "member")} className="rounded-[7px] border border-line bg-shell px-[10px] py-[7px] font-sans text-[12.5px] text-ink outline-none">
            <option value="member">member</option>
            <option value="admin">admin</option>
          </select>
          <button type="submit" disabled={pending || !email} className="cta cta-primary cta-sm">{pending ? "Adding…" : "Add"}</button>
        </form>
      ) : null}
      {msg ? <div className="border-t border-line-soft px-[18px] py-[10px] font-sans text-[12.5px] text-red-ink">{msg}</div> : null}
    </Panel>
  );
}
