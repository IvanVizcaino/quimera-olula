import { getLoteSugerido } from "#/almacen/albaran_venta/infraestructura.ts";
import { Lote } from "#/almacen/comun/componentes/Lote.tsx";
import { ArticuloLinea } from "#/ventas/comun/componentes/articulo_linea/ArticuloLinea.tsx";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QModal } from "@olula/componentes/index.js";
import { GrupoIvaProducto } from "@olula/ctx/ventas/comun/componentes/grupo_iva_producto.tsx";
import { plugin } from "@olula/lib/dominio.js";
import { ProcesarEvento } from "@olula/lib/useMaquina.js";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useCallback, useEffect, useMemo, useState } from "react";
import { LineaFactura as Linea, MovimientoLote } from "../diseño.ts";
import "./EditarLinea.css";
import { getModeloInicial, metaLinea, ModeloCambiarLinea } from "./dominio.ts";

const FilaMovimiento = ({
  movimiento,
  publicar,
}: {
  movimiento: MovimientoLote;
  publicar: ProcesarEvento;
}) => (
  <tr>
    <td>{movimiento.loteId}</td>
    <td className="lotes-num">{movimiento.cantidad}</td>
    <td>
      <QBoton
        tamaño="pequeño"
        onClick={() =>
          publicar("borrar_movimiento_lote_solicitado", {
            movimiento_id: movimiento.id,
          })
        }
      >
        Borrar
      </QBoton>
    </td>
  </tr>
);

export const EditarLinea = ({
  publicar,
  linea,
}: {
  linea: Linea;
  publicar: ProcesarEvento;
}) => {
  const modeloInicial = useMemo(() => getModeloInicial(linea), [linea.id, linea.movimientos]);

  const { modelo, uiProps, valido, set } = useModelo<ModeloCambiarLinea>(metaLinea, modeloInicial);

  const [cambiando, setCambiando] = useState(false);
  const [mostrarMas, setMostrarMas] = useState(false);
  const [mostrandoFormularioLote, setMostrandoFormularioLote] = useState(false);
  const [nuevoLoteId, setNuevoLoteId] = useState("");
  const [nuevaCantidad, setNuevaCantidad] = useState("");

  const cambiar = () => {
    setCambiando(true);
    publicar("linea_actualizada", modelo);
  };

  const cancelar = useCallback(() => {
    if (!cambiando) publicar("editar_linea_cancelado");
  }, [cambiando, publicar]);

  const libre = modelo.tipoArticulo === "libre";
  const porLotes = !!linea.porLotes;
  const movimientos = linea.movimientos ?? [];
  const trazabilidadActiva = plugin("trazabilidad") === "activa";

  useEffect(() => {
    if (!trazabilidadActiva || !porLotes || movimientos.length > 0) return;
    const referencia = modelo.referencia;
    if (!referencia) return;
    getLoteSugerido(referencia).then((codlote) => {
      if (codlote) {
        setNuevoLoteId(codlote);
        setMostrandoFormularioLote(true);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const crearLote = useCallback(() => {
    const cantidad = parseFloat(nuevaCantidad);
    if (!nuevoLoteId || isNaN(cantidad) || cantidad <= 0) return;
    publicar("crear_movimiento_lote_solicitado", {
      lote_id: nuevoLoteId,
      cantidad,
    });
    setMostrandoFormularioLote(false);
    setNuevoLoteId("");
    setNuevaCantidad("");
  }, [publicar, nuevoLoteId, nuevaCantidad]);

  return (
    <QModal
      abierto={true}
      nombre="editar_linea_factura"
      titulo="Editar línea"
      onCerrar={cancelar}
    >
      <div className="EdicionLinea">
        <quimera-formulario>
          <ArticuloLinea
            tipoArticulo={modelo.tipoArticulo}
            idArticulo={modelo.referencia}
            descripcionArticulo={modelo.descripcionArticulo}
            descripcion={modelo.descripcion}
            nombre="referencia_cambiar_linea_factura"
            onChange={(cambios) => set({ ...modelo, ...cambios })}
            bloqueado={true}
          />

          <QInput label="Cantidad" {...uiProps("cantidad")} soloLectura={porLotes} />

          <QInput label="Precio" {...uiProps("pvp_unitario")} />

          {trazabilidadActiva && porLotes && (
            <div className="lotes-seccion">
              <div className="lotes-cabecera">
                <span className="lotes-titulo">Lotes</span>
                {!mostrandoFormularioLote && (
                  <QBoton
                    tamaño="pequeño"
                    onClick={() => setMostrandoFormularioLote(true)}
                  >
                    + Añadir lote
                  </QBoton>
                )}
              </div>

              {mostrandoFormularioLote && (
                <div className="lotes-formulario">
                  <Lote
                    label="Lote"
                    nombre="nuevo_lote_id_factura_venta"
                    sku={modelo.referencia ?? undefined}
                    valor={nuevoLoteId}
                    onChange={(opcion) => setNuevoLoteId(opcion?.valor ?? "")}
                  />
                  <QInput
                    label="Cantidad"
                    nombre="nueva_cantidad_lote_factura_venta"
                    valor={nuevaCantidad}
                    onChange={setNuevaCantidad}
                  />
                  <div className="lotes-formulario-botones">
                    <QBoton tamaño="pequeño" onClick={crearLote} deshabilitado={!nuevoLoteId || !nuevaCantidad}>
                      Crear
                    </QBoton>
                    <QBoton tamaño="pequeño" variante="borde" onClick={() => {
                      setMostrandoFormularioLote(false);
                      setNuevoLoteId("");
                      setNuevaCantidad("");
                    }}>
                      Cancelar
                    </QBoton>
                  </div>
                </div>
              )}

              {movimientos.length > 0 && (
                <table className="lotes-tabla">
                  <thead>
                    <tr>
                      <th>Lote</th>
                      <th className="lotes-num">Cantidad</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {movimientos.map((m) => (
                      <FilaMovimiento
                        key={m.id}
                        movimiento={m}
                        publicar={publicar}
                      />
                    ))}
                  </tbody>
                </table>
              )}

              {movimientos.length === 0 && !mostrandoFormularioLote && (
                <p className="lotes-vacio">Sin movimientos de lote.</p>
              )}
            </div>
          )}

          <div className="mostrar-mas-fila">
            <button
              type="button"
              className="mostrar-mas-btn"
              onClick={() => setMostrarMas((v) => !v)}
            >
              {mostrarMas ? "▲ Menos opciones" : "▼ Más opciones"}
            </button>
          </div>

          {mostrarMas && (
            <>
              <QInput label="% Descuento" {...uiProps("dto_porcentual")} />
              <QInput label="Dto. lineal" {...uiProps("dto_lineal")} />
              <GrupoIvaProducto {...uiProps("grupo_iva_producto_id")} soloLectura={!libre} />
              <QInput label="% IVA" {...uiProps("tipo_iva")} soloLectura />
              <QInput label="% I.R.P.F." {...uiProps("tipo_irpf")} />
              <QInput label="% Comisión agente" {...uiProps("por_comision")} />
              <QInput label="Importe comisión" {...uiProps("importe_comision")} />
            </>
          )}
        </quimera-formulario>

        <div className="botones maestro-botones ">
          <QBoton onClick={cambiar} deshabilitado={!valido}>
            Guardar
          </QBoton>
        </div>
      </div>
    </QModal>
  );
};
