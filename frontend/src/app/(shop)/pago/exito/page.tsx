"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { mercadopagoService } from "@/features/pagos/services/mercadopagoService";
import { EstadoPago } from "@/features/pagos/types/pago";
import { formatCurrency } from "@/lib/utils/currency";

/**
 * Back URL de exito de Mercado Pago. MP redirige aqui con query params como:
 *   ?payment_id=123&status=approved&external_reference=pedido-7&...
 *
 * Esta pagina toma el payment_id y llama al backend para CONFIRMAR el pago
 * (el backend verifica contra la API de Mercado Pago, no confia en la URL).
 * Asi el pedido queda PAGADO aunque el webhook no sea alcanzable en local.
 */
function PagoExitoContent() {
  const searchParams = useSearchParams();
  const paymentId = searchParams.get("payment_id") ?? searchParams.get("collection_id");

  const [estado, setEstado] = useState<"confirmando" | "ok" | "error">("confirmando");
  const [pago, setPago] = useState<EstadoPago | null>(null);
  const [mensaje, setMensaje] = useState<string | null>(null);

  useEffect(() => {
    if (!paymentId) {
      setEstado("error");
      setMensaje("Mercado Pago no envió un payment_id en la URL de retorno.");
      return;
    }
    mercadopagoService
      .confirmarPago(paymentId)
      .then((p) => {
        setPago(p);
        setEstado("ok");
      })
      .catch((e) => {
        setEstado("error");
        setMensaje(e instanceof Error ? e.message : "No se pudo confirmar el pago");
      });
  }, [paymentId]);

  return (
    <div className="mx-auto flex max-w-lg flex-col items-center gap-4 px-6 py-16 text-center">
      {estado === "confirmando" && (
        <>
          <h1 className="text-2xl font-bold">Confirmando tu pago…</h1>
          <p className="text-zinc-500">
            Estamos verificando la transacción con Mercado Pago. No cierres esta página.
          </p>
        </>
      )}

      {estado === "ok" && pago && (
        <>
          <div className="text-5xl">✅</div>
          <h1 className="text-2xl font-bold">¡Pago recibido!</h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            Tu pago quedó en estado{" "}
            <span className="font-semibold">{pago.estadoPago}</span> por{" "}
            <span className="font-semibold">
              {formatCurrency(Number(pago.montoTransaccion ?? 0))}
            </span>
            .
          </p>
          <p className="text-sm text-zinc-500">
            Transacción Mercado Pago: {pago.tokenTransaccion}
          </p>
          <Link href="/pedidos" className="btn-primary mt-4 rounded-xl px-6 py-3">
            Ver mis pedidos
          </Link>
        </>
      )}

      {estado === "error" && (
        <>
          <div className="text-5xl">⚠️</div>
          <h1 className="text-2xl font-bold">No pudimos confirmar el pago</h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            {mensaje ??
              "Ocurrió un problema al verificar la transacción. Si el cargo se realizó, se reflejará en tus pedidos en unos minutos."}
          </p>
          <Link href="/pedidos" className="btn-secondary mt-4 rounded-xl px-6 py-3">
            Revisar mis pedidos
          </Link>
        </>
      )}
    </div>
  );
}

export default function PagoExitoPage() {
  // useSearchParams exige un boundary de Suspense en Next.js (App Router)
  return (
    <Suspense fallback={null}>
      <PagoExitoContent />
    </Suspense>
  );
}
