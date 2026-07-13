"use client";

import Link from "next/link";

/**
 * Back URL de fallo de Mercado Pago (?status=rejected, pago cancelado, etc).
 * No hay nada que confirmar aqui: el pedido sigue PENDIENTE_PAGO y, si el
 * webhook (o la tarea de limpieza de 30 min) lo cancela, el stock reservado
 * se libera automaticamente.
 */
export default function PagoErrorPage() {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center gap-4 px-6 py-16 text-center">
      <div className="text-5xl">❌</div>
      <h1 className="text-2xl font-bold">El pago no se completó</h1>
      <p className="text-zinc-600 dark:text-zinc-400">
        Mercado Pago rechazó o canceló la transacción. No se realizó ningún
        cargo. Puedes intentar pagar de nuevo desde tus pedidos, o volver al
        catálogo.
      </p>
      <div className="mt-4 flex gap-3">
        <Link href="/pedidos" className="btn-primary rounded-xl px-6 py-3">
          Ver mis pedidos
        </Link>
        <Link href="/productos" className="btn-secondary rounded-xl px-6 py-3">
          Seguir comprando
        </Link>
      </div>
    </div>
  );
}
