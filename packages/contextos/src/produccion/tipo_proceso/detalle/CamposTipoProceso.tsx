import { QAviso } from "@olula/componentes/atomos/qaviso.tsx";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QCheckbox } from "@olula/componentes/atomos/qcheckbox.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QSelect } from "@olula/componentes/atomos/qselect.tsx";
import { useState } from "react";
import { PropsCamposDetalle } from "../../comun/maestro_simple/DetalleSimple.tsx";
import { CopiarTipoProceso } from "../copiar/CopiarTipoProceso.tsx";
import { TipoProceso } from "../diseño.ts";
import { LONGITUD_DESCRIPCION_TIPO_PROCESO, TIPOS_PRODUCCION, UNIDADES } from "../dominio.ts";
import { SecuenciasTipoProceso } from "./SecuenciasTipoProceso.tsx";
import { TareasTipoProceso } from "./TareasTipoProceso.tsx";

/** Datos del tipo de proceso (autoguardado), aviso si está incompleto, tareas, secuencias y copia. */
export const CamposTipoProceso = ({ modelo, entidad, recargar, publicar }: PropsCamposDetalle<TipoProceso>) => {
    const [copiando, setCopiando] = useState(false);

    return (
        <>
            <div className="maestro-botones">
                <QBoton onClick={() => setCopiando(true)}>Copiar tipo de proceso</QBoton>
            </div>

            {!entidad.completo && (
                <QAviso variante="advertencia" className="aviso-incompleto">
                    <div>
                        <strong>Tipo de proceso incompleto</strong> (no se podrá usar hasta completarlo):
                        <ul>
                            {entidad.motivosIncompleto.map((m) => <li key={m}>{m}</li>)}
                        </ul>
                    </div>
                </QAviso>
            )}

            <quimera-formulario>
                <QInput label="Código" nombre="id" valor={entidad.id} soloLectura />
                <QInput label="Descripción" {...modelo.uiProps("descripcion")} maxLength={LONGITUD_DESCRIPCION_TIPO_PROCESO} />
                <QInput label="Tiempo medio (segundos)" {...modelo.uiProps("tiempoMedio")} />
                <QSelect label="Unidad" {...modelo.uiProps("unidad")} opciones={UNIDADES} />
                <QInput label={`Tiempo en ${entidad.unidad.toLowerCase()}`} nombre="tiempoUnidad"
                    valor={entidad.tiempoUnidad === null ? "" : String(Math.round(entidad.tiempoUnidad * 100) / 100)}
                    soloLectura />
                <QSelect label="Tipo de producción" {...modelo.uiProps("tipoProduccion")} opciones={TIPOS_PRODUCCION} />
                <QCheckbox label="Generar todas las tareas" {...modelo.uiProps("generarTodas")} />
                <QCheckbox label="Fabricación" {...modelo.uiProps("fabricacion")} />
                <QCheckbox label="Secuencial" {...modelo.uiProps("secuencial")} />
            </quimera-formulario>

            <TareasTipoProceso tipo={entidad} recargar={recargar} />
            <SecuenciasTipoProceso tipo={entidad} recargar={recargar} />

            {copiando && (
                <CopiarTipoProceso
                    tipo={entidad}
                    cerrar={() => setCopiando(false)}
                    copiado={async (id) => {
                        setCopiando(false);
                        await publicar("entidad_creada", id);
                    }}
                />
            )}
        </>
    );
};
