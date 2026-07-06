interface ProductFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  onlyStock: boolean;
  onOnlyStockChange: (value: boolean) => void;
}

export function ProductFilters({
  search,
  onSearchChange,
  onlyStock,
  onOnlyStockChange,
}: ProductFiltersProps) {
  return (
    <aside className="card-base h-max space-y-5 p-5">
      <div>
        <h2 className="text-base font-semibold">Filtros</h2>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Busca productos y filtra por disponibilidad.
        </p>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Buscar</label>
        <input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Ej. teclado, monitor..."
          className="input-base"
        />
      </div>

      <label className="flex items-center gap-3 text-sm">
        <input
          type="checkbox"
          checked={onlyStock}
          onChange={(e) => onOnlyStockChange(e.target.checked)}
        />
        Mostrar solo productos con stock
      </label>
    </aside>
  );
}