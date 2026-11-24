import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { MetaTabla } from "@olula/componentes/index.js";
import { CrearSimple } from "../../comun/maestro_simple/CrearSimple.tsx";
import { DetalleSimple } from "../../comun/maestro_simple/DetalleSimple.tsx";
import { MaestroSimple } from "../../comun/maestro_simple/MaestroSimple.tsx";
import { TipoTarea } from "../diseño.ts";
import {
    LONGITUD_CODIGO_TIPO_TAREA,
    LONGITUD_DESCRIPCION_TIPO_TAREA,
    metaNuevoTipoTarea,
    metaTipoTarea,
    nuevoTipoTareaVacio,
    tipoTareaVacio,
} from "../dominio.ts";
import { deleteTipoTarea, getTipoTarea, getTiposTarea, patchTipoTarea, postTipoTarea } from "../infraestructura.ts";

const metaTabla: MetaTabla<TipoTarea> = [
    { id: "id", cabecera: "Código", estilo: "secundario", ancho: "25%" },
    { id: "descripcion", cabecera: "Descripción", estilo: "destacado" },
    { id: "tiempo_medio", cabecera: "Tiempo medio", ancho: "20%", render: (t) => t.tiempoMedio ?? "" },
];

const consultas = { getUno: getTipoTarea, getLista: getTiposTarea };

const guardar = (t: TipoTarea) => patchTipoTarea(t.id, t);

/** Producción > Tipos de tarea (pr_tipostarea). */
export const MaestroTipoTarea = () => (
    <MaestroSimple<TipoTarea>
        clase="MaestroTipoTarea"
        titulo="Tipos de tarea"
        textoNuevo="Nuevo tipo de tarea"
        metaTabla={metaTabla}
        consultas={consultas}
        tarjeta={(t) => (
            <div key={t.id}>
                <div>{t.id}</div>
                <div>{t.descripcion}</div>
            </div>
        )}
        crear={(publicar) => (
            <CrearSimple
                publicar={publicar}
                nombre="crearTipoTarea"
                titulo="Nuevo tipo de tarea"
                clase="CrearTipoTarea"
                meta={metaNuevoTipoTarea}
                vacio={nuevoTipoTareaVacio}
                crear={postTipoTarea}
                campos={({ uiProps }, focus) => (
                    <>
                        <QInput label="Código" {...uiProps("id")} maxLength={LONGITUD_CODIGO_TIPO_TAREA} ref={focus} />
                        <QInput label="Descripción" {...uiProps("descripcion")} maxLength={LONGITUD_DESCRIPCION_TIPO_TAREA} />
                        <QInput label="Tiempo medio" {...uiProps("tiempoMedio")} />
                    </>
                )}
            />
        )}
        detalle={(id, publicar) => (
            <DetalleSimple<TipoTarea>
                id={id}
                publicar={publicar}
                clase="DetalleTipoTarea"
                getUno={getTipoTarea}
                guardar={guardar}
                vacia={tipoTareaVacio}
                meta={metaTipoTarea}
                titulo={(t) => `${t.id} - ${t.descripcion}`}
                tituloBorrar="Borrar tipo de tarea"
                mensajeBorrar={(t) =>
                    `¿Está seguro de que desea borrar el tipo de tarea "${t.id}"? No se puede si lo usan tipos de proceso.`}
                borrar={deleteTipoTarea}
                campos={({ modelo, entidad }) => (
                    <quimera-formulario>
                        <QInput label="Código" nombre="id" valor={entidad.id} soloLectura />
                        <QInput label="Descripción" {...modelo.uiProps("descripcion")} maxLength={LONGITUD_DESCRIPCION_TIPO_TAREA} />
                        <QInput label="Tiempo medio" {...modelo.uiProps("tiempoMedio")} />
                    </quimera-formulario>
                )}
            />
        )}
    />
);
