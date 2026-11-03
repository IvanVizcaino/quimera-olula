import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QEtiqueta } from "@olula/componentes/atomos/qetiqueta.tsx";
import { QSelect } from "@olula/componentes/atomos/qselect.tsx";
import { MetaTabla } from "@olula/componentes/atomos/qtabla.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.js";
import { Listado } from "@olula/componentes/maestro/Listado.tsx";
import { MaestroDetalle } from "@olula/componentes/maestro/MaestroDetalle.tsx";
import { MetaFiltro } from "@olula/componentes/maestro/maestroFiltros/MaestroFiltrosActivoControlado.js";
import { listaActivaEntidadesInicial } from "@olula/lib/ListaActivaEntidades.js";
import { getUrlParams, useUrlParams } from "@olula/lib/url-params.js";
import { useEffect } from "react";
import { ItemOrdenAlmacen } from "../../diseño.ts";
import { CrearOrden } from "../crear/CrearOrden.tsx";
import { DetalleOrden } from "../detalle/DetalleOrden.tsx";
import { ContextoMaestroOrden, getMaquina } from "./maquina.ts";

const OPCIONES_RESPONSABLE = [
    { valor: "libres", descripcion: "Libres" },
    { valor: "mios", descripcion: "Míos" },
];

const OPCIONES_TIPO = [
    { valor: "ENTRADA", descripcion: "Entrada" },
    { valor: "SALIDA", descripcion: "Salida" },
    { valor: "TRASPASO", descripcion: "Traspaso" },
];

const metaFiltroOrden: MetaFiltro = {
    tipo: {
        id: "tipo",
        campo: "tipo",
        label: "Tipo",
        filtro: (valor) => {
            if (!valor || valor === "") return null;
            return ["tipo", "=", valor as string];
        },
        fromFiltro: (filtro) => {
            const clausula = filtro.find(c => c[0] === "tipo");
            if (!clausula) return "";
            return clausula[2] ?? "";
        },
        render: (valor, onChange) => (
            <QSelect
                label="Tipo"
                nombre="tipo"
                valor={(valor as string) ?? ""}
                onChange={(opcion) => onChange(opcion?.valor ?? "")}
                opciones={OPCIONES_TIPO}
                placeholder="Todos"
            />
        ),
    },
    responsable: {
        id: "responsable",
        campo: "responsable_id",
        label: "Responsable",
        filtro: (valor) => {
            if (!valor || valor === "") return null;
            if (valor === "libres") return ["responsable_id", "null"];
            if (valor === "mios") {
                const whoamiRaw = localStorage.getItem("whoami");
                const usuarioId = whoamiRaw
                    ? (JSON.parse(whoamiRaw) as { usuario_id: string }).usuario_id
                    : null;
                if (!usuarioId) return null;
                return ["responsable_id", "=", usuarioId];
            }
            return null;
        },
        fromFiltro: (filtro) => {
            const clausula = filtro.find(c => c[0] === "responsable_id");
            if (!clausula) return "";
            if (clausula[1] === "null") return "libres";
            return "mios";
        },
        render: (valor, onChange) => (
            <QSelect
                label="Responsable"
                nombre="responsable"
                valor={(valor as string) ?? ""}
                onChange={(opcion) => onChange(opcion?.valor ?? "")}
                opciones={OPCIONES_RESPONSABLE}
                placeholder="Todos"
            />
        ),
    },
};

const metaTablaOrden: MetaTabla<ItemOrdenAlmacen> = [
    { id: "id", cabecera: "ID" },
    { id: "descripcion", cabecera: "Orden" },
    { id: "fecha", cabecera: "Fecha", tipo:"fecha" },
    { id: "estado", cabecera: "Estado", render: (orden: ItemOrdenAlmacen) => {
        const variante = orden.estado === "PENDIENTE" ? "error" : orden.estado === "EN_CURSO" ? "advertencia" : "exito";
        return <QEtiqueta variante={variante}>{orden.estado}</QEtiqueta>;
    }},
    { id: "idResponsable", cabecera: "Responsable"},
];

export const MaestroOrden = () => {
    const { id, criteria } = getUrlParams();

    const { ctx, emitir } = useMaquina(getMaquina, {
        estado: "INICIAL",
        ordenes: listaActivaEntidadesInicial<ItemOrdenAlmacen>(id, criteria),
    } as ContextoMaestroOrden);

    useUrlParams(ctx.ordenes.activo, ctx.ordenes.criteria);

    useEffect(() => {
        emitir("recarga_solicitada", ctx.ordenes.criteria);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="OrdenAlmacen">
            <MaestroDetalle<ItemOrdenAlmacen>
                seleccionada={ctx.ordenes.activo}
                modoDisposicion="maestro-50"
                Maestro={
                    <>
                        <h2>Órdenes</h2>
                        <Listado<ItemOrdenAlmacen>
                            metaTabla={metaTablaOrden}
                            metaFiltro={metaFiltroOrden}
                            criteria={ctx.ordenes.criteria}
                            modoInicial="tabla"
                            tarjeta={TarjetaOrdenAlmacen}
                            entidades={ctx.ordenes.lista}
                            totalEntidades={ctx.ordenes.total}
                            seleccionada={ctx.ordenes.activo}
                            renderAcciones={() => (
                                <div className="maestro-botones">
                                    <QBoton onClick={() => emitir("crear_modulo_solicitado")}>
                                        Nueva orden
                                    </QBoton>
                                </div>
                            )}
                            onSeleccion={(payload) =>
                                emitir("orden_seleccionada", payload)
                            }
                            onCriteriaChanged={(payload) =>
                                emitir("criteria_cambiado", payload)
                            }
                        />
                    </>
                }
                Detalle={
                    <DetalleOrden
                        id={ctx.ordenes.activo}
                        publicar={emitir}
                    />
                }
            />
            {ctx.estado === "CREANDO" && (
                <CrearOrden publicar={emitir} />
            )}
        </div>
    );
};

const TarjetaOrdenAlmacen = (orden: ItemOrdenAlmacen) => {
    return (
        <div className="tarjeta-orden" key={orden.id}>
            <div>{`${orden.tipo} - ${orden.fecha}`}</div>
            <div>{orden.estado}</div>
        </div>
    );
};
