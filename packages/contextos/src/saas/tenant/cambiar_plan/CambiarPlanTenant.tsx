import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QCheckbox } from "@olula/componentes/atomos/qcheckbox.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QSelect } from "@olula/componentes/atomos/qselect.tsx";
import { QModal } from "@olula/componentes/index.js";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { useForm } from "@olula/lib/useForm.js";
import { useCallback, useEffect, useState } from "react";
import { Catalogo } from "../../catalogo/diseño.js";
import { getCatalogo } from "../../catalogo/infraestructura.js";
import { formatearImporte } from "../../comun/dominio.js";
import { CambioPlan, DatosSuscripcion, Periodicidad } from "../suscripcion/diseño.js";
import {
    alternarModulo, cambiarCantidadExtra, cambiarPlanElegido, cambioInicial, modulosExtraDelPlan,
    normalizarCambio, planesSeleccionables,
} from "../suscripcion/dominio.js";
import { postSuscripcionTenant } from "../suscripcion/infraestructura.js";
import "./CambiarPlanTenant.css";

const FormularioCambioPlan = ({
    idTenant,
    datos,
    catalogo,
    publicar,
}: {
    idTenant: string;
    datos: DatosSuscripcion | null;
    catalogo: Catalogo;
    publicar: EmitirEvento;
}) => {
    const [cambio, setCambio] = useState<CambioPlan>(() => cambioInicial(datos, catalogo));
    const sinSuscripcion = !datos?.suscripcion;

    const plan = catalogo.planes.find((p) => p.id === cambio.planId);
    const extrasModulo = modulosExtraDelPlan(plan);
    const extrasActivos = catalogo.extras.filter((e) => e.activo);

    const cambiar_ = useCallback(
        async () => {
            await postSuscripcionTenant(idTenant, normalizarCambio(cambio, catalogo));
            publicar("plan_de_empresa_cambiado");
        },
        [idTenant, cambio, catalogo, publicar]
    );
    const cancelar_ = useCallback(() => publicar("cambio_de_plan_cancelado"), [publicar]);

    const [cambiar, cancelar] = useForm(cambiar_, cancelar_);

    return (
        <QModal abierto={true} nombre="cambiarPlanTenant"
            titulo={sinSuscripcion ? "Asignar plan" : "Cambiar plan"} onCerrar={cancelar}>
            <div className="CambiarPlanTenant">
                <quimera-formulario>
                    <QSelect label="Plan" nombre="planId" valor={cambio.planId}
                        opciones={planesSeleccionables(catalogo, datos?.suscripcion?.planId ?? null)
                            .map((p) => ({ valor: p.id, descripcion: `${p.nombre}${p.activo ? "" : " (archivado)"}` }))}
                        onChange={(o) => o && setCambio(cambiarPlanElegido(cambio, o.valor, catalogo))} />
                    <QSelect label="Periodicidad" nombre="periodicidad" valor={cambio.periodicidad}
                        opciones={[{ valor: "mensual", descripcion: "Mensual" }, { valor: "anual", descripcion: "Anual" }]}
                        onChange={(o) => o && setCambio({ ...cambio, periodicidad: o.valor as Periodicidad })} />
                    <QCheckbox label="Con prueba" nombre="conPrueba" valor={cambio.conPrueba}
                        onChange={(v) => setCambio({ ...cambio, conPrueba: v === "true" })} />

                    <h4>Módulos extra disponibles en este plan</h4>
                    {extrasModulo.length === 0 && <div className="ayuda">Este plan no admite módulos extra.</div>}
                    {extrasModulo.map((id) => {
                        const modulo = catalogo.modulos.find((m) => m.id === id);
                        const precio = plan?.modulos.find((m) => m.moduloId === id)?.precio ?? modulo?.precio;
                        return (
                            <QCheckbox key={id} nombre={`modulo_${id}`}
                                label={`${modulo?.nombre ?? id}${precio ? ` (${formatearImporte(precio.mensual)}/mes)` : ""}`}
                                valor={cambio.modulos.includes(id)}
                                onChange={(v) => setCambio(alternarModulo(cambio, id, v === "true"))} />
                        );
                    })}

                    <h4>Extras</h4>
                    {extrasActivos.map((e) => (
                        <QInput key={e.id} nombre={`extra_${e.id}`} tipo="entero" opcional
                            label={`${e.nombre} (${formatearImporte(e.precio.mensual)}${e.recurrente ? "/mes" : ""}) · cantidad`}
                            valor={String(cambio.extras[e.id] ?? 0)}
                            onChange={(v) => setCambio(cambiarCantidadExtra(cambio, e.id, Number(v) || 0))} />
                    ))}
                    <div className="ayuda">
                        El cambio es inmediato y sin prorrateo. Si el plan o los extras no son coherentes, el servidor lo indicará.
                    </div>
                </quimera-formulario>
                <div className="botones maestro-botones">
                    <QBoton onClick={cambiar} deshabilitado={!cambio.planId}>
                        {sinSuscripcion ? "Asignar plan" : "Cambiar plan"}
                    </QBoton>
                </div>
            </div>
        </QModal>
    );
};

/** Modal de asignación o cambio de plan de una empresa: carga el catálogo y parte de lo que ya tiene contratado. */
export const CambiarPlanTenant = ({
    publicar,
    idTenant,
    datos,
}: {
    publicar: EmitirEvento;
    idTenant: string;
    datos: DatosSuscripcion | null;
}) => {
    const [catalogo, setCatalogo] = useState<Catalogo | null>(null);

    useEffect(() => {
        let vivo = true;
        getCatalogo()
            .then((c) => { if (vivo) setCatalogo(c); })
            .catch(() => { if (vivo) publicar("cambio_de_plan_cancelado"); });
        return () => { vivo = false; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (!catalogo) {
        return (
            <QModal abierto={true} nombre="cambiarPlanTenant" titulo="Cambiar plan"
                onCerrar={() => publicar("cambio_de_plan_cancelado")}>
                <p>Cargando el catálogo…</p>
            </QModal>
        );
    }
    return <FormularioCambioPlan idTenant={idTenant} datos={datos} catalogo={catalogo} publicar={publicar} />;
};
