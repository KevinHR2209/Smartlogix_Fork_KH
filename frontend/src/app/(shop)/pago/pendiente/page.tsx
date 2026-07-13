"use client";

import Link from "next/link";

/**
 * Back URL de pago pendiente de Mercado Pago (medios de pago offline o en
 * revision: status=pending / in_process). El estado final llegara por
 * webhook (o se puede consultar desde la pagina de pedidos con el boton
 * "Ver estado de pago").
 */
export default function PagoPendientePage() {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center gap-4 px-6 py-16 text-center">
      <div className="text-5xl">⏳</div>
      <h1 className="text-2xl font-bold">Pago en proceso</h1>
      <p className="text-zinc-600 dark:text-zinc-400">
        Mercado Pago está procesando tu pago. Cuando se confirme, tu pedido
        pasará automáticamente a estado PAGADO. Puedes revisar el estado en
        cualquier momento desde tus pedidos.
      </p>
      <Link href="/pedidos" className="btn-primary mt-4 rounded-xl px-6 py-3">
        Ver mis pedidos
      </Link>
    </div>
  );
}
