import { QIcono } from "@olula/componentes/atomos/qicono.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { useState } from "react";
import { CategoriaModulo, ModuloCatalogo } from "../../catalogo/diseño.js";
import { etiquetaCategoria, iconoModulo, modulosDeCategoria } from "../../catalogo/dominio.js";
import { formatearImporte } from "../../comun/dominio.js";
import { ModoMcp, ModoModulo, MODULO_MCP, Plan, PlanModulo } from "../diseño.js";
import {
    alternarIncluido,
    cambiarModoMcp,
    cambiarModoModulo,
    cambiarPrecioExtra,
    dependenciasSinCubrir,
    etiquetaFiltroModo,
    etiquetaModo,
    etiquetaModoMcp,
    FiltroModo,
    filtrarModulosPlan,
    moduloDePlan,
    modosPermitidos,
    precioExtraEfectivo,
    recuentoModos,
} from "../dominio.js";
import { BarraRejillaPlan, SelectorSegmentado } from "./BarraRejillaPlan.js";
import "./TabModulosPlan.css";

const CATEGORIAS: CategoriaModulo[] = ["contexto", "plugin", "servicio"];

/**
 * Rejilla de módulos del catálogo con buscador y filtro por modo. La casilla de cada tarjeta
 * incluye o quita el módulo; al pulsar la tarjeta se despliega su configuración (modo, precio
 * especial del extra, modo MCP).
 */
export const TabModulosPlan = ({
    plan,
    modulos,
    onChange,
}: {
    plan: Plan;
    modulos: ModuloCatalogo[];
    onChange: (plan: Plan) => void;
}) => {
    const [texto, setTexto] = useState("");
    const [filtro, setFiltro] = useState<FiltroModo>("todos");
    const [abierto, setAbierto] = useState<string | null>(null);

    const visibles = filtrarModulosPlan(plan, modulos, texto, filtro);
    const recuento = recuentoModos(plan);

    return (
        <div className="TabModulosPlan">
            <BarraRejillaPlan nombre="modulos" texto={texto} onTexto={setTexto} filtro={filtro} onFiltro={setFiltro}
                etiquetas={etiquetaFiltroModo} recuento={recuento} />

            {visibles.length === 0 && <p className="rejilla-plan-vacia">Ningún módulo coincide con la búsqueda.</p>}

            {CATEGORIAS.map((categoria) => {
                const deCategoria = modulosDeCategoria(visibles, categoria);
                if (deCategoria.length === 0) return null;
                const todos = modulosDeCategoria(modulos, categoria);
                const incluidos = todos.filter((m) => moduloDePlan(plan, m.id)?.modo === "incluido").length;
                return (
                    <section key={categoria}>
                        <h4>
                            {etiquetaCategoria[categoria]}
                            <span className="recuento-categoria">{incluidos} de {todos.length} incluidos</span>
                        </h4>
                        <div className="rejilla-plan">
                            {deCategoria.map((modulo) => {
                                const pm = moduloDePlan(plan, modulo.id);
                                if (!pm) return null;
                                return (
                                    <TarjetaModuloPlan key={modulo.id} plan={plan} pm={pm} modulo={modulo}
                                        modulos={modulos} onChange={onChange} abierta={abierto === modulo.id}
                                        onAbrir={() => setAbierto(abierto === modulo.id ? null : modulo.id)} />
                                );
                            })}
                        </div>
                    </section>
                );
            })}
        </div>
    );
};

const textoEstado = (pm: PlanModulo, modulo: ModuloCatalogo): string => {
    if (pm.modo !== "extra") return etiquetaModo[pm.modo];
    const precio = precioExtraEfectivo(pm, modulo);
    return precio ? `Extra · ${formatearImporte(precio.mensual)}/mes` : etiquetaModo.extra;
};

const TarjetaModuloPlan = ({
    plan,
    pm,
    modulo,
    modulos,
    onChange,
    abierta,
    onAbrir,
}: {
    plan: Plan;
    pm: PlanModulo;
    modulo: ModuloCatalogo;
    modulos: ModuloCatalogo[];
    onChange: (plan: Plan) => void;
    abierta: boolean;
    onAbrir: () => void;
}) => {
    const sinCubrir = dependenciasSinCubrir(plan, modulo, modulos);
    const incluido = pm.modo === "incluido";
    return (
        <div className={`tarjeta-plan modo-${pm.modo}${abierta ? " abierta" : ""}`}>
            <button type="button" className="tarjeta-plan-cabecera" onClick={onAbrir} aria-expanded={abierta}>
                <span className="tarjeta-plan-icono"><QIcono nombre={iconoModulo(modulo)} tamaño="lg" /></span>
                <span className="tarjeta-plan-nombre">{modulo.nombre}</span>
                <span className="tarjeta-plan-estado">
                    {sinCubrir.length > 0 && <span className="aviso-dependencia" title={`Necesita: ${sinCubrir.join(", ")}`}>!</span>}
                    {textoEstado(pm, modulo)}
                </span>
            </button>
            <button type="button" role="checkbox" aria-checked={incluido} className="tarjeta-plan-check"
                aria-label={`Incluir ${modulo.nombre} en el plan`} title={incluido ? "Quitar del plan" : "Incluir en el plan"}
                onClick={() => onChange(alternarIncluido(plan, modulo.id, modulos))}>
                {incluido && <QIcono nombre="check" tamaño="sm" />}
            </button>

            {abierta && (
                <ConfigModuloPlan plan={plan} pm={pm} modulo={modulo} modulos={modulos}
                    sinCubrir={sinCubrir} onChange={onChange} />
            )}
        </div>
    );
};

const ConfigModuloPlan = ({
    plan,
    pm,
    modulo,
    modulos,
    sinCubrir,
    onChange,
}: {
    plan: Plan;
    pm: PlanModulo;
    modulo: ModuloCatalogo;
    modulos: ModuloCatalogo[];
    sinCubrir: string[];
    onChange: (plan: Plan) => void;
}) => {
    const necesita = modulo.dependeDe.map((id) => modulos.find((m) => m.id === id)?.nombre ?? id);
    return (
        <div className="tarjeta-plan-config">
            {modulo.descripcion && <p className="tarjeta-plan-descripcion">{modulo.descripcion}</p>}
            <p className="tarjeta-plan-detalle">
                {modulo.contratableSuelto
                    ? `Suelto: ${formatearImporte(modulo.precio.mensual)}/mes · ${formatearImporte(modulo.precio.anual)}/año`
                    : "No se contrata suelto: solo puede ir incluido o no disponible"}
                {necesita.length > 0 && ` · Necesita: ${necesita.join(", ")}`}
            </p>
            {sinCubrir.length > 0 && (
                <p className="tarjeta-plan-aviso">El plan no ofrece {sinCubrir.join(", ")}, que este módulo necesita.</p>
            )}

            <SelectorSegmentado<ModoModulo> etiqueta="Modo" valor={pm.modo}
                opciones={modosPermitidos(modulo).map((m) => ({ valor: m, descripcion: etiquetaModo[m] }))}
                onChange={(m) => onChange(cambiarModoModulo(plan, modulo.id, m, modulos))} />

            {pm.modo === "extra" && (
                <div className="tarjeta-plan-precios">
                    <QInput label="Extra mensual" nombre={`extra_mensual_${modulo.id}`} tipo="moneda" condensado opcional
                        placeholder={modulo.precio.mensual} valor={pm.precio?.mensual ?? ""}
                        onChange={(v) => onChange(cambiarPrecioExtra(plan, modulo.id, "mensual", v))} />
                    <QInput label="Extra anual" nombre={`extra_anual_${modulo.id}`} tipo="moneda" condensado opcional
                        placeholder={modulo.precio.anual} valor={pm.precio?.anual ?? ""}
                        onChange={(v) => onChange(cambiarPrecioExtra(plan, modulo.id, "anual", v))} />
                    <p className="tarjeta-plan-detalle">Déjalos vacíos para usar el precio suelto del módulo.</p>
                </div>
            )}

            {modulo.id === MODULO_MCP && pm.modo !== "no_disponible" && (
                <SelectorSegmentado<ModoMcp> etiqueta="Modo MCP" valor={pm.opciones.mcpModo ?? "lectura"}
                    opciones={(Object.keys(etiquetaModoMcp) as ModoMcp[]).map((m) => ({ valor: m, descripcion: etiquetaModoMcp[m] }))}
                    onChange={(m) => onChange(cambiarModoMcp(plan, m))} />
            )}
        </div>
    );
};
