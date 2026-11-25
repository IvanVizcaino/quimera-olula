import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { MetaTabla } from "@olula/componentes/index.js";
import { CrearSimple } from "../../comun/maestro_simple/CrearSimple.tsx";
import { DetalleSimple } from "../../comun/maestro_simple/DetalleSimple.tsx";
import { MaestroSimple } from "../../comun/maestro_simple/MaestroSimple.tsx";
import { Seccion } from "../diseño.ts";
import {
    LONGITUD_CODIGO_SECCION,
    LONGITUD_DESCRIPCION_SECCION,
    metaNuevaSeccion,
    metaSeccion,
    nuevaSeccionVacia,
    seccionVacia,
} from "../dominio.ts";
import { deleteSeccion, getSeccion, getSecciones, patchSeccion, postSeccion } from "../infraestructura.ts";

const metaTabla: MetaTabla<Seccion> = [
    { id: "id", cabecera: "Código", estilo: "secundario", ancho: "25%" },
    { id: "descripcion", cabecera: "Descripción", estilo: "destacado" },
];

const consultas = { getUno: getSeccion, getLista: getSecciones };

const guardar = (s: Seccion) => patchSeccion(s.id, s);

/** Producción > Secciones (pr_secciones). */
export const MaestroSeccion = () => (
    <MaestroSimple<Seccion>
        clase="MaestroSeccion"
        titulo="Secciones"
        textoNuevo="Nueva sección"
        metaTabla={metaTabla}
        consultas={consultas}
        tarjeta={(s) => (
            <div key={s.id}>
                <div>{s.id}</div>
                <div>{s.descripcion}</div>
            </div>
        )}
        crear={(publicar) => (
            <CrearSimple
                publicar={publicar}
                nombre="crearSeccion"
                titulo="Nueva sección"
                clase="CrearSeccion"
                meta={metaNuevaSeccion}
                vacio={nuevaSeccionVacia}
                crear={postSeccion}
                campos={({ uiProps }, focus) => (
                    <>
                        <QInput label="Código" {...uiProps("id")} maxLength={LONGITUD_CODIGO_SECCION} ref={focus} />
                        <QInput label="Descripción" {...uiProps("descripcion")} maxLength={LONGITUD_DESCRIPCION_SECCION} />
                    </>
                )}
            />
        )}
        detalle={(id, publicar) => (
            <DetalleSimple<Seccion>
                id={id}
                publicar={publicar}
                clase="DetalleSeccion"
                getUno={getSeccion}
                guardar={guardar}
                vacia={seccionVacia}
                meta={metaSeccion}
                titulo={(s) => `${s.id} - ${s.descripcion}`}
                tituloBorrar="Borrar sección"
                mensajeBorrar={(s) => `¿Está seguro de que desea borrar la sección "${s.id}"?`}
                borrar={deleteSeccion}
                campos={({ modelo, entidad }) => (
                    <quimera-formulario>
                        <QInput label="Código" nombre="id" valor={entidad.id} soloLectura />
                        <QInput label="Descripción" {...modelo.uiProps("descripcion")} maxLength={LONGITUD_DESCRIPCION_SECCION} />
                    </quimera-formulario>
                )}
            />
        )}
    />
);
