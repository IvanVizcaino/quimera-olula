import { QIcono } from "@olula/componentes/atomos/qicono.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import "./RejillaPlan.css";

/** Buscador y filtros (con su recuento) encima de las rejillas de módulos y límites del plan. */
export const BarraRejillaPlan = <F extends string>({
    nombre,
    texto,
    onTexto,
    filtro,
    onFiltro,
    etiquetas,
    recuento,
}: {
    nombre: string;
    texto: string;
    onTexto: (texto: string) => void;
    filtro: F;
    onFiltro: (filtro: F) => void;
    etiquetas: Record<F, string>;
    recuento: Record<F, number>;
}) => (
    <div className="barra-rejilla-plan">
        <div className="buscador-rejilla-plan">
            <QIcono nombre="buscar" tamaño="sm" />
            <QInput label="Buscar" nombre={`buscar_${nombre}`} condensado placeholder="Nombre o descripción" valor={texto} onChange={onTexto} />
        </div>
        <div className="filtros-rejilla-plan" role="radiogroup" aria-label="Filtrar">
            {(Object.keys(etiquetas) as F[]).map((f) => (
                <button key={f} type="button" role="radio" aria-checked={filtro === f}
                    className={filtro === f ? "activo" : ""} onClick={() => onFiltro(f)}>
                    {etiquetas[f]} <span className="recuento">{recuento[f]}</span>
                </button>
            ))}
        </div>
    </div>
);

/** Botonera de opciones excluyentes (modo del módulo, modo MCP…). */
export const SelectorSegmentado = <T extends string>({
    etiqueta,
    valor,
    opciones,
    onChange,
}: {
    etiqueta: string;
    valor: T;
    opciones: { valor: T; descripcion: string }[];
    onChange: (valor: T) => void;
}) => (
    <div className="selector-segmentado">
        <span className="selector-segmentado-etiqueta">{etiqueta}</span>
        <div role="radiogroup" aria-label={etiqueta}>
            {opciones.map((o) => (
                <button key={o.valor} type="button" role="radio" aria-checked={valor === o.valor}
                    className={`opcion-${o.valor}${valor === o.valor ? " activo" : ""}`}
                    onClick={() => onChange(o.valor)}>
                    {o.descripcion}
                </button>
            ))}
        </div>
    </div>
);
