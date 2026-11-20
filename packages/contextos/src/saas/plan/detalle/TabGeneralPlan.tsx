import { QCheckbox } from "@olula/componentes/atomos/qcheckbox.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QTextArea } from "@olula/componentes/atomos/qtextarea.tsx";
import { Plan } from "../diseño.js";
import "./TabGeneralPlan.css";

export const TabGeneralPlan = ({
    plan,
    onChange,
}: {
    plan: Plan;
    onChange: (plan: Plan) => void;
}) => (
    <div className="TabGeneralPlan">
        <quimera-formulario>
            <QInput label="Identificador" nombre="id" valor={plan.id} deshabilitado />
            <QInput label="Nombre" nombre="nombre" valor={plan.nombre}
                onChange={(v) => onChange({ ...plan, nombre: v })} />
            <QTextArea label="Descripción" nombre="descripcion" valor={plan.descripcion}
                onChange={(v) => onChange({ ...plan, descripcion: v })} />
            <QInput label="Precio mensual" nombre="precioMensual" tipo="moneda" valor={plan.precio.mensual}
                onChange={(v) => onChange({ ...plan, precio: { ...plan.precio, mensual: v } })} />
            <QInput label="Precio anual" nombre="precioAnual" tipo="moneda" valor={plan.precio.anual}
                onChange={(v) => onChange({ ...plan, precio: { ...plan.precio, anual: v } })} />
            <QInput label="Días de prueba" nombre="diasPrueba" tipo="entero" valor={String(plan.diasPrueba)}
                onChange={(v) => onChange({ ...plan, diasPrueba: Math.max(0, Math.trunc(Number(v) || 0)) })} />
            <QInput label="Orden" nombre="orden" tipo="entero" valor={String(plan.orden)}
                onChange={(v) => onChange({ ...plan, orden: Math.trunc(Number(v) || 0) })} />
            <QCheckbox label="Público (visible en el registro)" nombre="publico" valor={plan.publico}
                onChange={(v) => onChange({ ...plan, publico: v === "true" })} />
            <QCheckbox label="Destacado" nombre="destacado" valor={plan.destacado}
                onChange={(v) => onChange({ ...plan, destacado: v === "true" })} />
        </quimera-formulario>
    </div>
);
