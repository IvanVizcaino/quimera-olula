import { getLoteSugerido } from "#/almacen/albaran_venta/infraestructura.ts";
import { Lote } from "#/almacen/comun/componentes/Lote.tsx";
import { ArticuloLinea } from "#/compras/comun/componentes/articulo_linea/ArticuloLinea.tsx";
import { GrupoIvaProducto } from "#/ventas/comun/componentes/grupo_iva_producto.tsx";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QModal } from "@olula/componentes/index.js";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { plugin } from "@olula/lib/dominio.ts";
import { useForm } from "@olula/lib/useForm.ts";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Factura, LineaFactura, MovimientoLote } from "../diseño.ts";
import { lineaDeAlbaran, metaLineaFactura, modeloLineaFactura } from "../dominio.ts";
import { patchLineaFactura } from "../infraestructura.ts";
import "./CambiarLineaFactura.css";

const FilaMovimiento = ({
    movimiento,
    publicar,
}: {
    movimiento: MovimientoLote;
    publicar: EmitirEvento;
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

export const CambiarLineaFactura = ({
    factura,
    linea,
    publicar,
}: {
    factura: Factura;
    linea: LineaFactura;
    publicar: EmitirEvento;
}) => {
    const inicial = useMemo(() => modeloLineaFactura(linea), [linea.id, linea.movimientos]);
    const { modelo, uiProps, valido, set } = useModelo(metaLineaFactura, inicial);

    const [mostrarMas, setMostrarMas] = useState(false);
    const [mostrandoFormularioLote, setMostrandoFormularioLote] = useState(false);
    const [nuevoLoteId, setNuevoLoteId] = useState("");
    const [nuevaCantidad, setNuevaCantidad] = useState("");

    const cambiar_ = useCallback(async () => {
        await patchLineaFactura(factura.id, linea.id, modelo);
        publicar("linea_cambiada", linea.id);
    }, [modelo, factura.id, linea.id, publicar]);

    const cancelar_ = useCallback(
        () => publicar("cambio_de_linea_cancelado"),
        [publicar]
    );

    const [cambiar, cancelar] = useForm(cambiar_, cancelar_);

    const porLotes = linea.porLotes;
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
            nombre="cambiarLineaFacturaCompra"
            titulo="Cambiar línea"
            onCerrar={cancelar}
        >
            <div className="CambiarLineaFactura">
                {lineaDeAlbaran(linea) && (
                    <p className="aviso-linea-albaran">
                        {`Esta línea viene del albarán ${linea.codigoAlbaran ?? ""}.`}
                    </p>
                )}
                <quimera-formulario>
                    <ArticuloLinea
                        tipoArticulo={modelo.tipoArticulo}
                        referencia={modelo.referencia}
                        descripcionArticulo={modelo.descripcionArticulo}
                        descripcion={modelo.descripcion}
                        nombre="referenciaLineaFacturaCompra"
                        onChange={(cambios) => set({ ...modelo, ...cambios })}
                    />
                    <QInput label="Cantidad" {...uiProps("cantidad")} soloLectura={porLotes} />
                    <QInput label="Coste unitario" {...uiProps("pvpUnitario")} />

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
                                        nombre="nuevo_lote_id_compra_factura"
                                        sku={modelo.referencia ?? undefined}
                                        valor={nuevoLoteId}
                                        onChange={(opcion) => setNuevoLoteId(opcion?.valor ?? "")}
                                    />
                                    <QInput
                                        label="Cantidad"
                                        nombre="nueva_cantidad_lote_compra_factura"
                                        valor={nuevaCantidad}
                                        onChange={setNuevaCantidad}
                                    />
                                    <div className="lotes-formulario-botones">
                                        <QBoton
                                            tamaño="pequeño"
                                            onClick={crearLote}
                                            deshabilitado={!nuevoLoteId || !nuevaCantidad}
                                        >
                                            Crear
                                        </QBoton>
                                        <QBoton
                                            tamaño="pequeño"
                                            variante="borde"
                                            onClick={() => {
                                                setMostrandoFormularioLote(false);
                                                setNuevoLoteId("");
                                                setNuevaCantidad("");
                                            }}
                                        >
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
                            <QInput label="% Descuento" {...uiProps("dtoPorcentual")} />
                            <QInput label="Descuento lineal" {...uiProps("dtoLineal")} />
                            <GrupoIvaProducto {...uiProps("grupoIvaProductoId")} />
                            <QInput label="% IVA" {...uiProps("tipoIva")} soloLectura />
                            <QInput label="% I.R.P.F." {...uiProps("tipoIrpf")} />
                        </>
                    )}
                </quimera-formulario>
                <div className="botones maestro-botones">
                    <QBoton onClick={cambiar} deshabilitado={!valido}>
                        Cambiar
                    </QBoton>
                </div>
            </div>
        </QModal>
    );
};
