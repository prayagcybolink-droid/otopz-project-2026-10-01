export default function Loading() {
  return (
    <div className="min-h-screen bg-[#FFFFE3]">
      <div className="h-8 bg-[#0A0A0A]" />
      <div className="h-16 max-w-[1400px] mx-auto px-4 sm:px-8 grid grid-cols-3 items-center">
        <div className="h-3 w-40 shimmer hidden lg:block" />
        <div className="justify-self-center font-display text-2xl font-semibold tracking-[0.12em] animate-pulse">
          OTOPZ
        </div>
        <div className="justify-self-end h-3 w-32 shimmer" />
      </div>
      <div className="relative bg-[#2A2A2A] h-[600px] sm:h-[720px] overflow-hidden">
        <div className="absolute inset-0 shimmer" />
      </div>
      <div className="h-40 bg-[#0A0A0A]" />
      <div className="max-w-[1400px] mx-auto px-4 sm:px-8 py-14 grid grid-cols-2 lg:grid-cols-4 gap-5">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <div className="aspect-[4/5] shimmer" />
            <div className="h-3 w-2/3 shimmer" />
            <div className="h-3 w-1/3 shimmer" />
          </div>
        ))}
      </div>
    </div>
  );
}
