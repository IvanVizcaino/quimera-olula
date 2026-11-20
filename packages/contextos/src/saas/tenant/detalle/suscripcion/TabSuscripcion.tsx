import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QEtiqueta } from "@olula/componentes/atomos/qetiqueta.tsx";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { formatearFechaString } from "@olula/lib/dominio.ts";
import { DatosSuscripcion } from "../../suscripcion/diseño.js";
import {
    etiquetaEstadoSuscripcion, etiquetaOrigenModulo, etiquetaPeriodicidad, puedePasarASoloLectura,
    puedeReactivarSuscripcion, varianteEstadoSuscripcion, varianteOrigenModulo,
} from "../../suscripcion/dominio.js";
import { DatosFiscalesSuscripcion } from "./DatosFiscalesSuscripcion.js";
import { CondicionesSuscripcion } from "./CondicionesSuscripcion.js";
import { CuotaSuscripcion } from "./CuotaSuscripcion.js";
import { FacturasSuscripcion } from "./FacturasSuscripcion.js";
import { LimitesSuscripcion } from "./LimitesSuscripcion.js";
import "./TabSuscripcion.css";

const fecha = (f: string | null) => (f ? formatearFechaString(f) : "");

/**
 * Pestaña «Suscripción» de la ficha de empresa. Con `suscripcion` null la empresa no tiene
 * límites: solo se ofrece asignarle un plan.
 */
export const TabSuscripcion = ({
    datos,
    error,
    editable,
    publicar,
}: {
    datos: DatosSuscripcion | null;
    error: string;
    editable: boolean;
    publicar: EmitirEvento;
}) => {
    if (!datos) {
        return (
            <div className="TabSuscripcion">
                <p>{error ? `No se pudo cargar la suscripción: ${error}` : "Cargando la suscripción…"}</p>
            </div>
        );
    }

    const s = datos.suscripcion;
    if (!s) {
        return (
            <div className="TabSuscripcion">
                <p>Sin suscripción (sin límites)</p>
                <div className="maestro-botones">
                    <QBoton deshabilitado={!editable} onClick={() => publicar("cambiar_plan_solicitado")}>
                        Asignar plan
                    </QBoton>
                </div>
                {datos.datosFiscales && (
                    <DatosFiscalesSuscripcion datos={datos.datosFiscales} editable={editable} publicar={publicar} />
                )}
            </div>
        );
    }

    const pasarela = datos.pasarelas.find((p) => p.id === s.pasarelaId)?.nombre ?? s.pasarelaId ?? "Ninguna";
    const programado = s.cambioProgramado;

    return (
        <div className="TabSuscripcion">
            <dl className="resumen-suscripcion">
                <dt>Plan</dt><dd>{datos.plan?.nombre ?? s.planId}</dd>
                <dt>Periodicidad</dt><dd>{etiquetaPeriodicidad[s.periodicidad]}</dd>
                <dt>Estado</dt>
                <dd>
                    <QEtiqueta variante={varianteEstadoSuscripcion(s.estado)}>
                        {etiquetaEstadoSuscripcion[s.estado] ?? s.estado}
                    </QEtiqueta>
                    {s.impagadaDesde && ` desde ${fecha(s.impagadaDesde)}`}
                </dd>
                <dt>Pasarela</dt>
                <dd>{pasarela}{s.tieneMetodoPago ? " (con método de pago)" : " (sin método de pago)"}</dd>
                <dt>Periodo actual</dt><dd>{fecha(s.inicioPeriodo)} a {fecha(s.finPeriodo)}</dd>
                {s.finPrueba && <><dt>Fin de la prueba</dt><dd>{fecha(s.finPrueba)}</dd></>}
                {programado && (
                    <>
                        <dt>Cambio programado</dt>
                        <dd>
                            Plan {programado.planId} ({etiquetaPeriodicidad[programado.periodicidad]})
                            {programado.modulos.length > 0 && `, módulos: ${programado.modulos.join(", ")}`}
                        </dd>
                    </>
                )}
                {s.cancelarAlFin && (
                    <><dt>Cancelación</dt><dd><QEtiqueta variante="advertencia">Cancelación pendiente al fin del periodo</QEtiqueta></dd></>
                )}
                {datos.mandatoSepa && (
                    <><dt>Mandato SEPA</dt><dd>{datos.mandatoSepa.titular} · {datos.mandatoSepa.iban}</dd></>
                )}
            </dl>

            <div className="maestro-botones">
                <QBoton deshabilitado={!editable} onClick={() => publicar("cambiar_plan_solicitado")}>
                    Cambiar plan
                </QBoton>
                {puedePasarASoloLectura(s) && (
                    <QBoton variante="borde" advertencia deshabilitado={!editable}
                        onClick={() => publicar("estado_suscripcion_solicitado", "solo_lectura")}>
                        Pasar a solo lectura
                    </QBoton>
                )}
                {puedeReactivarSuscripcion(s) && (
                    <QBoton variante="borde" deshabilitado={!editable}
                        onClick={() => publicar("estado_suscripcion_solicitado", "activa")}>
                        Reactivar
                    </QBoton>
                )}
            </div>

            {datos.cuota && <CuotaSuscripcion titulo="Cuota" cuota={datos.cuota} />}
            {datos.cuotaProgramada && <CuotaSuscripcion titulo="Cuota programada" cuota={datos.cuotaProgramada} />}

            {datos.derechos && (
                <>
                    <LimitesSuscripcion limites={datos.derechos.limites} excepciones={datos.excepciones}
                        editable={editable} publicar={publicar} />

                    <h4>Módulos y origen</h4>
                    {datos.derechos.modulos.map((m) => (
                        <div className="modulo-origen" key={m.id}>
                            <span>{m.nombre}</span>
                            <QEtiqueta variante={varianteOrigenModulo(m.origen)}>{etiquetaOrigenModulo(m.origen)}</QEtiqueta>
                        </div>
                    ))}
                    {datos.derechos.mcpModo && <p>Conector MCP en modo {datos.derechos.mcpModo}.</p>}
                </>
            )}

            <FacturasSuscripcion facturas={datos.facturas} publicar={publicar} />

            {datos.datosFiscales && (
                <DatosFiscalesSuscripcion datos={datos.datosFiscales} editable={editable} publicar={publicar} />
            )}

            <CondicionesSuscripcion suscripcion={s} pasarelas={datos.pasarelas} editable={editable} publicar={publicar} />
        </div>
    );
};
