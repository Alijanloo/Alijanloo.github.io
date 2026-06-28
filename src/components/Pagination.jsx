export default function Pagination({ currentPage, totalPages, onChange }) {
  if (totalPages <= 1) return null;
  const pages = [];
  for (let i = 1; i <= totalPages; i++) pages.push(i);

  return (
    <nav className="pagination" aria-label="Pagination">
      <ul className="pagination-list">
        {currentPage > 1 && (
          <li className="page-item">
            <button className="page-link" onClick={() => onChange(currentPage - 1)}>
              ‹
            </button>
          </li>
        )}
        {pages.map((p) => (
          <li
            key={p}
            className={"page-item" + (p === currentPage ? " active" : "")}
          >
            <button className="page-link" onClick={() => onChange(p)}>
              {p}
            </button>
          </li>
        ))}
        {currentPage < totalPages && (
          <li className="page-item">
            <button className="page-link" onClick={() => onChange(currentPage + 1)}>
              ›
            </button>
          </li>
        )}
      </ul>
    </nav>
  );
}
