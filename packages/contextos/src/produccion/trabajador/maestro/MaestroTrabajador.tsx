import { QCheckbox } from "@olula/componentes/atomos/qcheckbox.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { MetaTabla } from "@olula/componentes/index.js";
import { SelectorSeccion } from "../../seccion/SelectorSeccion.tsx";
import { comoBooleano } from "../../comun/dominio.ts";
import { CrearSimple } from "../../comun/maestro_simple/CrearSimple.tsx";
import { DetalleSimple } from "../../comun/maestro_simple/DetalleSimple.tsx";
import { MaestroSimple } from "../../comun/maestro_simple/MaestroSimple.tsx";
import { SeccionesTrabajador } from "../detalle/SeccionesTrabajador.tsx";
import { Trabajador } from "../diseño.ts";
import {
    LONGITUD_CODIGO_TRABAJADOR,
    LONGITUD_NOMBRE_TRABAJADOR,
    metaNuevoTrabajador,
    metaTrabajador,
    nuevoTrabajadorVacio,
    trabajadorVacio,
} from "../dominio.ts";
import {
    deleteTrabajador,
    getTrabajador,
    getTrabajadores,
    patchTrabajador,
    postTrabajador,
} from "../infraestructura.ts";
import "./MaestroTrabajador.css";

// Los id de columna son los campos de la API: con ellos se ordena y se filtra.
const metaTabla: MetaTabla<Trabajador> = [
    { id: "id", cabecera: "Código", estilo: "secundario" },
    { id: "nombre", cabecera: "Nombre", estilo: "destacado" },
    { id: "seccion", cabecera: "Sección principal", render: (t) => t.seccion || t.seccionId },
    { id: "de_baja", cabecera: "De baja", render: (t) => (comoBooleano(t.deBaja) ? "Sí" : "") },
];

const consultas = { getUno: getTrabajador, getLista: getTrabajadores };

const guardar = (t: Trabajador) =>
    patchTrabajador(t.id, { nombre: t.nombre, seccionId: t.seccionId, deBaja: t.deBaja });

/** Producción > Trabajadores (pr_trabajadores y sus secciones, pr_seccionestrab). */
export const MaestroTrabajador = () => (
    <MaestroSimple<Trabajador>
        clase="MaestroTrabajador"
        titulo="Trabajadores"
        textoNuevo="Nuevo trabajador"
        metaTabla={metaTabla}
        consultas={consultas}
        tarjeta={(t) => (
            <div key={t.id}>
                <div>{t.id} - {t.nombre}</div>
                <div>{t.seccion}{comoBooleano(t.deBaja) ? " (de baja)" : ""}</div>
            </div>
        )}
        crear={(publicar) => (
            <CrearSimple
                publicar={publicar}
                nombre="crearTrabajador"
                titulo="Nuevo trabajador"
                clase="CrearTrabajador FormTrabajador"
                meta={metaNuevoTrabajador}
                vacio={nuevoTrabajadorVacio}
                crear={postTrabajador}
                campos={({ uiProps }, focus) => (
                    <>
                        <QInput label="Código" {...uiProps("id")} maxLength={LONGITUD_CODIGO_TRABAJADOR} ref={focus} />
                        <QInput label="Nombre" {...uiProps("nombre")} maxLength={LONGITUD_NOMBRE_TRABAJADOR} />
                        <SelectorSeccion label="Sección principal" {...uiProps("seccionId")} />
                    </>
                )}
            />
        )}
        detalle={(id, publicar) => (
            <DetalleSimple<Trabajador>
                id={id}
                publicar={publicar}
                clase="DetalleTrabajador FormTrabajador"
                getUno={getTrabajador}
                guardar={guardar}
                vacia={trabajadorVacio}
                meta={metaTrabajador}
                titulo={(t) => `${t.id} - ${t.nombre}`}
                tituloBorrar="Borrar trabajador"
                mensajeBorrar={(t) =>
                    `¿Está seguro de que desea borrar el trabajador "${t.id}"? Si tiene tiempos de tareas no se puede borrar: márquelo de baja.`}
                borrar={deleteTrabajador}
                campos={({ modelo, entidad, recargar }) => (
                    <>
                        <quimera-formulario>
                            <QInput label="Código" nombre="id" valor={entidad.id} soloLectura />
                            <QInput label="Nombre" {...modelo.uiProps("nombre")} maxLength={LONGITUD_NOMBRE_TRABAJADOR} />
                            <SelectorSeccion label="Sección principal" {...modelo.uiProps("seccionId")}
                                descripcionActual={entidad.seccion} />
                            <QCheckbox label="De baja" {...modelo.uiProps("deBaja")} />
                        </quimera-formulario>
                        <SeccionesTrabajador trabajador={entidad} recargar={recargar} />
                    </>
                )}
            />
        )}
    />
);
