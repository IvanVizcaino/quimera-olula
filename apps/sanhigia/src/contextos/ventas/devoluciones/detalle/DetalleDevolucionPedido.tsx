import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { Detalle } from "@olula/componentes/detalle/Detalle.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.ts";
import { MetaTabla, QIcono, QInput } from "@olula/componentes/index.js";
import { ListadoSemiControlado } from "@olula/componentes/maestro/ListadoSemiControlado.tsx";
import { useEsMovil } from "@olula/componentes/maestro/useEsMovil.js";
import { QModalConfirmacion } from "@olula/componentes/moleculas/qmodalconfirmacion.tsx";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { criteriaDefecto } from "@olula/lib/dominio.js";
import { useEffect } from "react";
import { LineaDevolucionPedido } from "../diseño.ts";
import "./DetalleDevolucionPedido.css";
import { contextoDetalleDevolucionPedidoVacio } from "./diseño.ts";
import { getMaquina } from "./maquina.ts";

const formatoMoneda = new Intl.NumberFormat("es-ES", {
  style: "currency",
  currency: "EUR",
  minimumFractionDigits: 2,
});

const TarjetaLineaDevolucion = ({
  linea,
  error,
  onCantidadOkCambiada,
  onCantidadKoCambiada,
  onLimpiar,
}: {
  linea: LineaDevolucionPedido;
  error?: string;
  onCantidadOkCambiada: (valor: number) => void;
  onCantidadKoCambiada: (valor: number) => void;
  onLimpiar: () => void;
}) => {
  const referencia = linea.referencia || linea.codigo;
  const lote = linea.codLote || "Sin lote";
  const fechaCaducidad = linea.fechaCaducidad
    ? linea.fechaCaducidad.toLocaleDateString()
    : "Sin caducidad";

  return (
    <article className="tarjeta-linea-devolucion">
      <div className="tarjeta-linea-devolucion-cabecera">
        <div className="tarjeta-linea-devolucion-identidad">
          <strong>{referencia}</strong>
          <span>{linea.descripcion}</span>
        </div>
        <div className="tarjeta-linea-devolucion-meta">
          <span>Cantidad: {linea.cantidad}</span>
          <span>{lote}</span>
          <span>{fechaCaducidad}</span>
        </div>
      </div>

      <div className="tarjeta-linea-devolucion-campos">
        <QInput
          label="Correcta"
          nombre={`cantidad_ok_tarjeta_${linea.id}`}
          tipo="decimal"
          valor={String(linea.cantidadOk ?? 0)}
          autoSeleccion
          onChange={(valor) => onCantidadOkCambiada(Number(valor))}
        />

        <QInput
          label="Dañada"
          nombre={`cantidad_ko_tarjeta_${linea.id}`}
          tipo="decimal"
          valor={String(linea.cantidadKo ?? 0)}
          autoSeleccion
          onChange={(valor) => onCantidadKoCambiada(Number(valor))}
        />

        <QBoton
          variante="texto"
          tamaño="pequeño"
          deshabilitado={
            (linea.cantidadOk ?? 0) + (linea.cantidadKo ?? 0) === 0
          }
          onClick={onLimpiar}
        >
          <QIcono nombre="cerrar" tamaño="sm" />
        </QBoton>
      </div>

      {error && <p className="tarjeta-linea-devolucion-error">{error}</p>}
    </article>
  );
};

export const DetalleDevolucionPedido = ({
  id,
  publicar = async () => {},
  mostrarBotonCerrar = true,
}: {
  id?: string;
  publicar?: EmitirEvento;
  mostrarBotonCerrar?: boolean;
}) => {
  const { ctx, emitir } = useMaquina(
    getMaquina,
    contextoDetalleDevolucionPedidoVacio,
    publicar
  );
  const esMovil = useEsMovil();

  useEffect(() => {
    emitir("id_cambiado", id ?? "", true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (!id) return null;

  if (ctx.error) {
    return <div className="DetalleDevolucionPedido">{ctx.error}</div>;
  }

  if (!ctx.devolucion) {
    return (
      <div className="DetalleDevolucionPedido">Cargando devolución...</div>
    );
  }

  const cerrarDetalle = () => publicar("devolucion_deseleccionada", null);
  const fecha = ctx.devolucion.fecha
    ? ctx.devolucion.fecha.toLocaleDateString()
    : "-";
  const total = formatoMoneda.format(ctx.devolucion.total ?? 0);
  const hayErroresLineas = Object.keys(ctx.erroresLineas).length > 0;
  const hayCantidades = ctx.lineas.some(
    (linea) => (linea.cantidadOk ?? 0) + (linea.cantidadKo ?? 0) > 0
  );
  const confirmarDeshabilitado =
    ctx.lineas.length === 0 || hayErroresLineas || !hayCantidades;
  const confirmandoPreparar = ctx.estado === "CONFIRMANDO_PREPARAR";
  const criteriaLineasDefecto = {
    ...criteriaDefecto,
    orden: ["referencia", "ASC"] as [string, "ASC" | "DESC"],
  };

  const metaTablaLineas: MetaTabla<LineaDevolucionPedido> = [
    {
      id: "referencia",
      cabecera: "Referencia",
      render: (linea) => linea.referencia || linea.codigo,
    },
    { id: "descripcion", cabecera: "Descripción" },
    { id: "cantidad", cabecera: "Cantidad", tipo: "numero" },
    {
      id: "codigo",
      cabecera: "Cód. Lote",
      render: (linea) => linea.codigo || "-",
    },
    {
      id: "fechaCaducidad",
      cabecera: "F. Caducidad",
      render: (linea) =>
        linea.fechaCaducidad ? linea.fechaCaducidad.toLocaleDateString() : "-",
    },
    {
      id: "cantidadOk",
      cabecera: "Correcta",
      render: (linea) => (
        <div className="celda-cantidad-input">
          <QInput
            label=""
            nombre={`cantidad_ok_${linea.id}`}
            tipo="decimal"
            valor={String(linea.cantidadOk ?? 0)}
            autoSeleccion
            onChange={(valor) =>
              emitir("cantidad_ok_cambiada", {
                idLinea: linea.id,
                valor: Number(valor),
              })
            }
          />
        </div>
      ),
    },
    {
      id: "cantidadKo",
      cabecera: "Dañada",
      render: (linea) => (
        <div className="celda-cantidad-input">
          <QInput
            label=""
            nombre={`cantidad_ko_${linea.id}`}
            tipo="decimal"
            valor={String(linea.cantidadKo ?? 0)}
            autoSeleccion
            onChange={(valor) =>
              emitir("cantidad_ko_cambiada", {
                idLinea: linea.id,
                valor: Number(valor),
              })
            }
          />
        </div>
      ),
    },
    {
      id: "limpiar",
      cabecera: "Limpiar",
      render: (linea) => (
        <div className="alineado-centro">
          <QBoton
            variante="texto"
            tamaño="pequeño"
            deshabilitado={
              (linea.cantidadOk ?? 0) + (linea.cantidadKo ?? 0) === 0
            }
            onClick={() =>
              emitir("cantidades_limpiadas", { idLinea: linea.id })
            }
          >
            <QIcono nombre="cerrar" tamaño="sm" />
          </QBoton>
        </div>
      ),
    },
  ];

  return (
    <Detalle
      id={ctx.devolucion.id}
      entidad={ctx.devolucion}
      setEntidad={() => {}}
      obtenerTitulo={undefined}
      cerrarDetalle={undefined}
      className="DetalleDevolucionPedido"
    >
      <div className="detalle-devolucion-pedido-legacy">
        <div className="devolucion-cabecera-principal">
          <h2>
            {ctx.devolucion.nombrecliente}
            {ctx.devolucion.codigo && (
              <span className="devolucion-estado-badge">
                {" "}
                ({ctx.devolucion.codigo})
              </span>
            )}
          </h2>
          {mostrarBotonCerrar && (
            <QBoton
              onClick={cerrarDetalle}
              variante="texto"
              tamaño="pequeño"
              destructivo
            >
              <QIcono nombre="cerrar" tamaño="sm" />
            </QBoton>
          )}
        </div>

        <div className="devolucion-cabecera-secundaria">
          <h3 className="devolucion-total">{total}</h3>
          <h3 className="devolucion-fecha">{fecha}</h3>
        </div>

        <div className="devolucion-cabecera-acciones">
          <QBoton
            texto="Confirmar devolución"
            deshabilitado={confirmarDeshabilitado}
            onClick={() => emitir("confirmacion_preparar_solicitada")}
          >
            Confirmar devolución
          </QBoton>
        </div>

        <div className="detalle-devolucion-pedido-lineas">
          <ListadoSemiControlado<LineaDevolucionPedido>
            metaTabla={metaTablaLineas}
            tarjeta={(linea) => (
              <TarjetaLineaDevolucion
                linea={linea}
                error={ctx.erroresLineas[linea.id]}
                onCantidadOkCambiada={(valor) =>
                  emitir("cantidad_ok_cambiada", {
                    idLinea: linea.id,
                    valor,
                  })
                }
                onCantidadKoCambiada={(valor) =>
                  emitir("cantidad_ko_cambiada", {
                    idLinea: linea.id,
                    valor,
                  })
                }
                onLimpiar={() =>
                  emitir("cantidades_limpiadas", { idLinea: linea.id })
                }
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

          {hayErroresLineas && (
            <p className="detalle-devolucion-error-lineas">
              Revisa las cantidades: correcta + dañada no puede superar la
              cantidad de la línea.
            </p>
          )}
        </div>
      </div>

      <QModalConfirmacion
        nombre="confirmar_preparar_devolucion"
        abierto={confirmandoPreparar}
        titulo="Confirmar preparación"
        mensaje="Se va a preparar la devolución ¿Está seguro?"
        onCerrar={() => emitir("confirmacion_preparar_cancelada")}
        onAceptar={async () => {
          await emitir("devolucion_preparada");
          await cerrarDetalle();
        }}
        labelAceptar="Confirmar"
      />
    </Detalle>
  );
};
