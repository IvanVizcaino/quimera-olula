import { QCheckbox } from "@olula/componentes/atomos/qcheckbox.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QSelect } from "@olula/componentes/atomos/qselect.tsx";
import { MetaTabla } from "@olula/componentes/index.js";
import { siONada } from "../../comun/dominio.ts";
import { CrearSimple } from "../../comun/maestro_simple/CrearSimple.tsx";
import { DetalleSimple } from "../../comun/maestro_simple/DetalleSimple.tsx";
import { MaestroSimple } from "../../comun/maestro_simple/MaestroSimple.tsx";
import { CamposTipoProceso } from "../detalle/CamposTipoProceso.tsx";
import { TipoProceso } from "../diseño.ts";
import {
    LONGITUD_CODIGO_TIPO_PROCESO,
    LONGITUD_DESCRIPCION_TIPO_PROCESO,
    metaNuevoTipoProceso,
    metaTipoProceso,
    nuevoTipoProcesoVacio,
    TIPOS_PRODUCCION,
    tipoProcesoVacio,
    UNIDADES,
} from "../dominio.ts";
import { deleteTipoProceso, getTipoProceso, getTiposProceso, patchTipoProceso, postTipoProceso } from "../infraestructura.ts";
import "./MaestroTipoProceso.css";

const metaTabla: MetaTabla<TipoProceso> = [
    { id: "id", cabecera: "Código", estilo: "secundario", ancho: "18%" },
    { id: "descripcion", cabecera: "Descripción", estilo: "destacado" },
    { id: "tipo_produccion", cabecera: "Producción", render: (t) => t.tipoProduccion },
    { id: "fabricacion", cabecera: "Fabricación", render: (t) => siONada(t.fabricacion) },
    { id: "secuencial", cabecera: "Secuencial", render: (t) => siONada(t.secuencial) },
];

const consultas = { getUno: getTipoProceso, getLista: getTiposProceso };

const guardar = (t: TipoProceso) =>
    patchTipoProceso(t.id, {
        descripcion: t.descripcion, tiempoMedio: t.tiempoMedio, unidad: t.unidad, tipoProduccion: t.tipoProduccion,
        generarTodas: t.generarTodas, secuencial: t.secuencial, fabricacion: t.fabricacion,
    });

/** Producción > Tipos de proceso (pr_tiposproceso con sus tareas y secuencias). */
export const MaestroTipoProceso = () => (
    <MaestroSimple<TipoProceso>
        clase="MaestroTipoProceso"
        titulo="Tipos de proceso"
        textoNuevo="Nuevo tipo de proceso"
        metaTabla={metaTabla}
        consultas={consultas}
        tarjeta={(t) => (
            <div key={t.id}>
                <div>{t.id} - {t.descripcion}</div>
                <div>{t.tipoProduccion}{siONada(t.secuencial) ? " · secuencial" : ""}</div>
            </div>
        )}
        crear={(publicar) => (
            <CrearSimple
                publicar={publicar}
                nombre="crearTipoProceso"
                titulo="Nuevo tipo de proceso"
                clase="CrearTipoProceso FormTipoProceso"
                meta={metaNuevoTipoProceso}
                vacio={nuevoTipoProcesoVacio}
                crear={postTipoProceso}
                campos={({ uiProps }, focus) => (
                    <>
                        <QInput label="Código" {...uiProps("id")} maxLength={LONGITUD_CODIGO_TIPO_PROCESO} ref={focus} />
                        <QInput label="Descripción" {...uiProps("descripcion")} maxLength={LONGITUD_DESCRIPCION_TIPO_PROCESO} />
                        <QSelect label="Unidad" {...uiProps("unidad")} opciones={UNIDADES} />
                        <QSelect label="Tipo de producción" {...uiProps("tipoProduccion")} opciones={TIPOS_PRODUCCION} />
                        <QCheckbox label="Fabricación" {...uiProps("fabricacion")} />
                        <QCheckbox label="Secuencial" {...uiProps("secuencial")} />
                    </>
                )}
            />
        )}
        detalle={(id, publicar) => (
            <DetalleSimple<TipoProceso>
                id={id}
                publicar={publicar}
                clase="DetalleTipoProceso FormTipoProceso"
                getUno={getTipoProceso}
                guardar={guardar}
                vacia={tipoProcesoVacio}
                meta={metaTipoProceso}
                titulo={(t) => `${t.id} - ${t.descripcion}`}
                tituloBorrar="Borrar tipo de proceso"
                mensajeBorrar={(t) =>
                    `¿Está seguro de que desea borrar el tipo de proceso "${t.id}" con sus tareas y secuencias? No se puede si tiene procesos o artículos.`}
                borrar={deleteTipoProceso}
                campos={(props) => <CamposTipoProceso {...props} />}
            />
        )}
    />
);
