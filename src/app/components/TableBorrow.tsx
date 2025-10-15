type Row = {
  id: number;
  borrower: string;
  title: string;
  borrowDate: string;
  dueDate: string;
  returnDate: string | null;
  status: string;
};
export default function TableBorrow({
  rows,
  onReturn,
}: {
  rows: Row[];
  onReturn?: (id: number) => void;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border">
        <thead className="bg-gray-100 dark:bg-gray-800">
          <tr>
            <th className="px-3 py-2 text-left">#</th>
            <th className="px-3 py-2 text-left">Borrower</th>
            <th className="px-3 py-2 text-left">Book Title</th>
            <th className="px-3 py-2 text-left">Borrow Date</th>
            <th className="px-3 py-2 text-left">Due Date</th>
            <th className="px-3 py-2 text-left">Return Date</th>
            <th className="px-3 py-2 text-left">Status</th>
            {onReturn && <th className="px-3 py-2 text-left">Action</th>}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="border-t">
              <td className="px-3 py-2">{r.id}</td>
              <td className="px-3 py-2">{r.borrower}</td>
              <td className="px-3 py-2">{r.title}</td>
              <td className="px-3 py-2">{r.borrowDate}</td>
              <td className="px-3 py-2">{r.dueDate}</td>
              <td className="px-3 py-2">{r.returnDate || "-"}</td>
              <td className="px-3 py-2">{r.status}</td>
              {onReturn && r.status === "borrowed" && (
                <td className="px-3 py-2">
                  <button
                    onClick={() => onReturn(r.id)}
                    className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded"
                  >
                    Kembalikan
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
