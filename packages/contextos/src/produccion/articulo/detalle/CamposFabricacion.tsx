import { QAviso } from "@olula/componentes/atomos/qaviso.tsx";
import { QCheckbox } from "@olula/componentes/atomos/qcheckbox.tsx";
import { HookModelo } from "@olula/lib/useModelo.ts";
import { SelectorTipoProceso } from "../../tipo_proceso/SelectorTipoProceso.tsx";
import { FabricacionArticulo } from "../diseño.ts";
import { validarFabricacion } from "../dominio.ts";
import { ComponentesFabricacion } from "./ComponentesFabricacion.tsx";
import "./CamposFabricacion.css";

/**
 * Fabricación del artículo: si se fabrica y con qué tipo de proceso (autoguardado), avisos de lo
 * que falta y la tarea de consumo de cada componente.
 */
export const CamposFabricacion = ({
    modelo,
    entidad,
    recargar,
}: {
    modelo: HookModelo<FabricacionArticulo>;
    entidad: FabricacionArticulo;
    recargar: () => Promise<void>;
}) => {
    const motivo = validarFabricacion(modelo.modelo);
    return (
    <div className="CamposFabricacion">
        {entidad.avisos.length > 0 && (
            <QAviso variante="advertencia" className="avisos-fabricacion">
                <ul>
                    {entidad.avisos.map((a) => <li key={a}>{a}</li>)}
                </ul>
            </QAviso>
        )}
        <quimera-formulario>
            <QCheckbox label="Fabricado" {...modelo.uiProps("fabricado")} />
            <SelectorTipoProceso {...modelo.uiProps("tipoProcesoId")} soloFabricacion
                descripcionActual={entidad.tipoProceso} />
        </quimera-formulario>
        {motivo !== true && <p className="motivo-fabricacion">{motivo}</p>}
        {entidad.sinStock && <p className="nota">Artículo sin stock: admite tipos de proceso de modificación.</p>}
        <ComponentesFabricacion articulo={entidad} recargar={recargar} />
    </div>
    );
};
