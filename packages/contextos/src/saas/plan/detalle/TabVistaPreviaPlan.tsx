import { QAviso } from "@olula/componentes/atomos/qaviso.tsx";
import { QEtiqueta } from "@olula/componentes/atomos/qetiqueta.tsx";
import { Catalogo } from "../../catalogo/diseño.js";
import { formatearImporte } from "../../comun/dominio.js";
import { Plan } from "../diseño.js";
import { etiquetaModoMcp, modulosExtra, modulosIncluidos, precioExtraEfectivo } from "../dominio.js";
import "./TabVistaPreviaPlan.css";

/** Tarjeta del plan como la vería el cliente, y los avisos comerciales del plan guardado. */
export const TabVistaPreviaPlan = ({
    plan,
    guardado,
    catalogo,
}: {
    plan: Plan;
    /** Plan tal como está en el servidor: los avisos se refieren a él, no al borrador. */
    guardado: Plan;
    catalogo: Catalogo;
}) => {
    const nombreModulo = (id: string) => catalogo.modulos.find((m) => m.id === id)?.nombre ?? id;
    const incluidos = modulosIncluidos(plan);
    const extras = modulosExtra(plan);

    return (
        <div className="TabVistaPreviaPlan">
            <div className={`tarjeta-plan-previa${plan.destacado ? " destacado" : ""}`}>
                <div className="tarjeta-plan-cabecera">
                    <h3>{plan.nombre || "Sin nombre"}</h3>
                    {plan.destacado && <QEtiqueta variante="primario">Destacado</QEtiqueta>}
                </div>
                {plan.descripcion && <p className="tarjeta-plan-descripcion">{plan.descripcion}</p>}
                <div className="tarjeta-plan-precio">
                    <span className="precio-mensual">{formatearImporte(plan.precio.mensual)}</span>
                    <span> / mes</span>
                    <div className="precio-anual">o {formatearImporte(plan.precio.anual)} / año</div>
                </div>
                {plan.diasPrueba > 0 && <div>{plan.diasPrueba} días de prueba</div>}

                <h4>Incluye</h4>
                <ul>
                    {incluidos.map((m) => (
                        <li key={m.moduloId}>
                            {nombreModulo(m.moduloId)}
                            {m.opciones.mcpModo && ` (${etiquetaModoMcp[m.opciones.mcpModo]})`}
                        </li>
                    ))}
                    {incluidos.length === 0 && <li>Ningún módulo</li>}
                </ul>

                <h4>Límites</h4>
                <ul>
                    {plan.limites.map((l) => {
                        const limite = catalogo.limites.find((c) => c.id === l.limiteId);
                        return (
                            <li key={l.limiteId}>
                                {l.valor === null ? "Ilimitados" : l.valor} {limite?.unidad ?? l.limiteId}
                                {limite?.tipo === "consumo_mensual" ? " al mes" : ""}
                                {l.ampliable ? " (ampliable)" : ""}
                            </li>
                        );
                    })}
                </ul>

                {extras.length > 0 && (
                    <>
                        <h4>Módulos extra</h4>
                        <ul>
                            {extras.map((m) => {
                                const precio = precioExtraEfectivo(m, catalogo.modulos.find((c) => c.id === m.moduloId));
                                return (
                                    <li key={m.moduloId}>
                                        {nombreModulo(m.moduloId)}
                                        {precio && ` · ${formatearImporte(precio.mensual)}/mes`}
                                    </li>
                                );
                            })}
                        </ul>
                    </>
                )}

                <div className="tarjeta-plan-estado">
                    <QEtiqueta variante={plan.publico ? "exito" : "neutro"}>{plan.publico ? "Público" : "Privado"}</QEtiqueta>{" "}
                    <QEtiqueta variante={plan.activo ? "exito" : "gris"}>{plan.activo ? "Activo" : "Archivado"}</QEtiqueta>
                </div>
            </div>

            <h4>Avisos del plan guardado</h4>
            {guardado.avisos.length === 0 && <p>Sin avisos.</p>}
            {guardado.avisos.map((aviso, i) => (
                <QAviso variante="advertencia" key={i}>{aviso}</QAviso>
            ))}
        </div>
    );
};
