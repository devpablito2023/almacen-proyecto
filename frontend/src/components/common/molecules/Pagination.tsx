export const Pagination: React.FC<{
  page: number; total: number; perPage: number;
  onPageChange: (p: number) => void; onPerPageChange?: (n: number) => void;
}> = ({ page, total, perPage, onPageChange, onPerPageChange }) => {
  const pages = Math.max(1, Math.ceil(total / perPage));
  return (
    <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200">
      <span className="text-sm text-gray-600">
        Página {page} de {pages} — {total} registros
      </span>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page === 1}
          className="px-3 py-1 text-sm border rounded disabled:opacity-50"
        >
          Anterior
        </button>
        {Array.from({ length: pages }, (_, i) => i + 1).slice(0, 7).map((p) => (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`px-3 py-1 text-sm border rounded ${p === page ? "bg-blue-600 text-white border-blue-600" : "hover:bg-gray-50"}`}
          >
            {p}
          </button>
        ))}
        <button
          onClick={() => onPageChange(Math.min(pages, page + 1))}
          disabled={page === pages}
          className="px-3 py-1 text-sm border rounded disabled:opacity-50"
        >
          Siguiente
        </button>
        {onPerPageChange && (
          <select
            className="ml-3 px-2 py-1 border rounded"
            value={perPage}
            onChange={(e) => onPerPageChange(Number(e.target.value))}
          >
            {[5, 10, 25, 50].map(n => <option key={n} value={n}>{n}/página</option>)}
          </select>
        )}
      </div>
    </div>
  );
};
