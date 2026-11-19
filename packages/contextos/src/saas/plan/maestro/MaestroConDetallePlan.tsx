import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QEtiqueta } from "@olula/componentes/atomos/qetiqueta.tsx";
import { QTabla } from "@olula/componentes/atomos/qtabla.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.ts";
import { MetaTabla } from "@olula/componentes/index.js";
import { MaestroDetalle } from "@olula/componentes/maestro/MaestroDetalle.tsx";
import { useEffect, useMemo } from "react";
import { CrearPlan } from "../crear/CrearPlan.js";
import { DetallePlan } from "../detalle/DetallePlan.js";
import { Plan } from "../diseño.js";
import { contextoMaestroPlanInicial } from "./maestro.js";
import { getMaquina } from "./maquina.js";

const metaTablaPlan: MetaTabla<Plan> = [
    { id: "nombre", cabecera: "Nombre", estilo: "destacado" },
    { id: "precioMensual", cabecera: "Mensual", tipo: "moneda" },
    { id: "precioAnual", cabecera: "Anual", tipo: "moneda" },
    {
        id: "publico",
        cabecera: "Visibilidad",
        render: (p: Plan) => (
            <QEtiqueta variante={p.publico ? "exito" : "neutro"}>{p.publico ? "Público" : "Privado"}</QEtiqueta>
        ),
    },
    {
        id: "activo",
        cabecera: "Estado",
        render: (p: Plan) => (
            <QEtiqueta variante={p.activo ? "exito" : "gris"}>{p.activo ? "Activo" : "Archivado"}</QEtiqueta>
        ),
    },
    {
        id: "destacado",
        cabecera: "Destacado",
        render: (p: Plan) => (p.destacado ? <QEtiqueta variante="primario">Destacado</QEtiqueta> : ""),
    },
];

export const MaestroConDetallePlan = () => {
    const { ctx, emitir } = useMaquina(getMaquina, contextoMaestroPlanInicial);
    const { estado, planes, catalogo, activo } = ctx;

    useEffect(() => {
        emitir("recarga_de_planes_solicitada");
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Las columnas de precio leen precio.mensual / precio.anual.
    const filas = useMemo(
        () => planes.map((p) => ({ ...p, precioMensual: p.precio.mensual, precioAnual: p.precio.anual })),
        [planes]
    );
    const planActivo = planes.find((p) => p.id === activo);
    const idsExistentes = useMemo(() => planes.map((p) => p.id), [planes]);

    return (
        <div className="Plan">
            <MaestroDetalle<Plan>
                Maestro={
                    <>
                        <h2>Planes</h2>
                        <div className="maestro-botones">
                            <QBoton onClick={() => emitir("crear_plan_solicitado")} deshabilitado={!catalogo}>
                                Nuevo plan
                            </QBoton>
                            <QBoton variante="borde" onClick={() => emitir("recarga_de_planes_solicitada")}>
                                Recargar
                            </QBoton>
                        </div>
                        <QTabla<Plan>
                            metaTabla={metaTablaPlan}
                            datos={filas}
                            totalEntidades={filas.length}
                            cargando={false}
                            orden={[]}
                            seleccionadaId={activo ?? undefined}
                            onSeleccion={(p) => emitir("plan_seleccionado", p)}
                        />
                    </>
                }
                Detalle={
                    planActivo && catalogo
                        ? <DetallePlan plan={planActivo} catalogo={catalogo} idsExistentes={idsExistentes} publicar={emitir} />
                        : null
                }
                seleccionada={activo ?? undefined}
                modoDisposicion="maestro-50"
            />

            {estado === "CREANDO" && catalogo && (
                <CrearPlan publicar={emitir} catalogo={catalogo} idsExistentes={idsExistentes} />
            )}
        </div>
    );
};
