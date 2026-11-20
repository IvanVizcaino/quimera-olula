import { QAviso } from "@olula/componentes/atomos/qaviso.tsx";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QEtiqueta } from "@olula/componentes/atomos/qetiqueta.tsx";
import { Detalle } from "@olula/componentes/detalle/Detalle.tsx";
import { Tab, Tabs } from "@olula/componentes/detalle/tabs/Tabs.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.js";
import { QuimeraAcciones } from "@olula/componentes/moleculas/qacciones.tsx";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { useMemo, useState } from "react";
import { Catalogo } from "../../catalogo/diseño.js";
import { BorrarPlan } from "../borrar/BorrarPlan.js";
import { Plan } from "../diseño.js";
import { completarPlan, planModificado, problemasPlan } from "../dominio.js";
import { DuplicarPlan } from "../duplicar/DuplicarPlan.js";
import { contextoDetallePlanInicial } from "./detalle.js";
import "./DetallePlan.css";
import { getMaquina } from "./maquina.js";
import { TabGeneralPlan } from "./TabGeneralPlan.js";
import { TabLimitesPlan } from "./TabLimitesPlan.js";
import { TabModulosPlan } from "./TabModulosPlan.js";
import { TabVistaPreviaPlan } from "./TabVistaPreviaPlan.js";

export const DetallePlan = ({
    plan,
    catalogo,
    idsExistentes,
    publicar = async () => {},
}: {
    plan: Plan;
    catalogo: Catalogo;
    idsExistentes: string[];
    publicar?: EmitirEvento;
}) => {
    const { ctx, emitir } = useMaquina(getMaquina, contextoDetallePlanInicial, publicar);

    // El borrador se reinicia cuando llega otro plan (o el mismo guardado).
    const guardado = useMemo(() => completarPlan(plan, catalogo), [plan, catalogo]);
    const [borrador, setBorrador] = useState<Plan>(guardado);
    const [origen, setOrigen] = useState<Plan>(guardado);
    if (origen !== guardado) {
        setOrigen(guardado);
        setBorrador(guardado);
    }

    const modificado = planModificado(guardado, borrador);
    const problemas = problemasPlan(borrador);
    const { estado } = ctx;

    const acciones = [
        {
            texto: "Duplicar",
            onClick: () => emitir("duplicar_solicitado"),
        },
        {
            texto: plan.activo ? "Archivar" : "Reactivar",
            onClick: () => emitir("archivar_solicitado", { id: plan.id, activo: !plan.activo }),
            deshabilitado: modificado,
        },
        {
            texto: "Borrar",
            onClick: () => emitir("borrar_solicitado"),
            advertencia: true,
        },
    ];

    return (
        <Detalle
            id={plan.id}
            obtenerTitulo={(p: Plan) => `${p.id} · ${p.nombre}`}
            setEntidad={() => {}}
            entidad={plan}
            cerrarDetalle={() => emitir("plan_deseleccionado", null, true)}
        >
            <div className="DetallePlan">
                <div className="estado-plan">
                    <QEtiqueta variante={plan.activo ? "exito" : "gris"}>{plan.activo ? "Activo" : "Archivado"}</QEtiqueta>
                    {modificado && <QEtiqueta variante="advertencia">Cambios sin guardar</QEtiqueta>}
                </div>

                <QAviso variante="info" className="aviso-precio">
                    Cambiar un precio no cambia lo que pagan las empresas que ya tienen el plan.
                </QAviso>

                <div className="maestro-botones">
                    <QBoton onClick={() => emitir("guardar_solicitado", borrador)}
                        deshabilitado={!modificado || problemas.length > 0}>
                        Guardar
                    </QBoton>
                    {modificado && (
                        <QBoton variante="borde" onClick={() => setBorrador(guardado)}>Descartar cambios</QBoton>
                    )}
                    <QuimeraAcciones acciones={acciones} vertical />
                </div>
                {problemas.length > 0 && (
                    <ul className="problemas-plan">
                        {problemas.map((p) => <li key={p}>{p}</li>)}
                    </ul>
                )}

                <Tabs children={[
                    <Tab label="General" key="tab-general"
                        children={<TabGeneralPlan plan={borrador} onChange={setBorrador} />}
                    />,
                    <Tab label="Módulos" key="tab-modulos"
                        children={<TabModulosPlan plan={borrador} modulos={catalogo.modulos} onChange={setBorrador} />}
                    />,
                    <Tab label="Límites" key="tab-limites"
                        children={<TabLimitesPlan plan={borrador} limites={catalogo.limites} onChange={setBorrador} />}
                    />,
                    <Tab label="Vista previa" key="tab-vista-previa"
                        children={<TabVistaPreviaPlan plan={borrador} guardado={plan} catalogo={catalogo} />}
                    />,
                ]} />
            </div>

            {estado === "BORRANDO" && <BorrarPlan plan={plan} publicar={emitir} />}
            {estado === "DUPLICANDO" && (
                <DuplicarPlan plan={guardado} idsExistentes={idsExistentes} publicar={emitir} />
            )}
        </Detalle>
    );
};
