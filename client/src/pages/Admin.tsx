import DashboardLayout from "@/components/DashboardLayout";
import type { Registration } from "../../../drizzle/schema";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Download, FileDown, Loader2, Pencil, Printer, Search, Trash2, Users, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import { toast } from "sonner";

const groups = ["all", "U7", "U9", "U11", "U13"] as const;

type EditData = {
  id: number;
  playerFirstName: string;
  playerLastName: string;
  ageGroup: "U7" | "U9" | "U11" | "U13";
  guardianName: string;
  guardianPhone: string;
  guardianRelation: string;
  address: string;
  hasHealthIssue: boolean;
  healthDetails: string;
};

function dateLabel(value: Date | string | null | undefined) {
  if (!value) return "—";
  return new Date(value).toLocaleString("fr-FR", { dateStyle: "medium", timeStyle: "short" });
}

function escapeCell(value: unknown) {
  return String(value ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

export default function Admin() {
  const [search, setSearch] = useState("");
  const [ageGroup, setAgeGroup] = useState<(typeof groups)[number]>("all");
  const [editing, setEditing] = useState<EditData | null>(null);
  const query = trpc.registrations.list.useQuery({ search, ageGroup }, { refetchOnWindowFocus: false });
  const utils = trpc.useUtils();
  const deleteMutation = trpc.registrations.delete.useMutation({ onSuccess: () => { toast.success("تم حذف التسجيل"); utils.registrations.list.invalidate(); }, onError: () => toast.error("تعذر حذف التسجيل") });
  const updateMutation = trpc.registrations.update.useMutation({ onSuccess: () => { toast.success("تم تحديث التسجيل"); setEditing(null); utils.registrations.list.invalidate(); }, onError: () => toast.error("تعذر تحديث التسجيل") });
  const registrations = query.data ?? [];
  const total = registrations.length;
  const groupCounts = useMemo(() => groups.slice(1).map((group) => ({ group, count: registrations.filter((item) => item.ageGroup === group).length })), [registrations]);

  useEffect(() => {
    document.title = "Admin · ITTIHAD PRO";
    return () => { document.title = "ITTIHAD PRO – PÔLE OF EXCELLENCE"; };
  }, []);

  const downloadExcel = () => {
    const rows = registrations.map((item) => `<tr><td>${escapeCell(item.registrationNumber)}</td><td>${escapeCell(item.playerFirstName)} ${escapeCell(item.playerLastName)}</td><td>${escapeCell(item.ageGroup)}</td><td>${escapeCell(item.dateOfBirth)}</td><td>${escapeCell(item.placeOfBirth)}</td><td>${escapeCell(item.guardianName)}</td><td>${escapeCell(item.guardianPhone)}</td><td>${escapeCell(dateLabel(item.createdAt))}</td></tr>`).join("");
    const html = `<html><head><meta charset="utf-8"><style>table{border-collapse:collapse;font-family:Arial}td,th{border:1px solid #ccc;padding:8px}th{background:#d9f99d}</style></head><body><table><thead><tr><th>N°</th><th>Joueur</th><th>Catégorie</th><th>Date de naissance</th><th>Lieu</th><th>Parent</th><th>Téléphone</th><th>Inscrit le</th></tr></thead><tbody>${rows}</tbody></table></body></html>`;
    const blob = new Blob(["\ufeff", html], { type: "application/vnd.ms-excel;charset=utf-8" });
    const url = URL.createObjectURL(blob); const anchor = document.createElement("a"); anchor.href = url; anchor.download = `ittihad-pro-inscriptions-${new Date().toISOString().slice(0, 10)}.xls`; anchor.click(); URL.revokeObjectURL(url); toast.success("Fichier Excel téléchargé");
  };

  const printList = () => { window.print(); };
  const startEdit = (item: Registration) => setEditing({ id: item.id, playerFirstName: item.playerFirstName, playerLastName: item.playerLastName, ageGroup: item.ageGroup, guardianName: item.guardianName, guardianPhone: item.guardianPhone, guardianRelation: item.guardianRelation, address: item.address, hasHealthIssue: item.hasHealthIssue, healthDetails: item.healthDetails ?? "" });

  return <DashboardLayout><div className="min-h-screen bg-[#f7f8f4] text-zinc-950" dir="rtl"><div className="mx-auto max-w-[1600px] px-5 py-6 lg:px-10 lg:py-10"><div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="text-xs font-black uppercase tracking-[0.25em] text-lime-700">ITTIHAD PRO / ADMIN</p><h1 className="mt-2 text-4xl font-black tracking-[-0.05em]">سجل التسجيلات</h1><p className="mt-2 text-sm text-zinc-500">تابع طلبات اللاعبين ونظّم ملفات الفئات الشابة.</p></div><Link href="/" className="inline-flex items-center gap-2 self-start rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-bold text-zinc-700 transition hover:border-lime-400 hover:bg-lime-50"><ArrowLeft className="h-4 w-4" /> العودة للموقع</Link></div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5"><div className="rounded-2xl bg-zinc-950 p-5 text-white"><div className="flex items-center justify-between"><span className="text-xs font-bold text-white/50">إجمالي الطلبات</span><Users className="h-5 w-5 text-lime-300" /></div><p className="mt-5 text-4xl font-black">{total}</p><p className="mt-1 text-xs text-white/45">طلبات ظاهرة</p></div>{groupCounts.map(({ group, count }) => <button key={group} onClick={() => setAgeGroup(group)} className={`rounded-2xl border p-5 text-right transition ${ageGroup === group ? "border-lime-400 bg-lime-100" : "border-zinc-200 bg-white hover:border-lime-300"}`}><p className="text-xs font-black text-zinc-500">الفئة</p><p className="mt-2 text-2xl font-black">{group}</p><p className="mt-1 text-xs text-zinc-400">{count} لاعبين</p></button>)}</div>
        <div className="mt-8 rounded-3xl border border-zinc-200 bg-white shadow-[0_16px_60px_rgba(20,30,20,0.05)]"><div className="flex flex-col gap-4 border-b border-zinc-100 p-5 lg:flex-row lg:items-center lg:justify-between"><div className="relative min-w-0 flex-1 lg:max-w-md"><Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" /><Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="ابحث باسم اللاعب أو الولي أو رقم الطلب" className="h-11 rounded-xl pr-10 text-right" /></div><div className="flex flex-wrap items-center gap-2"><select value={ageGroup} onChange={(e) => setAgeGroup(e.target.value as typeof ageGroup)} className="h-11 rounded-xl border border-zinc-200 bg-white px-4 text-sm font-bold outline-none focus:border-lime-500"><option value="all">كل الفئات</option>{groups.slice(1).map((group) => <option key={group} value={group}>{group}</option>)}</select><Button onClick={downloadExcel} variant="outline" className="h-11 rounded-xl bg-white font-bold"><Download className="ml-2 h-4 w-4" /> Excel</Button><Button onClick={printList} variant="outline" className="h-11 rounded-xl bg-white font-bold"><Printer className="ml-2 h-4 w-4" /> طباعة / PDF</Button></div></div>
          <div className="overflow-x-auto">{query.isLoading ? <div className="flex min-h-64 items-center justify-center gap-3 text-sm text-zinc-500"><Loader2 className="h-5 w-5 animate-spin text-lime-600" /> جاري تحميل التسجيلات...</div> : query.error ? <div className="p-12 text-center text-sm text-red-600">لا يمكن الوصول إلى البيانات. تأكد من تسجيل الدخول كمشرف.</div> : registrations.length === 0 ? <div className="p-16 text-center"><FileDown className="mx-auto h-10 w-10 text-zinc-300" /><p className="mt-4 font-black">لا توجد تسجيلات مطابقة</p><p className="mt-1 text-sm text-zinc-400">جرّب تغيير البحث أو الفئة.</p></div> : <table className="w-full min-w-[980px] text-right text-sm"><thead className="bg-[#fafbf7] text-xs font-black text-zinc-400"><tr><th className="px-5 py-4">رقم الطلب</th><th className="px-5 py-4">اللاعب</th><th className="px-5 py-4">الفئة</th><th className="px-5 py-4">الولي / الهاتف</th><th className="px-5 py-4">تاريخ التسجيل</th><th className="px-5 py-4">الإجراءات</th></tr></thead><tbody className="divide-y divide-zinc-100">{registrations.map((item) => <tr key={item.id} className="transition hover:bg-lime-50/40"><td className="px-5 py-4"><span className="rounded-md bg-zinc-100 px-2 py-1 font-mono text-xs font-bold text-zinc-500">{item.registrationNumber}</span></td><td className="px-5 py-4"><p className="font-black">{item.playerTitle} {item.playerFirstName} {item.playerLastName}</p><p className="mt-1 text-xs text-zinc-400">{item.placeOfBirth} · {item.dateOfBirth}</p></td><td className="px-5 py-4"><span className="rounded-full bg-lime-100 px-3 py-1 text-xs font-black text-lime-800">{item.ageGroup}</span></td><td className="px-5 py-4"><p className="font-bold">{item.guardianName}</p><p className="mt-1 text-xs text-zinc-400">{item.guardianPhone}</p></td><td className="px-5 py-4 text-xs text-zinc-500">{dateLabel(item.createdAt)}</td><td className="px-5 py-4"><div className="flex gap-2"><button onClick={() => startEdit(item)} className="rounded-lg border border-zinc-200 p-2 text-zinc-500 transition hover:border-lime-400 hover:bg-lime-50 hover:text-lime-700" title="Modifier"><Pencil className="h-4 w-4" /></button><button onClick={() => { if (window.confirm(`Supprimer l'inscription de ${item.playerFirstName} ${item.playerLastName} ?`)) deleteMutation.mutate({ id: item.id }); }} className="rounded-lg border border-zinc-200 p-2 text-zinc-500 transition hover:border-red-300 hover:bg-red-50 hover:text-red-600" title="Supprimer"><Trash2 className="h-4 w-4" /></button></div></td></tr>)}</tbody></table>}</div></div></div></div>
    <Dialog open={Boolean(editing)} onOpenChange={(open) => !open && setEditing(null)}><DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl" dir="rtl"><DialogHeader className="text-right"><DialogTitle>تعديل بيانات اللاعب</DialogTitle><DialogDescription>حدّث المعلومات الأساسية ثم احفظ التغييرات.</DialogDescription></DialogHeader>{editing && <div className="grid gap-4 py-3 sm:grid-cols-2"><label className="space-y-2 text-sm font-bold">الاسم<input value={editing.playerFirstName} onChange={(e) => setEditing({ ...editing, playerFirstName: e.target.value })} className="mt-2 h-11 w-full rounded-xl border border-zinc-200 px-3 outline-none focus:border-lime-500" /></label><label className="space-y-2 text-sm font-bold">اللقب<input value={editing.playerLastName} onChange={(e) => setEditing({ ...editing, playerLastName: e.target.value })} className="mt-2 h-11 w-full rounded-xl border border-zinc-200 px-3 outline-none focus:border-lime-500" /></label><label className="space-y-2 text-sm font-bold">الفئة<select value={editing.ageGroup} onChange={(e) => setEditing({ ...editing, ageGroup: e.target.value as EditData["ageGroup"] })} className="mt-2 h-11 w-full rounded-xl border border-zinc-200 px-3 outline-none focus:border-lime-500">{groups.slice(1).map((group) => <option key={group} value={group}>{group}</option>)}</select></label><label className="space-y-2 text-sm font-bold">اسم الولي<input value={editing.guardianName} onChange={(e) => setEditing({ ...editing, guardianName: e.target.value })} className="mt-2 h-11 w-full rounded-xl border border-zinc-200 px-3 outline-none focus:border-lime-500" /></label><label className="space-y-2 text-sm font-bold">الهاتف<input value={editing.guardianPhone} onChange={(e) => setEditing({ ...editing, guardianPhone: e.target.value })} className="mt-2 h-11 w-full rounded-xl border border-zinc-200 px-3 outline-none focus:border-lime-500" /></label><label className="space-y-2 text-sm font-bold">صلة القرابة<input value={editing.guardianRelation} onChange={(e) => setEditing({ ...editing, guardianRelation: e.target.value })} className="mt-2 h-11 w-full rounded-xl border border-zinc-200 px-3 outline-none focus:border-lime-500" /></label><label className="space-y-2 text-sm font-bold sm:col-span-2">العنوان<input value={editing.address} onChange={(e) => setEditing({ ...editing, address: e.target.value })} className="mt-2 h-11 w-full rounded-xl border border-zinc-200 px-3 outline-none focus:border-lime-500" /></label><label className="flex items-center gap-2 text-sm font-bold sm:col-span-2"><input type="checkbox" checked={editing.hasHealthIssue} onChange={(e) => setEditing({ ...editing, hasHealthIssue: e.target.checked })} className="h-4 w-4 accent-lime-500" /> لديه مرض أو حساسية</label>{editing.hasHealthIssue && <label className="space-y-2 text-sm font-bold sm:col-span-2">التفاصيل الصحية<textarea value={editing.healthDetails} onChange={(e) => setEditing({ ...editing, healthDetails: e.target.value })} className="mt-2 min-h-24 w-full rounded-xl border border-zinc-200 p-3 outline-none focus:border-lime-500" /></label>}</div>}<DialogFooter><Button variant="outline" className="bg-white" onClick={() => setEditing(null)}>إلغاء</Button><Button className="bg-zinc-950 text-white hover:bg-zinc-800" disabled={updateMutation.isPending} onClick={() => editing && updateMutation.mutate(editing)}>حفظ التغييرات</Button></DialogFooter></DialogContent></Dialog>
  </DashboardLayout>;
}
