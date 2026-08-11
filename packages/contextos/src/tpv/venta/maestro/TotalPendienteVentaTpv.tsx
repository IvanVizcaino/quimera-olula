import { formatearMoneda } from "@olula/lib/dominio.js";
import { VentaTpv } from "../diseño.ts";

export const TotalPendienteVentaTpv = ({ venta }: { venta: VentaTpv }) => {
  const { total, pagado, pendiente, divisa_id } = venta;
  const divisa = divisa_id || "EUR";

  if (pendiente <= 0) {
    return <span>{formatearMoneda(total, divisa)}</span>;
  }

  if (pagado > 0) {
    return (
      <span>
        <span style={{ color: "var(--color-error)" }}>
          {formatearMoneda(pendiente, divisa)}
        </span>
        {" / "}
        {formatearMoneda(total, divisa)}
      </span>
    );
  }

  return (
    <span style={{ color: "var(--color-error)" }}>
      {formatearMoneda(total, divisa)}
    </span>
  );
};
