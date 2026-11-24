import { EtiquetaEstado } from "#/comun/componentes/etiqueta_estado/EtiquetaEstado.tsx";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QTabla } from "@olula/componentes/atomos/qtabla.tsx";
import { MetaTabla } from "@olula/componentes/index.js";
import { QModalConfirmacion } from "@olula/componentes/moleculas/qmodalconfirmacion.tsx";
import { ContextoError } from "@olula/lib/contexto.ts";
import { Entidad } from "@olula/lib/diseño.ts";
import { useContext, useState } from "react";
import { AccionesCicloVida, cabeAccion, motivoAccion } from "../../comun/ciclo_vida.ts";
import { fechaDdMmAaaa } from "../../comun/dominio.ts";
import { FormLoteOrden, LoteOrden, OrdenProduccion, ReservaLote } from "../diseño.ts";
import {
    cambiosLote,
    COMANDO,
    etiquetaEstadoOrden,
    formatearCantidad,
    formDesdeLote,
    loteUnico,
    nuevoLoteVacio,
    puedeAnadirLote,
} from "../dominio.ts";
import { deleteLoteOrden, patchLoteOrden, postLoteOrden } from "../infraestructura.ts";
import { ModalLoteOrden } from "./ModalLoteOrden.tsx";

const metaTablaLotes: MetaTabla<LoteOrden> = [
    { id: "id", cabecera: "Lote", estilo: "secundario" },
    { id: "articuloId", cabecera: "Artículo", render: (l) => `${l.articuloId} - ${l.descripcion}` },
    { id: "cantidad", cabecera: "Cantidad", render: (l) => formatearCantidad(l.cantidad) },
    { id: "cantidadTotal", cabecera: "Fabricado", render: (l) => formatearCantidad(l.cantidadTotal) },
    { id: "fechaFabricacion", cabecera: "Fabricación", render: (l) => fechaDdMmAaaa(l.fechaFabricacion) },
    { id: "estado", cabecera: "Estado", render: (l) => <EtiquetaEstado {...etiquetaEstadoOrden(l.estado)} /> },
];

type FilaReserva = Entidad & ReservaLote & { id: string };

const metaTablaReservas: MetaTabla<FilaReserva> = [
    { id: "pedidoId", cabecera: "Pedido", render: (r) => r.pedidoId || "—" },
    { id: "lineaPedidoId", cabecera: "Línea", estilo: "secundario" },
    { id: "cantidad", cabecera: "Cantidad", render: (r) => formatearCantidad(r.cantidad) },
];

/** Las líneas de pedido que cubre el lote (`pr_reservaslotepedido`), si tiene. */
const ReservasLote = ({ lote }: { lote: LoteOrden }) =>
    lote.reservas.length === 0 ? null : (
        <div className="ReservasLote">
            <h4 className="subtitulo-lote">Reservas de pedidos{lote.id ? ` del lote ${lote.id}` : ""}</h4>
            <QTabla<FilaReserva>
                metaTabla={metaTablaReservas}
                datos={lote.reservas.map((r) => ({ ...r, id: r.lineaPedidoId }))}
                cargando={false}
                orden={[]}
            />
        </div>
    );

type Edicion = { titulo: string; lote: LoteOrden | null; inicial: FormLoteOrden };

/**
 * El lote de la orden. Una orden, un lote: si no tiene, «Añadir lote»; si tiene uno, sus datos
 * con «Cambiar lote» y «Quitar lote»; las órdenes antiguas con varios lotes los listan sin editar.
 */
export const LoteOrdenProduccion = ({
    orden,
    acciones,
    recargar,
}: {
    orden: OrdenProduccion;
    acciones: AccionesCicloVida | null;
    recargar: () => Promise<void>;
}) => {
    const { intentar } = useContext(ContextoError);
    const [edicion, setEdicion] = useState<Edicion | null>(null);
    const [quitando, setQuitando] = useState<LoteOrden | null>(null);
    // Los lotes solo se tocan con la orden pendiente y sin lanzar.
    const pendiente = orden.estado === "PTE" && !orden.lanzada;
    const lote = loteUnico(orden);

    const guardar = async (form: FormLoteOrden) => {
        if (!edicion) return;
        try {
            if (edicion.lote) {
                const cambios = cambiosLote(edicion.lote, form);
                if (Object.keys(cambios).length > 0) await patchLoteOrden(orden.id, edicion.lote.id, cambios);
            } else {
                await postLoteOrden(orden.id, form);
            }
            setEdicion(null);
        } catch (error) {
            // P. ej. 409: la orden ya no está pendiente; se cierra y se ve cómo está.
            setEdicion(null);
            throw error;
        } finally {
            await recargar();
        }
    };

    const quitar = async () => {
        if (!quitando) return;
        const loteId = quitando.id;
        setQuitando(null);
        try {
            await intentar(() => deleteLoteOrden(orden.id, loteId));
        } catch {
            // `intentar` ya muestra el error (p. ej. 409 si la orden ya no está pendiente).
        } finally {
            await recargar();
        }
    };

    return (
        <div className="LoteOrdenProduccion">
            {orden.lotes.length === 0 && (
                <div className="sin-lote">
                    <p className="nota-orden">La orden no tiene lote.</p>
                    {puedeAnadirLote(orden, acciones) && (
                        <div className="maestro-botones">
                            <QBoton onClick={() => setEdicion({ titulo: "Añadir lote", lote: null, inicial: nuevoLoteVacio() })}>
                                Añadir lote
                            </QBoton>
                        </div>
                    )}
                </div>
            )}

            {lote && (
                <>
                    <div className="maestro-botones">
                        <QBoton
                            deshabilitado={!cabeAccion(acciones, COMANDO.cambiarLote, pendiente)}
                            onClick={() => setEdicion({ titulo: `Cambiar lote ${lote.id}`, lote, inicial: formDesdeLote(lote) })}
                        >
                            Cambiar lote
                        </QBoton>
                        <QBoton
                            destructivo
                            deshabilitado={!cabeAccion(acciones, COMANDO.quitarLote, pendiente)}
                            onClick={() => setQuitando(lote)}
                        >
                            Quitar lote
                        </QBoton>
                    </div>
                    {!cabeAccion(acciones, COMANDO.cambiarLote, pendiente) && (
                        <p className="nota-orden">
                            {motivoAccion(acciones, COMANDO.cambiarLote) ?? "El lote solo se cambia con la orden pendiente y sin lanzar."}
                        </p>
                    )}
                    <quimera-formulario>
                        <QInput label="Lote" nombre="lote_id" valor={lote.id} soloLectura />
                        <QInput label="Artículo" nombre="lote_articulo" valor={`${lote.articuloId} - ${lote.descripcion}`} soloLectura />
                        <QInput label="Cantidad" nombre="lote_cantidad" valor={formatearCantidad(lote.cantidad)} soloLectura />
                        <QInput label="Cantidad programada" nombre="lote_programada"
                            valor={formatearCantidad(lote.cantidadProgramada)} soloLectura />
                        <QInput label="Fabricado" nombre="lote_total" valor={formatearCantidad(lote.cantidadTotal)} soloLectura />
                        <QInput label="Fecha de fabricación" nombre="lote_fecha"
                            valor={fechaDdMmAaaa(lote.fechaFabricacion)} soloLectura />
                        <div className="estado-lote">
                            <span className="etiqueta-campo">Estado del lote</span>
                            <EtiquetaEstado {...etiquetaEstadoOrden(lote.estado)} />
                        </div>
                    </quimera-formulario>
                    <ReservasLote lote={lote} />
                </>
            )}

            {orden.lotes.length > 1 && (
                <>
                    <p className="nota-orden">
                        Orden con varios lotes (anterior a la regla de un lote por orden): se consultan, pero no se cambian aquí.
                    </p>
                    <QTabla<LoteOrden> metaTabla={metaTablaLotes} datos={orden.lotes} cargando={false} orden={[]} />
                    {orden.lotes.map((l) => <ReservasLote key={l.id} lote={l} />)}
                </>
            )}

            {edicion && (
                <ModalLoteOrden
                    titulo={edicion.titulo}
                    inicial={edicion.inicial}
                    descripcionArticulo={edicion.lote ? edicion.lote.descripcion : undefined}
                    guardar={guardar}
                    cerrar={() => setEdicion(null)}
                />
            )}

            {quitando && (
                <QModalConfirmacion
                    nombre="quitarLoteOrden"
                    abierto={true}
                    titulo="Quitar lote"
                    mensaje={`¿Quitar el lote ${quitando.id} (${formatearCantidad(quitando.cantidad)} de ${quitando.articuloId}) de la orden? Se borra el lote.`}
                    onCerrar={() => setQuitando(null)}
                    onAceptar={quitar}
                />
            )}
        </div>
    );
};
