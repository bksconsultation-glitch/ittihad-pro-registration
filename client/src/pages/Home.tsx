import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import {
  ArrowDown,
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronDown,
  Facebook,
  Instagram,
  MapPin,
  Menu,
  Phone,
  ShieldCheck,
  Sparkles,
  Trophy,
  Users,
  X,
} from "lucide-react";
import { FormEvent, useState } from "react";
import { Link } from "wouter";
import { toast } from "sonner";

const ageGroups = [
  { id: "U7", years: "2019 — 2020", age: "5–6 ans", accent: "from-lime-300 to-lime-400" },
  { id: "U9", years: "2017 — 2018", age: "7–8 ans", accent: "from-emerald-300 to-lime-300" },
  { id: "U11", years: "2015 — 2016", age: "9–10 ans", accent: "from-green-300 to-emerald-300" },
  { id: "U13", years: "2013 — 2014", age: "11–12 ans", accent: "from-lime-200 to-green-300" },
] as const;

const initialForm = {
  playerTitle: "M.",
  playerFirstName: "",
  playerLastName: "",
  dateOfBirth: "",
  placeOfBirth: "",
  ageGroup: "U7" as "U7" | "U9" | "U11" | "U13",
  address: "",
  guardianName: "",
  guardianRelation: "Père",
  guardianPhone: "",
  guardianPhone2: "",
  hasHealthIssue: false,
  healthDetails: "",
  birthCertificate: false,
  medicalCertificate: false,
  photos: false,
  guardianIdCopy: false,
};

type FormState = typeof initialForm;

function Field({ label, required = true, children, hint }: { label: string; required?: boolean; children: React.ReactNode; hint?: string }) {
  return (
    <label className="space-y-2 text-right" dir="rtl">
      <span className="flex items-center justify-between gap-2 text-sm font-bold text-zinc-800">
        <span>{label}{required && <b className="ml-1 text-lime-600">*</b>}</span>
        {hint && <span className="text-xs font-medium text-zinc-400">{hint}</span>}
      </span>
      {children}
    </label>
  );
}

function Input({ className = "", ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`h-12 w-full rounded-xl border border-zinc-200 bg-white px-4 text-right text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-lime-500 focus:ring-4 focus:ring-lime-100 ${className}`} />;
}

function Select({ className = "", ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={`h-12 w-full appearance-none rounded-xl border border-zinc-200 bg-white px-4 text-right text-sm text-zinc-900 outline-none transition focus:border-lime-500 focus:ring-4 focus:ring-lime-100 ${className}`} />;
}

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [form, setForm] = useState<FormState>(initialForm);
  const [submittedNumber, setSubmittedNumber] = useState<string | null>(null);
  const { user } = useAuth();
  const createRegistration = trpc.registrations.create.useMutation({
    onSuccess: (registration) => {
      setSubmittedNumber(registration?.registrationNumber ?? null);
      setForm(initialForm);
      toast.success(registration?.sheetSynced ? "تم استلام التسجيل وإرساله إلى Google Sheets" : "تم استلام التسجيل، وسيتم إعادة مزامنته لاحقًا");
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    onError: () => toast.error("Impossible d'envoyer la demande. Vérifiez les champs et réessayez."),
  });

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => setForm((current) => ({ ...current, [key]: value }));
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    createRegistration.mutate(form);
  };

  return (
    <div className="min-h-screen overflow-hidden bg-[#f8f8f4] text-zinc-950">
      <header className="absolute inset-x-0 top-0 z-50">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 lg:px-8">
          <a href="#accueil" className="flex items-center gap-3 text-white">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-lime-400 text-xl font-black text-zinc-950 shadow-[0_0_0_5px_rgba(190,242,100,0.16)]">IP</div>
            <div className="leading-none"><p className="text-[11px] font-black uppercase tracking-[0.24em] text-lime-300">ITTIHAD PRO</p><p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/65">Pôle d’excellence</p></div>
          </a>
          <nav className="hidden items-center gap-8 text-sm font-bold text-white/80 lg:flex">
            <a className="transition hover:text-lime-300" href="#pole">Le pôle</a>
            <a className="transition hover:text-lime-300" href="#categories">Catégories</a>
            <a className="transition hover:text-lime-300" href="#tarifs">Tarifs</a>
            <a className="transition hover:text-lime-300" href="#contact">Contact</a>
          </nav>
          <div className="hidden items-center gap-3 lg:flex">
            {user?.role === "admin" && <Link href="/admin" className="rounded-full border border-white/20 px-4 py-2 text-xs font-bold text-white transition hover:bg-white/10">Espace admin</Link>}
            <a href="#inscription" className="rounded-full bg-lime-400 px-5 py-3 text-xs font-black uppercase tracking-[0.12em] text-zinc-950 transition hover:bg-lime-300">Inscrire mon enfant <ArrowRight className="ml-2 inline h-4 w-4" /></a>
          </div>
          <button className="rounded-xl border border-white/20 p-2 text-white lg:hidden" onClick={() => setMenuOpen((open) => !open)} aria-label="Ouvrir le menu">{menuOpen ? <X /> : <Menu />}</button>
        </div>
        {menuOpen && <div className="mx-4 rounded-2xl border border-white/10 bg-zinc-950/95 p-4 text-right text-sm font-bold text-white shadow-2xl lg:hidden" dir="rtl"><div className="flex flex-col gap-4"><a href="#pole" onClick={() => setMenuOpen(false)}>Le pôle</a><a href="#categories" onClick={() => setMenuOpen(false)}>Catégories</a><a href="#tarifs" onClick={() => setMenuOpen(false)}>Tarifs</a><a href="#inscription" onClick={() => setMenuOpen(false)} className="rounded-xl bg-lime-400 px-4 py-3 text-center text-zinc-950">Inscription</a></div></div>}
      </header>

      {submittedNumber && <div className="fixed inset-x-4 top-24 z-[60] mx-auto max-w-xl animate-in slide-in-from-top-4 rounded-2xl border border-lime-300 bg-zinc-950 p-5 text-white shadow-2xl duration-300" dir="rtl"><div className="flex items-start gap-4"><div className="rounded-full bg-lime-400 p-2 text-zinc-950"><CheckCircle2 className="h-6 w-6" /></div><div className="flex-1"><p className="text-lg font-black">تم استلام طلب التسجيل بنجاح</p><p className="mt-1 text-sm leading-6 text-white/70">سيتم التواصل معكم في أقرب وقت لتأكيد التسجيل. رقم الطلب: <b className="text-lime-300">{submittedNumber}</b></p></div><button onClick={() => setSubmittedNumber(null)} className="text-white/50 hover:text-white"><X className="h-5 w-5" /></button></div></div>}

      <main>
        <section id="accueil" className="relative isolate flex min-h-[720px] items-end overflow-hidden bg-zinc-950 pb-20 pt-36 lg:min-h-[800px] lg:pb-28">
          <img src="/manus-storage/training-banner_05f2216a.webp" alt="Jeunes joueurs en entraînement" className="absolute inset-0 -z-20 h-full w-full object-cover object-center opacity-45" />
          <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(9,11,9,0.96)_0%,rgba(9,11,9,0.78)_42%,rgba(9,11,9,0.35)_100%)]" />
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_82%_20%,rgba(190,242,100,0.2),transparent_26%)]" />
          <div className="mx-auto grid w-full max-w-7xl items-end gap-12 px-5 lg:grid-cols-[1.1fr_0.9fr] lg:px-8">
            <div className="max-w-3xl" dir="rtl">
              <p className="mb-5 flex items-center gap-3 text-xs font-black uppercase tracking-[0.28em] text-lime-300"><span className="h-px w-10 bg-lime-300" /> التكوين الرياضي المحترف</p>
              <h1 className="max-w-3xl text-5xl font-black leading-[0.98] tracking-[-0.06em] text-white sm:text-7xl lg:text-[92px]">نصنع لاعباً<br /><span className="text-lime-300">يصنع الفرق.</span></h1>
              <p className="mt-7 max-w-xl text-right text-lg leading-8 text-white/70">اتحاد برو — قطب التميز. أكاديمية رياضية تجمع بين الأداء، التعليم والأخلاق لتكوين جيل جديد من لاعبي كرة القدم في عين اسمارة.</p>
              <div className="mt-9 flex flex-wrap justify-end gap-3"><a href="#inscription" className="rounded-full bg-lime-400 px-6 py-4 text-sm font-black text-zinc-950 transition hover:-translate-y-0.5 hover:bg-lime-300">ابدأ التسجيل <ArrowRight className="ml-2 inline h-4 w-4" /></a><a href="#pole" className="rounded-full border border-white/20 px-6 py-4 text-sm font-bold text-white transition hover:bg-white/10">اكتشف القطب <ArrowDown className="ml-2 inline h-4 w-4" /></a></div>
              <div className="mt-14 flex flex-wrap justify-end gap-8 text-right"><div><p className="text-3xl font-black text-white">2025</p><p className="mt-1 text-xs font-bold uppercase tracking-widest text-white/45">تأسيس القطب</p></div><div><p className="text-3xl font-black text-white">4</p><p className="mt-1 text-xs font-bold uppercase tracking-widest text-white/45">فئات عمرية</p></div><div><p className="text-3xl font-black text-lime-300">9</p><p className="mt-1 text-xs font-bold uppercase tracking-widest text-white/45">أشهر في الموسم</p></div></div>
            </div>
            <div className="hidden justify-self-end lg:block"><div className="relative h-64 w-64 rounded-[2rem] border border-lime-300/30 bg-lime-300/10 p-8 backdrop-blur-sm"><div className="absolute -right-4 -top-4 rounded-full bg-lime-400 p-3 text-zinc-950"><Sparkles className="h-5 w-5" /></div><div className="flex h-full flex-col justify-between border border-white/10 p-5"><span className="text-5xl font-black tracking-tighter text-lime-300">01</span><div><p className="text-xs font-black uppercase tracking-[0.2em] text-white">Union Pro Sports</p><p className="mt-2 text-2xl font-black text-white">Train hard.<br />Play smart.</p></div></div></div></div>
          </div>
        </section>

        <section id="pole" className="bg-white py-24 lg:py-32">
          <div className="mx-auto grid max-w-7xl gap-16 px-5 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
            <div className="relative min-h-[360px] overflow-hidden rounded-[2rem] bg-zinc-950"><img src="/manus-storage/training-banner_05f2216a.webp" alt="Entraînement au pôle" className="h-full w-full object-cover opacity-80" /><div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent" /><div className="absolute bottom-7 left-7 right-7 flex items-end justify-between"><p className="text-5xl font-black tracking-tighter text-lime-300">01<span className="text-white/30">/04</span></p><p className="max-w-[160px] text-right text-xs font-bold uppercase leading-5 tracking-widest text-white/70">L’exigence<br />au service du potentiel</p></div></div>
            <div className="flex flex-col justify-center text-right" dir="rtl"><p className="text-xs font-black uppercase tracking-[0.25em] text-lime-600">من نحن</p><h2 className="mt-4 text-4xl font-black tracking-[-0.05em] text-zinc-950 sm:text-6xl">أكثر من كرة قدم.<br /><span className="text-zinc-400">مدرسة للحياة.</span></h2><p className="mt-7 max-w-2xl text-base leading-8 text-zinc-500">المركز التدريبي الرياضي اتحاد برو هو أكاديمية متخصصة في تكوين وتطوير الفئات الشابة بمدينة عين اسمارة. تأسس في نهاية سنة 2025 بهدف تكوين لاعب متكامل رياضياً، تعليمياً وأخلاقياً، وفق منهجية احترافية يشرف عليها طاقم إداري وتقني مؤهل.</p><div className="mt-8 grid gap-4 sm:grid-cols-3"><div className="rounded-2xl bg-[#f4f7ed] p-5"><ShieldCheck className="h-6 w-6 text-lime-600" /><p className="mt-5 font-black">تأطير مؤهل</p><p className="mt-1 text-xs leading-5 text-zinc-500">طاقم تقني وإداري متخصص</p></div><div className="rounded-2xl bg-[#f4f7ed] p-5"><Trophy className="h-6 w-6 text-lime-600" /><p className="mt-5 font-black">منهجية احترافية</p><p className="mt-1 text-xs leading-5 text-zinc-500">تطور واضح في كل مرحلة</p></div><div className="rounded-2xl bg-[#f4f7ed] p-5"><Users className="h-6 w-6 text-lime-600" /><p className="mt-5 font-black">قيم راسخة</p><p className="mt-1 text-xs leading-5 text-zinc-500">رياضة، تعليم وأخلاق</p></div></div></div>
          </div>
        </section>

        <section id="categories" className="bg-[#f1f3eb] py-24 lg:py-28"><div className="mx-auto max-w-7xl px-5 lg:px-8"><div className="flex flex-col justify-between gap-6 text-right sm:flex-row sm:items-end" dir="rtl"><div><p className="text-xs font-black uppercase tracking-[0.25em] text-lime-700">الفئات العمرية</p><h2 className="mt-3 text-4xl font-black tracking-[-0.05em] sm:text-6xl">المكان المناسب<br /><span className="text-zinc-400">لكل مرحلة.</span></h2></div><p className="max-w-xs text-sm leading-6 text-zinc-500">تدريب مخصص حسب العمر، يوازن بين المتعة والانضباط والتطور التقني.</p></div><div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{ageGroups.map((group, index) => <div key={group.id} className="group relative overflow-hidden rounded-[1.7rem] bg-zinc-950 p-6 text-white transition duration-300 hover:-translate-y-1 hover:shadow-2xl"><div className={`absolute -right-12 -top-12 h-40 w-40 rounded-full bg-gradient-to-br ${group.accent} opacity-80 blur-2xl transition group-hover:scale-125`} /><div className="relative flex min-h-48 flex-col justify-between text-right" dir="rtl"><div className="flex items-start justify-between"><span className="text-6xl font-black tracking-[-0.08em] text-white">{group.id}</span><span className="rounded-full border border-white/15 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white/60">0{index + 1}</span></div><div><p className="text-sm font-black text-lime-300">مواليد {group.years}</p><p className="mt-1 text-xs text-white/45">{group.age}</p></div></div></div>)}</div></div></section>

        <section id="tarifs" className="bg-zinc-950 py-24 text-white lg:py-28"><div className="mx-auto max-w-7xl px-5 lg:px-8"><div className="grid gap-14 lg:grid-cols-[0.75fr_1.25fr] lg:items-end"><div className="text-right" dir="rtl"><p className="text-xs font-black uppercase tracking-[0.25em] text-lime-300">النظام المالي</p><h2 className="mt-4 text-4xl font-black tracking-[-0.05em] sm:text-6xl">استثمر في<br /><span className="text-lime-300">المستقبل.</span></h2><p className="mt-6 max-w-sm text-sm leading-7 text-white/50">بكل وضوح. بدون مفاجآت. رسوم الموسم مصممة لتمنح اللاعب كل ما يحتاجه منذ أول حصة تدريب.</p></div><div className="grid gap-4 sm:grid-cols-2"><div className="rounded-[1.7rem] border border-white/10 bg-white/[0.04] p-7" dir="rtl"><div className="flex items-center justify-between"><span className="rounded-full bg-lime-400 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-zinc-950">مرة واحدة</span><span className="text-2xl">🎒</span></div><p className="mt-8 text-sm font-bold text-white/60">حزمة الانخراط</p><p className="mt-1 text-4xl font-black text-white">8 000 <span className="text-base font-bold text-lime-300">DZD</span></p><ul className="mt-7 space-y-3 text-sm text-white/65"><li><Check className="mr-2 inline h-4 w-4 text-lime-300" /> Survêtement</li><li><Check className="mr-2 inline h-4 w-4 text-lime-300" /> Protège-tibias & bas</li><li><Check className="mr-2 inline h-4 w-4 text-lime-300" /> Sac sportif</li></ul></div><div className="rounded-[1.7rem] bg-lime-400 p-7 text-zinc-950" dir="rtl"><div className="flex items-center justify-between"><span className="rounded-full bg-zinc-950 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-lime-300">9 أشهر</span><span className="text-2xl">◉</span></div><p className="mt-8 text-sm font-bold text-zinc-700">الاشتراك الشهري</p><p className="mt-1 text-4xl font-black">2 000 <span className="text-base font-bold">DZD / mois</span></p><p className="mt-7 text-sm font-bold leading-6 text-zinc-700">3 دفعات موسمية<br /><span className="text-zinc-950">6 000 DZD لكل دفعة</span></p><div className="mt-5 flex gap-1"><span className="h-2 flex-1 rounded-full bg-zinc-950" /><span className="h-2 flex-1 rounded-full bg-zinc-950" /><span className="h-2 flex-1 rounded-full bg-zinc-950" /></div></div></div></div></div></section>

        <section id="inscription" className="bg-[#f8f8f4] py-24 lg:py-32"><div className="mx-auto max-w-5xl px-5 lg:px-8"><div className="text-right" dir="rtl"><p className="text-xs font-black uppercase tracking-[0.25em] text-lime-700">الخطوة الأولى</p><h2 className="mt-3 text-4xl font-black tracking-[-0.05em] sm:text-6xl">سجّل لاعبك<br /><span className="text-zinc-400">اليوم.</span></h2><p className="mt-5 max-w-xl text-sm leading-7 text-zinc-500">املأ الاستمارة التالية بعناية. سيتواصل معكم فريقنا في أقرب وقت لتأكيد التسجيل.</p></div>
          <form onSubmit={submit} className="mt-12 overflow-hidden rounded-[2rem] border border-zinc-200 bg-white shadow-[0_20px_80px_rgba(20,30,20,0.08)]"><div className="border-b border-zinc-100 bg-zinc-950 px-6 py-7 text-white sm:px-10" dir="rtl"><p className="text-xs font-black uppercase tracking-[0.25em] text-lime-300">01 — معلومات اللاعب</p><p className="mt-2 text-2xl font-black">من هو نجمنا الصاعد؟</p></div><div className="grid gap-6 p-6 sm:grid-cols-2 sm:p-10" dir="rtl"><Field label="الاسم"><div className="grid grid-cols-2 gap-3"><Input required value={form.playerFirstName} onChange={(e) => setField("playerFirstName", e.target.value)} placeholder="الاسم" /><Input required value={form.playerLastName} onChange={(e) => setField("playerLastName", e.target.value)} placeholder="اللقب" /></div></Field><Field label="الصفة"><Select value={form.playerTitle} onChange={(e) => setField("playerTitle", e.target.value)}><option value="M.">السيد</option><option value="Mme.">السيدة</option><option value="Master">الطفل</option></Select></Field><Field label="تاريخ الميلاد"><Input required type="date" value={form.dateOfBirth} onChange={(e) => setField("dateOfBirth", e.target.value)} /></Field><Field label="مكان الميلاد"><Input required value={form.placeOfBirth} onChange={(e) => setField("placeOfBirth", e.target.value)} placeholder="المدينة" /></Field><Field label="الفئة العمرية"><Select value={form.ageGroup} onChange={(e) => setField("ageGroup", e.target.value as FormState["ageGroup"])}>{ageGroups.map((group) => <option key={group.id} value={group.id}>{group.id} — مواليد {group.years}</option>)}</Select></Field><Field label="العنوان" hint="السكن الحالي"><Input required value={form.address} onChange={(e) => setField("address", e.target.value)} placeholder="العنوان الكامل" /></Field></div>
            <div className="border-y border-zinc-100 bg-[#fafbf7] px-6 py-7 sm:px-10" dir="rtl"><p className="text-xs font-black uppercase tracking-[0.25em] text-lime-700">02 — معلومات الولي</p><p className="mt-2 text-2xl font-black">نحن هنا من أجل العائلة.</p></div><div className="grid gap-6 p-6 sm:grid-cols-2 sm:p-10" dir="rtl"><Field label="اسم ولقب الولي"><Input required value={form.guardianName} onChange={(e) => setField("guardianName", e.target.value)} placeholder="الاسم الكامل" /></Field><Field label="صلة القرابة"><Select value={form.guardianRelation} onChange={(e) => setField("guardianRelation", e.target.value)}><option value="Père">الأب</option><option value="Mère">الأم</option><option value="Tuteur légal">الولي الشرعي</option><option value="Autre">أخرى</option></Select></Field><Field label="رقم الهاتف"><Input required type="tel" value={form.guardianPhone} onChange={(e) => setField("guardianPhone", e.target.value)} placeholder="0555 45 70 40" /></Field><Field label="رقم هاتف ثانٍ" required={false} hint="اختياري"><Input type="tel" value={form.guardianPhone2} onChange={(e) => setField("guardianPhone2", e.target.value)} placeholder="اختياري" /></Field></div>
            <div className="border-y border-zinc-100 bg-[#fafbf7] px-6 py-7 sm:px-10" dir="rtl"><p className="text-xs font-black uppercase tracking-[0.25em] text-lime-700">03 — المعلومات الصحية</p><p className="mt-2 text-2xl font-black">السلامة قبل كل شيء.</p></div><div className="grid gap-6 p-6 sm:p-10" dir="rtl"><label className="flex items-center justify-between rounded-2xl border border-zinc-200 p-4"><span className="text-sm font-bold">هل يعاني اللاعب من مرض أو حساسية؟</span><input type="checkbox" checked={form.hasHealthIssue} onChange={(e) => setField("hasHealthIssue", e.target.checked)} className="h-5 w-5 accent-lime-500" /></label>{form.hasHealthIssue && <label className="space-y-2 text-right"><span className="text-sm font-bold">يرجى التوضيح</span><textarea required value={form.healthDetails} onChange={(e) => setField("healthDetails", e.target.value)} className="min-h-28 w-full rounded-xl border border-zinc-200 p-4 text-right text-sm outline-none focus:border-lime-500 focus:ring-4 focus:ring-lime-100" placeholder="اذكر أي معلومة صحية مهمة لفريقنا..." /></label>}</div>
            <div className="border-y border-zinc-100 bg-[#fafbf7] px-6 py-7 sm:px-10" dir="rtl"><p className="text-xs font-black uppercase tracking-[0.25em] text-lime-700">04 — الوثائق المطلوبة</p><p className="mt-2 text-2xl font-black">ملف جاهز للانطلاقة.</p></div><div className="grid gap-3 p-6 sm:grid-cols-2 sm:p-10" dir="rtl">{([{ key: "birthCertificate", label: "شهادة الميلاد" }, { key: "medicalCertificate", label: "شهادة طبية لممارسة كرة القدم" }, { key: "photos", label: "صورتان شمسيتان" }, { key: "guardianIdCopy", label: "نسخة من بطاقة هوية الولي" }] as const).map((document) => <label key={document.key} className="flex items-center gap-3 rounded-2xl border border-zinc-200 p-4 text-sm font-bold text-zinc-700"><input type="checkbox" checked={form[document.key]} onChange={(e) => setField(document.key, e.target.checked)} className="h-5 w-5 accent-lime-500" />{document.label}</label>)}</div>
            <div className="flex flex-col items-center justify-between gap-5 bg-zinc-950 px-6 py-7 sm:flex-row sm:px-10" dir="rtl"><p className="text-center text-xs leading-5 text-white/50 sm:text-right">بإرسال هذا الطلب، أؤكد أن المعلومات المقدمة صحيحة<br />وأوافق على تواصل فريق اتحاد برو معي.</p><Button type="submit" disabled={createRegistration.isPending} className="h-14 rounded-full bg-lime-400 px-8 text-sm font-black text-zinc-950 hover:bg-lime-300">{createRegistration.isPending ? "جاري الإرسال..." : "إرسال طلب التسجيل"}<ArrowRight className="ml-2 h-4 w-4" /></Button></div>
          </form>
        </div></section>
      </main>

      <footer id="contact" className="border-t border-white/10 bg-zinc-950 py-14 text-white"><div className="mx-auto flex max-w-7xl flex-col gap-10 px-5 lg:flex-row lg:items-end lg:justify-between lg:px-8"><div className="text-right" dir="rtl"><div className="flex items-center justify-end gap-3"><div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-lime-400 text-xl font-black text-zinc-950">IP</div><div><p className="text-[11px] font-black uppercase tracking-[0.24em] text-lime-300">ITTIHAD PRO</p><p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/45">Pôle d’excellence</p></div></div><p className="mt-5 max-w-sm text-sm leading-6 text-white/45">نكوّن لاعباً متكاملاً في الرياضة، التعليم والأخلاق.</p></div><div className="flex flex-wrap justify-end gap-8 text-right text-sm" dir="rtl"><div><p className="mb-3 text-xs font-black uppercase tracking-widest text-lime-300">تواصل معنا</p><a className="block text-white/70 hover:text-white" href="tel:0555457040"><Phone className="ml-2 inline h-4 w-4 text-lime-300" /> 0555 45 70 40</a><p className="mt-2 text-white/50"><MapPin className="ml-2 inline h-4 w-4 text-lime-300" /> عين اسمارة — قسنطينة</p></div><div><p className="mb-3 text-xs font-black uppercase tracking-widest text-lime-300">تابعنا</p><p className="text-white/70"><Facebook className="ml-2 inline h-4 w-4" /> ittihad pro</p><p className="mt-2 text-white/70"><Instagram className="ml-2 inline h-4 w-4" /> ittihadpro_irbas</p></div></div></div><div className="mx-auto mt-10 max-w-7xl border-t border-white/10 px-5 pt-5 text-right text-[11px] text-white/30 lg:px-8" dir="rtl"><span>© 2026 ITTIHAD PRO — جميع الحقوق محفوظة</span></div></footer>
    </div>
  );
}
