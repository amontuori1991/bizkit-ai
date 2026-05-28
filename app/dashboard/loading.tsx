export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#dbeafe_0%,#eff6ff_18%,#f8fafc_55%,#eef2ff_100%)] p-4 sm:p-6 xl:p-8">
      <div className="mx-auto max-w-[1600px] animate-pulse space-y-6">
        <div className="h-40 rounded-[2rem] border border-white/60 bg-white/80" />
        <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="h-80 rounded-[2rem] border border-white/60 bg-white/80" />
          <div className="h-80 rounded-[2rem] border border-white/60 bg-white/80" />
        </div>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-36 rounded-[2rem] border border-white/60 bg-white/80" />
          ))}
        </div>
      </div>
    </div>
  );
}

