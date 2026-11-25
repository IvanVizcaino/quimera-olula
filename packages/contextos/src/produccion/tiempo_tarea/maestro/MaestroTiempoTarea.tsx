import { Articulo } from "#/almacen/comun/componentes/Articulo.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { CrearSimple } from "../../comun/maestro_simple/CrearSimple.tsx";
import { DetalleSimple } from "../../comun/maestro_simple/DetalleSimple.tsx";
import { MaestroSimple } from "../../comun/maestro_simple/MaestroSimple.tsx";
import { SelectorTipoCentroCoste } from "../../tipo_centro_coste/SelectorTipoCentroCoste.tsx";
import { SelectorTareaProceso } from "../../tipo_proceso/SelectorTareaProceso.tsx";
import { TiempoTarea } from "../diseño.ts";
import {
    articuloDelTiempo,
    metaNuevoTiempoTarea,
    metaTiempoTarea,
    nuevoTiempoTareaVacio,
    tareaDelTiempo,
    tiempoTareaVacio,
} from "../dominio.ts";
import {
    deleteTiempoTarea,
    getTiemposTarea,
    getTiempoTarea,
    patchTiempoTarea,
    postTiempoTarea,
} from "../infraestructura.ts";
import { metaTablaTiempos } from "./diseño.ts";
import "./MaestroTiempoTarea.css";

const consultas = { getUno: getTiempoTarea, getLista: getTiemposTarea };

const guardar = (t: TiempoTarea) => patchTiempoTarea(t.id, t);

/** Producción > Tiempos de tarea (pr_costestarea): minutos de cada tarea por tipo de centro y artículo. */
export const MaestroTiempoTarea = () => (
    <MaestroSimple<TiempoTarea>
        clase="MaestroTiempoTarea"
        titulo="Tiempos de tarea"
        textoNuevo="Nuevo tiempo de tarea"
        metaTabla={metaTablaTiempos}
        consultas={consultas}
        tarjeta={(t) => (
            <div key={t.id}>
                <div>{tareaDelTiempo(t)}</div>
                <div>{t.tipoCentro || t.tipoCentroId} · {articuloDelTiempo(t)}</div>
            </div>
        )}
        crear={(publicar) => (
            <CrearSimple
                publicar={publicar}
                nombre="crearTiempoTarea"
                titulo="Nuevo tiempo de tarea"
                clase="CrearTiempoTarea FormTiempoTarea"
                meta={metaNuevoTiempoTarea}
                vacio={nuevoTiempoTareaVacio}
                crear={postTiempoTarea}
                campos={({ uiProps }) => (
                    <>
                        <SelectorTipoCentroCoste {...uiProps("tipoCentroId")} />
                        <SelectorTareaProceso {...uiProps("tareaProcesoId")} />
                        <Articulo label="Artículo (vacío: todos)" {...uiProps("articuloId", "articulo")} opcional />
                        <QInput label="Tiempo inicial (min)" {...uiProps("costeInicial")} />
                        <QInput label="Tiempo por unidad (min)" {...uiProps("costeUnidad")} />
                    </>
                )}
            />
        )}
        detalle={(id, publicar) => (
            <DetalleSimple<TiempoTarea>
                id={id}
                publicar={publicar}
                clase="DetalleTiempoTarea FormTiempoTarea"
                getUno={getTiempoTarea}
                guardar={guardar}
                vacia={tiempoTareaVacio}
                meta={metaTiempoTarea}
                titulo={(t) => `${t.tipoCentroId} · ${tareaDelTiempo(t)}`}
                tituloBorrar="Borrar tiempo de tarea"
                mensajeBorrar={(t) => `¿Está seguro de que desea borrar el tiempo de ${tareaDelTiempo(t)} en ${t.tipoCentroId}?`}
                borrar={deleteTiempoTarea}
                campos={({ modelo, entidad }) => (
                    <quimera-formulario>
                        <SelectorTipoCentroCoste {...modelo.uiProps("tipoCentroId")} descripcionActual={entidad.tipoCentro} />
                        <SelectorTareaProceso {...modelo.uiProps("tareaProcesoId")} descripcionActual={tareaDelTiempo(entidad)} />
                        <Articulo label="Artículo (vacío: todos)" {...modelo.uiProps("articuloId", "articulo")} opcional />
                        <QInput label="Tiempo inicial (min)" {...modelo.uiProps("costeInicial")} />
                        <QInput label="Tiempo por unidad (min)" {...modelo.uiProps("costeUnidad")} />
                    </quimera-formulario>
                )}
            />
        )}
    />
);
