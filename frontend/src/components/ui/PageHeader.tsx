interface PageHeaderProps {
  titulo: string;
  subtitulo?: string;
  labelAccion?: string;
  onAccion?: () => void;
}

export function PageHeader({ titulo, subtitulo, labelAccion, onAccion }: PageHeaderProps) {
  return (
    <div className="flex justify-between items-center mb-8 border-b border-zinc-200 pb-6">
      <div>
        <h1 className="text-3xl font-black tracking-tight text-zinc-900">{titulo}</h1>
        {subtitulo && (
          <p className="text-zinc-500 mt-1 text-sm">{subtitulo}</p>
        )}
      </div>
      {labelAccion && onAccion && (
        <button
          onClick={onAccion}
          className="bg-zinc-900 hover:bg-zinc-800 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-colors"
        >
          {labelAccion}
        </button>
      )}
    </div>
  );
}
