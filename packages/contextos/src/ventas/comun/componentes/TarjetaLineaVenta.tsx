import { QTarjetaGenerica } from "@olula/componentes/index.js";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { formatearMoneda } from "@olula/lib/dominio.ts";
import { useEffect, useState } from "react";
import "./TarjetaLineaVenta.css";

export type LineaVentaTarjeta = {
  referencia?: string | null;
  descripcion?: string | null;
  cantidad: number;
  pvp_unitario: number;
  pvp_total: number;
  dto_porcentual?: number | null;
  dto_lineal?: number | null;
  grupo_iva_producto_id?: string | null;
};

export const TarjetaLineaVenta = <L extends LineaVentaTarjeta>({
  linea,
  cantidadEditable = false,
  onCambioCantidad,
}: {
  linea: L;
  cantidadEditable?: boolean;
  onCambioCantidad?: (linea: L, cantidad: number) => void;
}) => {
  const cantidad = Number(linea.cantidad) || 0;
  const [cantidadInput, setCantidadInput] = useState(String(cantidad));

  const permitirEditarCantidad = cantidadEditable && onCambioCantidad;

  const titulo = `${linea.referencia ? `${linea.referencia} - ` : ""}${
    linea.descripcion || "Sin descripción"
  }`;

  const partesDto: string[] = [];
  if (linea.dto_porcentual) partesDto.push(`${linea.dto_porcentual}% Dto`);
  if (linea.dto_lineal)
    partesDto.push(`${formatearMoneda(linea.dto_lineal, "EUR")} Dto`);
  const dtoTexto = partesDto.length ? ` (${partesDto.join(", ")})` : "";

  const desglose = `${cantidad} x ${formatearMoneda(
    linea.pvp_unitario,
    "EUR"
  )}${dtoTexto}`;

  const ivaTexto = linea.grupo_iva_producto_id
    ? `IVA ${linea.grupo_iva_producto_id}`
    : "";

  useEffect(() => {
    setCantidadInput(String(cantidad));
  }, [cantidad]);

  const actualizarCantidad = (nuevaCantidad: number) => {
    if (!permitirEditarCantidad) return;

    const cantidadValida = Math.max(1, Math.floor(nuevaCantidad));
    setCantidadInput(String(cantidadValida));
    if (cantidadValida !== cantidad) {
      onCambioCantidad(linea, cantidadValida);
    }
  };

  const confirmarCantidadInput = (valorRaw?: string) => {
    const parsed = Number(valorRaw ?? cantidadInput);
    if (!Number.isFinite(parsed)) {
      setCantidadInput(String(cantidad));
      return;
    }
    actualizarCantidad(parsed);
  };

  const stepper = (
    <div
      className="linea-venta-stepper"
      onClick={(e) => e.stopPropagation()}
    >
      <QBoton
        variante="borde"
        tamaño="pequeño"
        onClick={() => actualizarCantidad(cantidad - 1)}
        props={{ "aria-label": "Disminuir cantidad" }}
      >
        -
      </QBoton>
      <div className="linea-venta-stepper-input">
        <QInput
          label=""
          nombre="cantidad"
          tipo="numero"
          valor={cantidadInput}
          autoSeleccion
          onChange={(valor) => setCantidadInput(valor)}
          onBlur={(valor) => confirmarCantidadInput(valor)}
          onEnterKeyUp={(valor) => confirmarCantidadInput(valor)}
        />
      </div>
      <QBoton
        variante="borde"
        tamaño="pequeño"
        onClick={() => actualizarCantidad(cantidad + 1)}
        props={{ "aria-label": "Aumentar cantidad" }}
      >
        +
      </QBoton>
    </div>
  );

  return (
    <QTarjetaGenerica
      arribaIzquierda={titulo}
      arribaDerecha={formatearMoneda(linea.pvp_total, "EUR")}
      abajoIzquierda={permitirEditarCantidad ? stepper : desglose}
      abajoDerecha={ivaTexto}
    />
  );
};
