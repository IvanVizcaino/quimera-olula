import { QCheckbox } from "@olula/componentes/atomos/qcheckbox.tsx";
import { QIcono } from "@olula/componentes/atomos/qicono.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { useState } from "react";
import { LimiteCatalogo } from "../../catalogo/diseño.js";
import { etiquetaTipoLimite, iconoLimite } from "../../catalogo/dominio.js";
import { Plan, PlanLimite } from "../diseño.js";
import {
    cambiarLimite,
    etiquetaFiltroLimite,
    FiltroLimite,
    filtrarLimitesPlan,
    recuentoLimites,
    resumenLimite,
    valorLimiteDesdeTexto,
} from "../dominio.js";
import { BarraRejillaPlan } from "./BarraRejillaPlan.js";
import "./TabLimitesPlan.css";

/**
 * Rejilla de límites del catálogo con buscador y filtro. Cada tarjeta resume el valor del plan
 * (vacío o «ilimitado» = null) y al pulsarla se despliega para cambiarlo y decidir si se amplía con extras.
 */
export const TabLimitesPlan = ({
    plan,
    limites,
    onChange,
}: {
    plan: Plan;
    limites: LimiteCatalogo[];
    onChange: (plan: Plan) => void;
}) => {
    const [texto, setTexto] = useState("");
    const [filtro, setFiltro] = useState<FiltroLimite>("todos");
    const [abierto, setAbierto] = useState<string | null>(null);

    const visibles = filtrarLimitesPlan(plan, limites, texto, filtro);

    return (
        <div className="TabLimitesPlan">
            <BarraRejillaPlan nombre="limites" texto={texto} onTexto={setTexto} filtro={filtro} onFiltro={setFiltro}
                etiquetas={etiquetaFiltroLimite} recuento={recuentoLimites(plan)} />

            {visibles.length === 0 && <p className="rejilla-plan-vacia">Ningún límite coincide con la búsqueda.</p>}

            <div className="rejilla-plan">
                {visibles.map((limite) => {
                    const pl = plan.limites.find((l) => l.limiteId === limite.id);
                    if (!pl) return null;
                    return (
                        <TarjetaLimitePlan key={limite.id} plan={plan} pl={pl} limite={limite} onChange={onChange}
                            abierta={abierto === limite.id}
                            onAbrir={() => setAbierto(abierto === limite.id ? null : limite.id)} />
                    );
                })}
            </div>
        </div>
    );
};

const TarjetaLimitePlan = ({
    plan,
    pl,
    limite,
    onChange,
    abierta,
    onAbrir,
}: {
    plan: Plan;
    pl: PlanLimite;
    limite: LimiteCatalogo;
    onChange: (plan: Plan) => void;
    abierta: boolean;
    onAbrir: () => void;
}) => {
    const ilimitado = pl.valor === null;
    const estado = ilimitado ? "ilimitado" : pl.valor === 0 ? "sin_incluir" : "con_tope";
    return (
        <div className={`tarjeta-plan limite-${estado}${abierta ? " abierta" : ""}`}>
            <button type="button" className="tarjeta-plan-cabecera" onClick={onAbrir} aria-expanded={abierta}>
                <span className="tarjeta-plan-icono"><QIcono nombre={iconoLimite(limite)} tamaño="lg" /></span>
                <span className="tarjeta-plan-nombre">{limite.nombre}</span>
                <span className="tarjeta-plan-valor">{resumenLimite(limite, pl)}</span>
                <span className="tarjeta-plan-estado">
                    {etiquetaTipoLimite[limite.tipo]}
                    {pl.ampliable && <span className="insignia-ampliable">Ampliable</span>}
                </span>
            </button>

            {abierta && (
                <div className="tarjeta-plan-config">
                    <div className="tarjeta-plan-precios">
                        <QInput label={`Valor (${limite.unidad}${limite.tipo === "consumo_mensual" ? " al mes" : ""})`}
                            nombre={`valor_${limite.id}`} tipo="entero" condensado opcional placeholder="Ilimitado"
                            valor={ilimitado ? "" : String(pl.valor)}
                            onChange={(v) => onChange(cambiarLimite(plan, limite.id, { valor: valorLimiteDesdeTexto(v) }))} />
                        <QCheckbox label="Ilimitado" nombre={`ilimitado_${limite.id}`} valor={ilimitado} condensado
                            onChange={(v) => onChange(cambiarLimite(plan, limite.id, { valor: v === "true" ? null : 0 }))} />
                        <QCheckbox label="Ampliable con extras" nombre={`ampliable_${limite.id}`} valor={pl.ampliable} condensado
                            onChange={(v) => onChange(cambiarLimite(plan, limite.id, { ampliable: v === "true" }))} />
                    </div>
                    <p className="tarjeta-plan-detalle">
                        Vacío = ilimitado. Con «Ampliable», la empresa puede comprar extras que suben este límite.
                    </p>
                </div>
            )}
        </div>
    );
};
