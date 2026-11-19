import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QSelect } from "@olula/componentes/atomos/qselect.tsx";
import { CategoriaModulo, ModuloCatalogo } from "../../catalogo/diseño.js";
import { etiquetaCategoria, modulosDeCategoria } from "../../catalogo/dominio.js";
import { formatearImporte } from "../../comun/dominio.js";
import { ModoMcp, ModoModulo, MODULO_MCP, Plan } from "../diseño.js";
import {
    cambiarModoMcp,
    cambiarModoModulo,
    cambiarPrecioExtra,
    etiquetaModo,
    etiquetaModoMcp,
    modosPermitidos,
} from "../dominio.js";
import "./TabModulosPlan.css";

/**
 * Una fila por módulo del catálogo: Incluido / Extra / No disponible. Un módulo que no se
 * contrata suelto no puede ser Extra. El precio especial del extra es opcional (vacío = el suelto).
 */
export const TabModulosPlan = ({
    plan,
    modulos,
    onChange,
}: {
    plan: Plan;
    modulos: ModuloCatalogo[];
    onChange: (plan: Plan) => void;
}) => (
    <div className="TabModulosPlan">
        {(["contexto", "plugin", "servicio"] as CategoriaModulo[]).map((categoria) => {
            const deCategoria = modulosDeCategoria(modulos, categoria);
            if (deCategoria.length === 0) return null;
            return (
                <section key={categoria}>
                    <h4>{etiquetaCategoria[categoria]}</h4>
                    {deCategoria.map((modulo) => (
                        <FilaModuloPlan
                            key={modulo.id}
                            plan={plan}
                            modulo={modulo}
                            modulos={modulos}
                            onChange={onChange}
                        />
                    ))}
                </section>
            );
        })}
        <p className="ayuda-precio-extra">
            Precio especial del extra: déjalo vacío para usar el precio suelto del módulo.
        </p>
    </div>
);

const FilaModuloPlan = ({
    plan,
    modulo,
    modulos,
    onChange,
}: {
    plan: Plan;
    modulo: ModuloCatalogo;
    modulos: ModuloCatalogo[];
    onChange: (plan: Plan) => void;
}) => {
    const pm = plan.modulos.find((m) => m.moduloId === modulo.id);
    if (!pm) return null;
    return (
        <div className="modulo-plan-fila" key={modulo.id}>
            <div className="modulo-plan-info">
                <div className="modulo-plan-nombre">{modulo.nombre}</div>
                <div className="modulo-plan-detalle">
                    {modulo.contratableSuelto
                        ? `Suelto: ${formatearImporte(modulo.precio.mensual)}/mes · ${formatearImporte(modulo.precio.anual)}/año`
                        : "No se contrata suelto"}
                    {modulo.dependeDe.length > 0 && ` · Necesita: ${modulo.dependeDe.join(", ")}`}
                </div>
            </div>
            <QSelect
                label="Modo"
                nombre={`modo_${modulo.id}`}
                valor={pm.modo}
                condensado
                opciones={modosPermitidos(modulo).map((m) => ({
                    valor: m,
                    descripcion: etiquetaModo[m],
                }))}
                onChange={(o) => o && onChange(cambiarModoModulo(plan, modulo.id, o.valor as ModoModulo, modulos))}
            />
            {pm.modo === "extra" && (
                <>
                    <QInput
                        label="Extra mensual"
                        nombre={`extra_mensual_${modulo.id}`}
                        tipo="moneda"
                        condensado
                        opcional
                        placeholder={modulo.precio.mensual}
                        valor={pm.precio?.mensual ?? ""}
                        onChange={(v) => onChange(cambiarPrecioExtra(plan, modulo.id, "mensual", v))}
                    />
                    <QInput
                        label="Extra anual"
                        nombre={`extra_anual_${modulo.id}`}
                        tipo="moneda"
                        condensado
                        opcional
                        placeholder={modulo.precio.anual}
                        valor={pm.precio?.anual ?? ""}
                        onChange={(v) => onChange(cambiarPrecioExtra(plan, modulo.id, "anual", v))}
                    />
                </>
            )}
            {modulo.id === MODULO_MCP && pm.modo !== "no_disponible" && (
                <QSelect
                    label="Modo MCP"
                    nombre="mcp_modo"
                    valor={pm.opciones.mcpModo ?? "lectura"}
                    condensado
                    opciones={(Object.keys(etiquetaModoMcp) as ModoMcp[]).map((m) => ({
                        valor: m,
                        descripcion: etiquetaModoMcp[m],
                    }))}
                    onChange={(o) => o && onChange(cambiarModoMcp(plan, o.valor as ModoMcp))}
                />
            )}
        </div>
    );
};
