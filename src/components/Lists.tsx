import type { Booking, CreditTransaction } from "@/data/mock";

export function BookingList({ bookings }: { bookings: Booking[] }) {
  if (!bookings.length) return <p className="text-muted">No hay reservas para mostrar.</p>;

  return (
    <div className="grid gap-3">
      {bookings.map((booking) => (
        <article key={booking.id} className="flex flex-col justify-between gap-3 rounded-2xl border border-line bg-slate-50 p-4 transition hover:bg-white hover:shadow-sm md:flex-row">
          <div>
            <strong>{booking.service}</strong>
            <span className="block text-sm font-bold text-muted">
              {booking.specialistName} · {booking.commune} · {booking.time}
            </span>
          </div>
          <div className="md:text-right">
            <strong>{booking.credits} créditos</strong>
            <span className="block text-sm font-bold text-muted">
              {booking.date} · {booking.status}
            </span>
          </div>
        </article>
      ))}
    </div>
  );
}

export function TransactionList({ transactions }: { transactions: CreditTransaction[] }) {
  return (
    <div className="grid gap-3">
      {transactions.map((transaction) => (
        <article key={transaction.id} className="flex items-center justify-between gap-3 rounded-2xl border border-line bg-slate-50 p-4 transition hover:bg-white hover:shadow-sm">
          <div>
            <strong>{transaction.type}</strong>
            <span className="block text-sm font-bold text-muted">
              {transaction.detail} · {transaction.date}
            </span>
          </div>
          <strong className={transaction.amount < 0 ? "text-amber-700" : "text-brand"}>
            {transaction.amount > 0 ? "+" : ""}
            {transaction.amount}
          </strong>
        </article>
      ))}
    </div>
  );
}
