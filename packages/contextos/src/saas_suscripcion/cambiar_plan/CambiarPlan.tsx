import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QEtiqueta } from "@olula/componentes/atomos/qetiqueta.tsx";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { Catalogo, MiSuscripcion, Objetivo, Periodicidad } from "../diseño.ts";
import {
    ahorroAnual, claveObjetivo, extrasOfrecidos, importeEuros, limitesDePlan, modulosDePlan,
    modulosExtraOfrecidos, modulosPresentes, motivoModuloBloqueado, objetivoConExtra, objetivoConModulo,
    objetivoConPeriodicidad, objetivoConPlan, objetivoDeSuscripcion, ordenarPlanes, puedeConfirmarCambio,
    RUTA_MODULOS, textoImportePeriodo, textoPrecioPlan, textoPrueba,
} from "../dominio.ts";
import { PresupuestoCambio } from "./PresupuestoCambio.tsx";
import { usePresupuesto } from "./presupuesto.ts";
import { TarjetaModuloOpcional } from "./TarjetaModuloOpcional.tsx";

/**
 * Comparador de planes y complementos. El objetivo que se está armando vive aquí (es estado
 * de pantalla); cada cambio pide un presupuesto y, al confirmar, la máquina de la página
 * aplica el cambio y, si hace falta, lanza el pago.
 */
export const CambiarPlan = ({
    mi, catalogo, deshabilitado, publicar,
}: {
    mi: MiSuscripcion;
    catalogo: Catalogo;
    deshabilitado: boolean;
    publicar: EmitirEvento;
}) => {
    const actual = useMemo(() => objetivoDeSuscripcion(mi.suscripcion!), [mi.suscripcion]);
    const claveActual = claveObjetivo(actual);
    const [objetivo, setObjetivo] = useState<Objetivo>(actual);
    const [enviando, setEnviando] = useState(false);

    // Si la suscripción cambia (tras confirmar o recargar), se parte de lo nuevo.
    useEffect(() => {
        setObjetivo(JSON.parse(claveActual) as Objetivo);
    }, [claveActual]);

    const planes = useMemo(() => ordenarPlanes(catalogo.planes), [catalogo.planes]);
    // El plan actual puede no ser público (p. ej. legado): se busca también en lo que trae mi suscripción.
    const plan = planes.find((p) => p.id === objetivo.planId)
        ?? (mi.plan && mi.plan.id === objetivo.planId ? mi.plan : null);
    const hayCambio = claveObjetivo(objetivo) !== claveActual;
    const estadoPresupuesto = usePresupuesto(objetivo, hayCambio && !deshabilitado && plan !== null);

    const confirmar = async () => {
        setEnviando(true);
        try {
            await publicar("cambio_confirmado", objetivo);
        } finally {
            setEnviando(false);
        }
    };

    const periodicidad = objetivo.periodicidad;
    const elegirPeriodicidad = (p: Periodicidad) => setObjetivo((o) => objetivoConPeriodicidad(o, p));

    const presentes = plan ? modulosPresentes(plan, objetivo) : new Set<string>();
    const modulosExtra = plan ? modulosExtraOfrecidos(plan, catalogo, periodicidad) : [];
    const extras = plan ? extrasOfrecidos(plan, catalogo, objetivo) : [];

    return (
        <section className="susc-seccion" aria-labelledby="susc-cambiar">
            <h3 id="susc-cambiar">Cambiar de plan</h3>

            <div className="susc-periodicidad" role="group" aria-label="Periodicidad de facturación">
                <QBoton variante={periodicidad === "mensual" ? "solido" : "borde"} onClick={() => elegirPeriodicidad("mensual")}
                    deshabilitado={deshabilitado}>
                    Mensual
                </QBoton>
                <QBoton variante={periodicidad === "anual" ? "solido" : "borde"} onClick={() => elegirPeriodicidad("anual")}
                    deshabilitado={deshabilitado}>
                    Anual
                </QBoton>
            </div>

            <div className="susc-planes">
                {planes.map((p) => {
                    const elegido = p.id === objetivo.planId;
                    const esActual = p.id === actual.planId;
                    const incluidos = modulosDePlan(p, catalogo, "incluido");
                    const ahorro = ahorroAnual(p.precio);
                    return (
                        <article key={p.id} className={`susc-plan${elegido ? " elegido" : ""}${p.destacado ? " destacado" : ""}`}>
                            <header>
                                <h4>{p.nombre}</h4>
                                {p.destacado && <QEtiqueta variante="primario">Recomendado</QEtiqueta>}
                                {esActual && <QEtiqueta variante="neutro">Tu plan</QEtiqueta>}
                            </header>
                            <p className="susc-precio">{textoPrecioPlan(p, periodicidad)}</p>
                            {periodicidad === "anual" && ahorro > 0 && (
                                <p className="susc-secundario">Ahorras {importeEuros(ahorro)} al año</p>
                            )}
                            <p className="susc-secundario">{p.descripcion}</p>
                            <ul className="susc-incluye">
                                {limitesDePlan(p, catalogo).map((t) => <li key={t}>{t}</li>)}
                                {incluidos.length > 0 && <li>Incluye {incluidos.join(", ")}</li>}
                            </ul>
                            {textoPrueba(p) && !esActual && <p className="susc-secundario">{textoPrueba(p)}</p>}
                            <QBoton
                                variante={elegido ? "solido" : "borde"}
                                deshabilitado={deshabilitado || elegido}
                                onClick={() => setObjetivo((o) => objetivoConPlan(o, p, catalogo))}
                            >
                                {elegido ? "Seleccionado" : esActual ? "Volver a mi plan" : `Elegir ${p.nombre}`}
                            </QBoton>
                        </article>
                    );
                })}
            </div>

            {plan && modulosExtra.length > 0 && (
                <div className="susc-complementos">
                    <div className="susc-complementos-cabecera">
                        <h4>Módulos opcionales con {plan.nombre}</h4>
                        <Link to={RUTA_MODULOS}>Ver todos los módulos</Link>
                    </div>
                    <div className="rejilla-modulos compacta">
                        {modulosExtra.map((m) => (
                            <TarjetaModuloOpcional key={m.id} modulo={m} periodicidad={periodicidad}
                                marcado={objetivo.modulos.includes(m.id)}
                                motivo={motivoModuloBloqueado(m, presentes, catalogo)}
                                deshabilitado={deshabilitado}
                                onCambiar={(marcado) =>
                                    setObjetivo((o) => objetivoConModulo(o, m.id, marcado, plan, catalogo))} />
                        ))}
                    </div>
                </div>
            )}

            {plan && extras.length > 0 && (
                <div className="susc-complementos">
                    <h4>Ampliaciones</h4>
                    <ul>
                        {extras.map((e) => {
                            const cantidad = objetivo.extras[e.id] ?? 0;
                            return (
                                <li key={e.id} className="susc-extra">
                                    <div>
                                        <strong>{e.nombre}</strong>
                                        <span className="susc-secundario">
                                            {" "}+{textoImportePeriodo(e.precio[periodicidad], periodicidad)} cada una
                                        </span>
                                        <div className="susc-secundario">{e.descripcion}</div>
                                    </div>
                                    <div className="susc-cantidad" role="group" aria-label={`Cantidad de ${e.nombre}`}>
                                        <QBoton variante="borde" tamaño="pequeño" texto="−"
                                            deshabilitado={deshabilitado || cantidad <= 0}
                                            onClick={() => setObjetivo((o) => objetivoConExtra(o, e.id, cantidad - 1))} />
                                        <output>{cantidad}</output>
                                        <QBoton variante="borde" tamaño="pequeño" texto="+"
                                            deshabilitado={deshabilitado}
                                            onClick={() => setObjetivo((o) => objetivoConExtra(o, e.id, cantidad + 1))} />
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            )}

            {plan && (
                hayCambio ? (
                    <PresupuestoCambio
                        estado={estadoPresupuesto}
                        plan={plan}
                        limites={mi.derechos.limites}
                        puedeConfirmar={!deshabilitado && puedeConfirmarCambio(estadoPresupuesto.presupuesto, objetivo, actual)}
                        enviando={enviando}
                        onConfirmar={confirmar}
                    />
                ) : (
                    <p className="susc-secundario">Esta es tu configuración actual. Cambia de plan, periodicidad o complementos para ver el presupuesto.</p>
                )
            )}
        </section>
    );
};
