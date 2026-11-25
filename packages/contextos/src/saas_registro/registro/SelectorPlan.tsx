import {
    ahorroAnual, importeEuros, limitesDePlan, ordenarPlanes, textoPrecioPlan, textoPrueba,
} from "../../saas_suscripcion/dominio.ts";
import { PlanRegistro } from "./usePlanRegistro.ts";
import estilos from "./Registro.module.css";

/**
 * Bloque de elección de plan y periodicidad del registro (estado controlado desde fuera, ver usePlanRegistro).
 * Si los planes no se pueden cargar no se muestra nada y el registro sigue adelante sin plan (el backend asigna Pro con prueba).
 */
export const SelectorPlan = ({ plan }: { plan: PlanRegistro }) => {
    const { catalogo, planId, periodicidad, setPlanId, setPeriodicidad } = plan;

    if (!catalogo || catalogo.planes.length === 0) return null;

    const planes = ordenarPlanes(catalogo.planes);
    const elegido = planes.find((p) => p.id === planId) ?? null;
    const ahorro = elegido ? ahorroAnual(elegido.precio) : 0;

    return (
        <fieldset className={estilos.planes}>
            <legend>Elige tu plan</legend>

            <div className={estilos.periodicidad} role="radiogroup" aria-label="Periodicidad de facturación">
                {(["mensual", "anual"] as const).map((p) => (
                    <button key={p} type="button" role="radio" aria-checked={periodicidad === p}
                        className={periodicidad === p ? estilos.activo : ""} onClick={() => setPeriodicidad(p)}>
                        {p === "mensual" ? "Mensual" : "Anual"}
                    </button>
                ))}
            </div>

            <div role="radiogroup" aria-label="Plan" className={estilos.listaPlanes}>
                {planes.map((p) => (
                    <button key={p.id} type="button" role="radio" aria-checked={p.id === planId}
                        className={`${estilos.plan} ${p.id === planId ? estilos.activo : ""}`}
                        onClick={() => setPlanId(p.id)}>
                        <span className={estilos.planNombre}>
                            {p.nombre}{p.destacado ? " · Recomendado" : ""}
                        </span>
                        <span>{textoPrecioPlan(p, periodicidad)}</span>
                    </button>
                ))}
            </div>

            {elegido && (
                <div className={estilos.detallePlan}>
                    {textoPrueba(elegido) && <p><strong>{textoPrueba(elegido)}</strong></p>}
                    <p>{elegido.descripcion}</p>
                    <p>{limitesDePlan(elegido, catalogo).join(" · ")}</p>
                    {periodicidad === "anual" && ahorro > 0 && <p>Pagando al año ahorras {importeEuros(ahorro)}.</p>}
                    <p>Precios sin IVA. Puedes cambiar de plan cuando quieras.</p>
                </div>
            )}
        </fieldset>
    );
};
