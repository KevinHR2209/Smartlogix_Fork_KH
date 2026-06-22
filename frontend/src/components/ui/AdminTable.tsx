import { ReactNode } from 'react';

interface Column<T> {
  header: string;
  accessor: keyof T | ((row: T) => ReactNode);
  className?: string;
}

interface AdminTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (row: T) => string | number;
  emptyMessage?: string;
}

export function AdminTable<T>({
  columns,
  data,
  keyExtractor,
  emptyMessage = 'No hay datos disponibles.',
}: AdminTableProps<T>) {
  return (
    <div className="bg-white shadow-sm rounded-2xl border border-stone-200 overflow-hidden">
      <table className="w-full text-left">
        <thead className="bg-stone-50 border-b border-stone-200">
          <tr>
            {columns.map((col, i) => (
              <th
                key={i}
                className={`p-5 text-xs font-bold tracking-wider text-zinc-500 uppercase ${col.className ?? ''}`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-stone-100">
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="p-10 text-center text-zinc-400 text-sm">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map(row => (
              <tr key={keyExtractor(row)} className="hover:bg-stone-50 transition-colors">
                {columns.map((col, i) => (
                  <td key={i} className={`p-5 text-sm ${col.className ?? ''}`}>
                    {typeof col.accessor === 'function'
                      ? col.accessor(row)
                      : (row[col.accessor] as ReactNode)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
