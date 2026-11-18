import { MetaTabla } from "@olula/componentes/index.js";
import { Listado } from "@olula/componentes/maestro/Listado.js";
import { MaestroDetalle } from "@olula/componentes/maestro/MaestroDetalle.tsx";
import { ClausulaFiltro, Criteria, EmitirEvento, Entidad, Orden } from "@olula/lib/diseño.ts";
import { ComponentType, ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { criteriaDocumentos, efectoEvento } from "./dominio.ts";
import "./DocumentosTercero.css";

type Respuesta<T> = { datos: T[]; total: number };

export interface DocumentosTerceroProps<T extends Entidad> {
    /** Lista del módulo (getPedidos, getRecibosVenta...) a partir de un criteria. */
    cargar: (criteria: Criteria) => Promise<Respuesta<T>>;
    /** Filtro fijo: el cliente o proveedor y, si acaso, el estado. */
    filtro: ClausulaFiltro[];
    orden: Orden;
    metaTabla: MetaTabla<T>;
    tarjeta?: (entidad: T) => ReactNode;
    /** Ficha del documento, la misma que en su pantalla. */
    Detalle: ComponentType<{ id?: string; publicar: EmitirEvento }>;
    /** Controles encima de la lista (p. ej. «Sólo pendientes»). */
    controles?: ReactNode;
    className?: string;
}

/**
 * Documentos de un cliente o proveedor dentro de su ficha. Se monta al pulsar
 * su pestaña, así que sólo entonces pide los datos. Al pulsar un documento se
 * abre su ficha en una ventana; si se cambia o se borra, la lista se recarga.
 */
export const DocumentosTercero = <T extends Entidad>({
    cargar, filtro, orden, metaTabla, tarjeta, Detalle, controles, className,
}: DocumentosTerceroProps<T>) => {
    const claveFiltro = JSON.stringify([filtro, orden]);
    const [criteria, setCriteria] = useState<Criteria>(() => criteriaDocumentos(filtro, orden));
    const [lista, setLista] = useState<T[]>([]);
    const [total, setTotal] = useState(0);
    const [activo, setActivo] = useState<string | undefined>(undefined);
    const [cargando, setCargando] = useState(true);
    const peticion = useRef(0);

    const pedir = useCallback(async (nuevo: Criteria, ampliar = false) => {
        const numero = ++peticion.current;
        setCargando(true);
        try {
            const r = await cargar(nuevo);
            if (numero !== peticion.current) return;
            setLista((prev) => (ampliar ? [...prev, ...r.datos] : r.datos));
            if (r.total !== -1) setTotal(r.total);
        } finally {
            if (numero === peticion.current) setCargando(false);
        }
    }, [cargar]);

    // Cambia el filtro fijo (otro tercero o «Sólo pendientes»): vuelve a la primera página.
    useEffect(() => {
        const inicial = criteriaDocumentos(filtro, orden);
        setCriteria(inicial);
        setActivo(undefined);
        pedir(inicial);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [claveFiltro, pedir]);

    // El filtro fijo no se puede quitar desde la lista: se reaplica siempre.
    const conFiltroFijo = (c: Criteria): Criteria => ({ ...c, filtro });

    const publicar: EmitirEvento = useCallback(async (evento: string) => {
        const efecto = efectoEvento(evento);
        if (efecto === "cerrar" || efecto === "recargar_y_cerrar") setActivo(undefined);
        if (efecto === "recargar" || efecto === "recargar_y_cerrar") {
            await pedir({ ...criteria, paginacion: criteriaDocumentos(filtro, orden).paginacion });
        }
    }, [criteria, filtro, orden, pedir]);

    return (
        <div className={`DocumentosTercero ${className ?? ""}`.trim()}>
            {controles && <div className="DocumentosTercero-controles">{controles}</div>}
            <MaestroDetalle<T>
                Maestro={
                    <Listado<T>
                        metaTabla={metaTabla}
                        tarjeta={tarjeta}
                        modoInicial="tabla"
                        modosDisponibles={tarjeta ? ["tabla", "tarjetas"] : ["tabla"]}
                        mostrarFiltros={false}
                        cargando={cargando}
                        criteria={criteria}
                        entidades={lista}
                        totalEntidades={total}
                        seleccionada={activo}
                        onSeleccion={setActivo}
                        onCriteriaChanged={(c) => {
                            const nuevo = conFiltroFijo(c);
                            setCriteria(nuevo);
                            pedir(nuevo);
                        }}
                        onSiguientePagina={(c) => {
                            const nuevo = conFiltroFijo(c);
                            setCriteria(nuevo);
                            pedir(nuevo, true);
                        }}
                    />
                }
                Detalle={<Detalle id={activo} publicar={publicar} />}
                seleccionada={activo}
                modoDisposicion="modal"
                onCerrarDetalle={() => setActivo(undefined)}
            />
        </div>
    );
};
