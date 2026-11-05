import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QEtiqueta } from "@olula/componentes/atomos/qetiqueta.tsx";
import { MetaTabla } from "@olula/componentes/atomos/qtablacontrolada.tsx";
import { ListadoSemiControlado } from "@olula/componentes/maestro/ListadoSemiControlado.tsx";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { criteriaDefecto, plugin } from "@olula/lib/dominio.js";
import { ContextoError } from "@olula/lib/contexto.ts";
import { useContext } from "react";
import { LecturaLineaOrden, LineaOrdenAlmacen, OrdenAlmacen } from "../../../diseño.ts";
import { deleteLecturaOrden } from "../../../infraestructura.ts";

const formatearFechaHoraLectura = (fechaHora: Date | string): string => {
    const d = fechaHora instanceof Date ? fechaHora : new Date(fechaHora);
    return isNaN(d.getTime()) ? String(fechaHora) : d.toLocaleString();
};

const ExpansionLecturas = (orden: OrdenAlmacen, publicar: EmitirEvento) => {
    const Componente = ({ entidad }: { entidad: LineaOrdenAlmacen }) => {
        const { intentar } = useContext(ContextoError);
        const sgaActivo = plugin("sga") === "activo";
        const lecturas: LecturaLineaOrden[] = entidad.lecturas ?? [];
        if (!lecturas.length) return <p>Sin lecturas</p>;
        return (
            <table>
                <thead>
                    <tr>
                        <th>Lote</th>
                        <th>Cantidad</th>
                        <th>Fecha/Hora</th>
                        {sgaActivo && orden.tipo !== "ENTRADA" && <th>Ubi.Origen</th>}
                        {sgaActivo && orden.tipo !== "ENTRADA" && <th>Caja Origen</th>}
                        {sgaActivo && orden.tipo !== "SALIDA" && <th>Ubi.Destino</th>}
                        {sgaActivo && orden.tipo !== "SALIDA" && <th>Caja Destino</th>}
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {lecturas.map((l) => (
                        <tr key={l.id}>
                            <td>{l.loteId}</td>
                            <td>{l.cantidad}</td>
                            <td>{formatearFechaHoraLectura(l.fechaHora)}</td>
                            {sgaActivo && orden.tipo !== "ENTRADA" && <td>{l.ubicacionOrigen}</td>}
                            {sgaActivo && orden.tipo !== "ENTRADA" && <td>{l.cajaOrigen}</td>}
                            {sgaActivo && orden.tipo !== "SALIDA" && <td>{l.ubicacionDestino}</td>}
                            {sgaActivo && orden.tipo !== "SALIDA" && <td>{l.cajaDestino}</td>}
                            <td>
                                <QBoton
                                    onClick={(e) => {
                                        e?.stopPropagation();
                                        intentar(async () => {
                                            await deleteLecturaOrden(orden.id, l.id);
                                            publicar("lectura_registrada");
                                        });
                                    }}
                                >
                                    Borrar
                                </QBoton>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        );
    };
    return Componente;
};

const metaTablaLineasOrden = (orden: OrdenAlmacen, publicar: EmitirEvento): MetaTabla<LineaOrdenAlmacen> => {
    const sgaActivo = plugin("sga") === "activo";
    return {
        cols: [
            { id: "sku", cabecera: "SKU" },
            { id: "articulo", cabecera: "Descripción", tipo: "texto" },
            { id: "loteId", cabecera: "Lote" },
            {
                id: "cantidadPrevista" as const,
                cabecera: "Cantidad",
                tipo: 'numero' as const,
                render: (linea: LineaOrdenAlmacen) => {
                    const prevista = linea.cantidadPrevista;
                    if (orden.tipo === "TRASPASO") {
                        const pick = (linea.cantidadPick ?? 0) + (linea.cantidadReal ?? 0);
                        const drop = linea.cantidadReal ?? 0;
                        const variantePick = pick === 0 ? "error" : pick < prevista ? "advertencia" : "exito";
                        const varianteDrop = drop === 0 ? "error" : drop < prevista ? "advertencia" : "exito";
                        return (
                            <span style={{ display: "flex", gap: "4px" }}>
                                {orden.pasosPick && <QEtiqueta variante={variantePick}>P {pick}/{prevista}</QEtiqueta>}
                                {orden.pasosDrop && <QEtiqueta variante={varianteDrop}>D {drop}/{prevista}</QEtiqueta>}
                            </span>
                        );
                    }
                    // Para órdenes con pasosPick (SALIDA pick-only), mostrar cantidadPick
                    const tienePick = !!(linea.pasosPick ?? orden.pasosPick);
                    if (tienePick) {
                        const pick = linea.cantidadPick ?? 0;
                        const variante = pick === 0 ? "error" : pick < prevista ? "advertencia" : "exito";
                        return (
                            <QEtiqueta variante={variante}>{pick} / {prevista}</QEtiqueta>
                        );
                    }
                    const real = linea.cantidadReal ?? 0;
                    const variante = real === 0 ? "error" : real < prevista ? "advertencia" : "exito";
                    return (
                        <QEtiqueta variante={variante}>{real} / {prevista}</QEtiqueta>
                    );
                },
            },
            ...(sgaActivo && orden.tipo !== "ENTRADA" ? [{ id: "ubicacionOrigen" as const, cabecera: "Ubi.Origen" }] : []),
            ...(sgaActivo && orden.tipo !== "ENTRADA" ? [{ id: "cajaOrigen" as const, cabecera: "LPN Origen" }] : []),
            ...(sgaActivo && orden.tipo !== "SALIDA" ? [{ id: "ubicacionDestino" as const, cabecera: "Ubi.Destino" }] : []),
            ...(sgaActivo && orden.tipo !== "SALIDA" ? [{ id: "cajaDestino" as const, cabecera: "LPN Destino" }] : []),
            {
                id: "acciones_pick",
                cabecera: "",
                render: (linea: LineaOrdenAlmacen) => {
                    const tienePick = !!(linea.pasosPick ?? orden.pasosPick);
                    if (!tienePick) return null;
                    const pickPendiente = (linea.cantidadPick ?? 0) < linea.cantidadPrevista;
                    return (
                        <QBoton
                            deshabilitado={!pickPendiente}
                            onClick={(e) => {
                                e?.stopPropagation();
                                publicar("lectura_guion_pick_linea_solicitada", linea);
                            }}
                        >
                            Leer pick
                        </QBoton>
                    );
                },
            },
            {
                id: "acciones_drop",
                cabecera: "",
                render: (linea: LineaOrdenAlmacen) => {
                    const tienePick = !!(linea.pasosPick ?? orden.pasosPick);
                    const pickCompleto = !tienePick || (linea.cantidadPick ?? 0) >= linea.cantidadPrevista;
                    return (
                        <QBoton
                            deshabilitado={!pickCompleto}
                            onClick={(e) => {
                                e?.stopPropagation();
                                publicar("lectura_guion_drop_linea_solicitada", linea);
                            }}
                        >
                            Leer drop
                        </QBoton>
                    );
                },
            },
        ],
        expansion: ExpansionLecturas(orden, publicar),
    };
};

export const LineasOrdenLista = ({
    orden,
    lineas,
    seleccionada,
    publicar,
}: {
    orden: OrdenAlmacen;
    lineas: LineaOrdenAlmacen[];
    seleccionada?: string;
    publicar: EmitirEvento;
}) => {
    const setSeleccionada = (linea: LineaOrdenAlmacen) => {
        publicar("linea_seleccionada", linea);
    };

    return (
        <ListadoSemiControlado
            metaTabla={metaTablaLineasOrden(orden, publicar)}
            entidades={lineas}
            totalEntidades={lineas.length}
            cargando={false}
            seleccionada={lineas.find((l) => l.id === seleccionada) ?? null}
            onSeleccion={setSeleccionada}
            criteriaInicial={criteriaDefecto}
            onCriteriaChanged={() => null}
            modo="tabla"
        />
    );
};
