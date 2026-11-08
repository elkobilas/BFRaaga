export function Logo({ light = false }: { light?: boolean }) {
  return (
    <span className="flex items-center gap-2.5">
      <span className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-teal-700 font-display text-lg font-extrabold text-white">
        BF
        <span className={`absolute -bottom-1 -right-1 h-3 w-3 rounded-full bg-orange-400 ring-2 ${light ? 'ring-teal-900' : 'ring-white'}`} />
      </span>
      <span className={`font-display text-xl font-extrabold tracking-wide ${light ? 'text-white' : 'text-teal-800'}`}>RAAGA</span>
    </span>
  );
}
