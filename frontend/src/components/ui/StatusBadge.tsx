interface StatusBadgeProps {
  estado: string;
}

const estadoVariants: Record<string, string> = {
  ACTIVO:     'bg-green-100 text-green-800 border-green-200',
  DESPACHADO: 'bg-blue-100 text-blue-800 border-blue-200',
  PAGADO:     'bg-yellow-100 text-yellow-800 border-yellow-200',
  INACTIVO:   'bg-red-100 text-red-800 border-red-200',
};

export function StatusBadge({ estado }: StatusBadgeProps) {
  const clases = estadoVariants[estado] ?? 'bg-stone-100 text-zinc-600 border-stone-200';
  return (
    <span className={`px-3 py-1 rounded-md text-[11px] font-bold tracking-wider uppercase border ${clases}`}>
      {estado}
    </span>
  );
}
