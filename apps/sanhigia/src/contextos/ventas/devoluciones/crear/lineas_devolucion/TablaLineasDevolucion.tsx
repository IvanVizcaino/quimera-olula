import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.ts";
import { QIcono, QInput } from "@olula/componentes/index.js";
import { ListadoSemiControlado } from "@olula/componentes/maestro/ListadoSemiControlado.tsx";
import { useEsMovil } from "@olula/componentes/maestro/useEsMovil.js";
import { criteriaDefecto } from "@olula/lib/dominio.js";
import { useEffect } from "react";
import { LineaFacturaDevolucion } from "../../diseño.ts";
import {
  ContextoLineasDevolucion,
  contextoLineasDevolucionVacio,
} from "./diseño.ts";
import { getMaquina } from "./maquina.ts";

const formatoMoneda = new Intl.NumberFormat("es-ES", {
  style: "currency",
  currency: "EUR",
  minimumFractionDigits: 2,
});

const formatoNumero = new Intl.NumberFormat("es-ES", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const hayLineasConCantidad = (ctx: ContextoLineasDevolucion) =>
  ctx.lineas.some((linea) => Number(linea.cantidadDevolver ?? 0) > 0);

const TarjetaLineaFacturaDevolucion = ({
  linea,
  valor,
  onChange,
  onAplicarTodo,
}: {
  linea: LineaFacturaDevolucion;
  valor: string;
  onChange: (valor: string) => void;
  onAplicarTodo: () => void;
}) => {
  return (
    <article className="tarjeta-linea-factura-devolucion">
      <div className="tarjeta-linea-factura-devolucion-cabecera">
        <div className="tarjeta-linea-factura-devolucion-identidad">
          <strong>{linea.referencia}</strong>
          <span>{linea.descripcion}</span>
        </div>
        <div className="tarjeta-linea-factura-devolucion-meta">
          <span>
            Importe: {formatoMoneda.format(linea.importe ?? linea.total ?? 0)}
          </span>
          <span>Cantidad: {formatoNumero.format(linea.cantidad ?? 0)}</span>
        </div>
      </div>

      <div className="tarjeta-linea-factura-devolucion-campos">
        <QInput
          label="A devolver"
          nombre={`cantidad_devolver_tarjeta_${linea.id}`}
          tipo="decimal"
          valor={valor}
          autoSeleccion
          deshabilitado={linea.esKit}
          onChange={(nuevoValor) => onChange(nuevoValor)}
        />

        <QBoton
          variante="texto"
          tamaño="pequeño"
          deshabilitado={linea.esKit}
          onClick={onAplicarTodo}
        >
          <QIcono nombre="paquete_export" />
        </QBoton>
      </div>
    </article>
  );
};

export const TablaLineasDevolucion = ({
  lineasIniciales,
  onLineasCambiadas,
  onCrear,
}: {
  lineasIniciales: LineaFacturaDevolucion[];
  onLineasCambiadas: (lineas: LineaFacturaDevolucion[]) => void;
  onCrear: () => void;
}) => {
  const { ctx, emitir } = useMaquina(getMaquina, contextoLineasDevolucionVacio);
  const esMovil = useEsMovil();

  useEffect(() => {
    emitir("lineas_cargadas", lineasIniciales, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lineasIniciales]);

  useEffect(() => {
    onLineasCambiadas(ctx.lineas);
  }, [ctx.lineas, onLineasCambiadas]);

  const actualizarCantidadDevolver = (idLinea: string, valor: string) => {
    emitir("cantidad_aplicada", {
      idLinea,
      valor,
    });
  };

  const puedeCrear = hayLineasConCantidad(ctx);
  const criteriaLineasDefecto = {
    ...criteriaDefecto,
    orden: ["referencia", "ASC"] as [string, "ASC" | "DESC"],
  };

  const metaTablaLineas = [
    { id: "referencia", cabecera: "Referencia", prioridad: "alta" as const },
    { id: "descripcion", cabecera: "Descripción", prioridad: "alta" as const },
    {
      id: "importe",
      cabecera: "Importe",
      prioridad: "media" as const,
      render: (linea: LineaFacturaDevolucion) =>
        formatoMoneda.format(linea.importe ?? linea.total ?? 0),
    },
    {
      id: "cantidad",
      cabecera: "Cantidad",
      prioridad: "alta" as const,
      render: (linea: LineaFacturaDevolucion) =>
        formatoNumero.format(linea.cantidad ?? 0),
    },
    {
      id: "cantidadDevolver",
      cabecera: "A devolver",
      prioridad: "alta" as const,
      render: (linea: LineaFacturaDevolucion) => (
        <QInput
          label=""
          nombre={`cantidad_devolver_${linea.id}`}
          tipo="decimal"
          valor={ctx.borradoresCantidad[linea.id] ?? "0"}
          autoSeleccion
          deshabilitado={linea.esKit}
          onChange={(valor) => actualizarCantidadDevolver(linea.id, valor)}
        />
      ),
    },
    {
      id: "aplicar",
      cabecera: "Aplicar",
      prioridad: "media" as const,
      render: (linea: LineaFacturaDevolucion) => (
        <QBoton
          variante="texto"
          tamaño="pequeño"
          deshabilitado={linea.esKit}
          onClick={() => emitir("cantidad_maxima_aplicada", linea.id)}
        >
          <QIcono nombre="paquete_export" />
        </QBoton>
      ),
    },
  ];

  return (
    <>
      <ListadoSemiControlado<LineaFacturaDevolucion>
        metaTabla={metaTablaLineas}
        tarjeta={(linea) => (
          <TarjetaLineaFacturaDevolucion
            linea={linea}
            valor={ctx.borradoresCantidad[linea.id] ?? "0"}
            onChange={(valor) => actualizarCantidadDevolver(linea.id, valor)}
            onAplicarTodo={() => emitir("cantidad_maxima_aplicada", linea.id)}
          />
        )}
        entidades={ctx.lineas}
        totalEntidades={ctx.lineas.length}
        cargando={false}
        seleccionada={null}
        onSeleccion={() => null}
        criteriaInicial={criteriaLineasDefecto}
        modo={esMovil ? "tarjetas" : "tabla"}
        onCriteriaChanged={() => null}
      />

      <div className="botones">
        <QBoton
          variante="texto"
          onClick={() => emitir("devolucion_total_aplicada")}
        >
          Devolución total
        </QBoton>
        <QBoton onClick={onCrear} deshabilitado={!puedeCrear}>
          Crear devolución
        </QBoton>
      </div>
    </>
  );
};
