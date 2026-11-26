import { QAviso } from "@olula/componentes/atomos/qaviso.tsx";
import { QCheckbox } from "@olula/componentes/atomos/qcheckbox.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { HookModelo } from "@olula/lib/useModelo.ts";
import { SelectorTipoProceso } from "../../tipo_proceso/SelectorTipoProceso.tsx";
import { FabricacionArticulo } from "../diseño.ts";
import { comoBooleano } from "../../comun/dominio.ts";
import { componentesPorLotes, faltaPorLotes, validarFabricacion } from "../dominio.ts";
import { ComponentesFabricacion } from "./ComponentesFabricacion.tsx";
import "./CamposFabricacion.css";

/**
 * Fabricación del artículo: si se fabrica y con qué tipo de proceso (autoguardado), si va por
 * lotes (solo lectura: se cambia en almacén), avisos de lo que falta (entre ellos el de compuesto
 * por lotes, que da el servidor) y la tarea de consumo y si va por lotes cada componente.
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
            <QInput label="Por lotes" nombre="porLotes" valor={entidad.porLotes ? "Sí" : "No"} soloLectura />
        </quimera-formulario>
        {motivo !== true && <p className="motivo-fabricacion">{motivo}</p>}
        {/* Fabricado, el servidor ya lo avisa («Debe ir por lotes...»); sin marcar, se adelanta. */}
        {faltaPorLotes({ ...entidad, fabricado: true }) && !comoBooleano(entidad.fabricado) && (
            <p className="nota">
                Tiene componentes por lotes ({componentesPorLotes(entidad.componentes).map((c) => c.articuloId).join(", ")}):
                para marcarlo fabricado tiene que ir por lotes (se cambia en la ficha del artículo de almacén).
            </p>
        )}
        {entidad.sinStock && <p className="nota">Artículo sin stock: admite tipos de proceso de modificación.</p>}
        <ComponentesFabricacion articulo={entidad} recargar={recargar} />
    </div>
    );
};
