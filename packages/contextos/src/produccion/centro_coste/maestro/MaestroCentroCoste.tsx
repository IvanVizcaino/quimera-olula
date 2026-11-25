import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { MetaTabla } from "@olula/componentes/index.js";
import { SelectorTipoCentroCoste } from "../../tipo_centro_coste/SelectorTipoCentroCoste.tsx";
import { CrearSimple } from "../../comun/maestro_simple/CrearSimple.tsx";
import { DetalleSimple } from "../../comun/maestro_simple/DetalleSimple.tsx";
import { MaestroSimple } from "../../comun/maestro_simple/MaestroSimple.tsx";
import { CentroCoste } from "../diseño.ts";
import {
    centroCosteVacio,
    LONGITUD_CODIGO_CENTRO,
    LONGITUD_DESCRIPCION_CENTRO,
    metaCentroCoste,
    metaNuevoCentroCoste,
    nuevoCentroCosteVacio,
} from "../dominio.ts";
import {
    deleteCentroCoste,
    getCentroCoste,
    getCentrosCoste,
    patchCentroCoste,
    postCentroCoste,
} from "../infraestructura.ts";

const metaTabla: MetaTabla<CentroCoste> = [
    { id: "id", cabecera: "Código", estilo: "secundario", ancho: "20%" },
    { id: "descripcion", cabecera: "Descripción", estilo: "destacado" },
    { id: "tipo_centro", cabecera: "Tipo de centro", render: (c) => c.tipoCentro || c.tipoCentroId },
];

const consultas = { getUno: getCentroCoste, getLista: getCentrosCoste };

const guardar = (c: CentroCoste) => patchCentroCoste(c.id, c);

/** Producción > Centros de coste (pr_centroscoste). */
export const MaestroCentroCoste = () => (
    <MaestroSimple<CentroCoste>
        clase="MaestroCentroCoste"
        titulo="Centros de coste"
        textoNuevo="Nuevo centro de coste"
        metaTabla={metaTabla}
        consultas={consultas}
        tarjeta={(c) => (
            <div key={c.id}>
                <div>{c.id}</div>
                <div>{c.descripcion}</div>
                <div>{c.tipoCentro}</div>
            </div>
        )}
        crear={(publicar) => (
            <CrearSimple
                publicar={publicar}
                nombre="crearCentroCoste"
                titulo="Nuevo centro de coste"
                clase="CrearCentroCoste"
                meta={metaNuevoCentroCoste}
                vacio={nuevoCentroCosteVacio}
                crear={postCentroCoste}
                campos={({ uiProps }, focus) => (
                    <>
                        <QInput label="Código" {...uiProps("id")} maxLength={LONGITUD_CODIGO_CENTRO} ref={focus} />
                        <QInput label="Descripción" {...uiProps("descripcion")} maxLength={LONGITUD_DESCRIPCION_CENTRO} />
                        <SelectorTipoCentroCoste {...uiProps("tipoCentroId")} />
                    </>
                )}
            />
        )}
        detalle={(id, publicar) => (
            <DetalleSimple<CentroCoste>
                id={id}
                publicar={publicar}
                clase="DetalleCentroCoste"
                getUno={getCentroCoste}
                guardar={guardar}
                vacia={centroCosteVacio}
                meta={metaCentroCoste}
                titulo={(c) => `${c.id} - ${c.descripcion}`}
                tituloBorrar="Borrar centro de coste"
                mensajeBorrar={(c) => `¿Está seguro de que desea borrar el centro de coste "${c.id}"?`}
                borrar={deleteCentroCoste}
                campos={({ modelo, entidad }) => (
                    <quimera-formulario>
                        <QInput label="Código" nombre="id" valor={entidad.id} soloLectura />
                        <QInput label="Descripción" {...modelo.uiProps("descripcion")} maxLength={LONGITUD_DESCRIPCION_CENTRO} />
                        <SelectorTipoCentroCoste {...modelo.uiProps("tipoCentroId")} descripcionActual={entidad.tipoCentro} />
                    </quimera-formulario>
                )}
            />
        )}
    />
);
