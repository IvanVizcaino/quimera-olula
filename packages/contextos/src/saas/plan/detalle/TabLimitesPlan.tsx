import { QCheckbox } from "@olula/componentes/atomos/qcheckbox.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { LimiteCatalogo } from "../../catalogo/diseño.js";
import { Plan } from "../diseño.js";
import { cambiarLimite, valorLimiteDesdeTexto } from "../dominio.js";
import "./TabLimitesPlan.css";

/** Una fila por límite del catálogo: valor (vacío o «ilimitado» = null) y si se amplía con extras. */
export const TabLimitesPlan = ({
    plan,
    limites,
    onChange,
}: {
    plan: Plan;
    limites: LimiteCatalogo[];
    onChange: (plan: Plan) => void;
}) => (
    <div className="TabLimitesPlan">
        {limites.map((limite) => {
            const pl = plan.limites.find((l) => l.limiteId === limite.id);
            if (!pl) return null;
            const ilimitado = pl.valor === null;
            return (
                <div className="limite-plan-fila" key={limite.id}>
                    <div className="limite-plan-info">
                        <div className="limite-plan-nombre">{limite.nombre}</div>
                        <div className="limite-plan-detalle">
                            {limite.unidad}
                            {limite.tipo === "consumo_mensual" ? " al mes" : ""}
                        </div>
                    </div>
                    <QInput label="Valor" nombre={`valor_${limite.id}`} tipo="entero" condensado opcional
                        placeholder="Ilimitado" valor={pl.valor === null ? "" : String(pl.valor)}
                        onChange={(v) => onChange(cambiarLimite(plan, limite.id, { valor: valorLimiteDesdeTexto(v) }))} />
                    <QCheckbox label="Ilimitado" nombre={`ilimitado_${limite.id}`} valor={ilimitado} condensado
                        onChange={(v) => onChange(cambiarLimite(plan, limite.id, { valor: v === "true" ? null : 0 }))} />
                    <QCheckbox label="Ampliable con extras" nombre={`ampliable_${limite.id}`} valor={pl.ampliable} condensado
                        onChange={(v) => onChange(cambiarLimite(plan, limite.id, { ampliable: v === "true" }))} />
                </div>
            );
        })}
    </div>
);
