import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { Tab, Tabs } from "@olula/componentes/detalle/tabs/Tabs.tsx";
import { MetaTabla } from "@olula/componentes/index.js";
import { puede } from "@olula/lib/dominio.ts";
import { TiemposTipoCentro } from "../../tiempo_tarea/TiemposTipoCentro.tsx";
import { CrearSimple } from "../../comun/maestro_simple/CrearSimple.tsx";
import { DetalleSimple } from "../../comun/maestro_simple/DetalleSimple.tsx";
import { MaestroSimple } from "../../comun/maestro_simple/MaestroSimple.tsx";
import { TipoCentroCoste } from "../diseño.ts";
import {
    LONGITUD_CODIGO_TIPO_CENTRO,
    LONGITUD_DESCRIPCION_TIPO_CENTRO,
    metaNuevoTipoCentroCoste,
    metaTipoCentroCoste,
    nuevoTipoCentroCosteVacio,
    tipoCentroCosteVacio,
} from "../dominio.ts";
import { deleteTipoCentroCoste, getTipoCentroCoste, getTiposCentroCoste, patchTipoCentroCoste, postTipoCentroCoste } from "../infraestructura.ts";

const metaTabla: MetaTabla<TipoCentroCoste> = [
    { id: "id", cabecera: "Código", estilo: "secundario", ancho: "25%" },
    { id: "descripcion", cabecera: "Descripción", estilo: "destacado" },
];

const consultas = { getUno: getTipoCentroCoste, getLista: getTiposCentroCoste };

const guardar = (s: TipoCentroCoste) => patchTipoCentroCoste(s.id, s);

/** Producción > Tipos de centro de coste (pr_tiposcentrocoste). */
export const MaestroTipoCentroCoste = () => (
    <MaestroSimple<TipoCentroCoste>
        clase="MaestroTipoCentroCoste"
        titulo="Tipos de centro de coste"
        textoNuevo="Nuevo tipo de centro de coste"
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
                nombre="crearTipoCentroCoste"
                titulo="Nuevo tipo de centro de coste"
                clase="CrearTipoCentroCoste"
                meta={metaNuevoTipoCentroCoste}
                vacio={nuevoTipoCentroCosteVacio}
                crear={postTipoCentroCoste}
                campos={({ uiProps }, focus) => (
                    <>
                        <QInput label="Código" {...uiProps("id")} maxLength={LONGITUD_CODIGO_TIPO_CENTRO} ref={focus} />
                        <QInput label="Descripción" {...uiProps("descripcion")} maxLength={LONGITUD_DESCRIPCION_TIPO_CENTRO} />
                    </>
                )}
            />
        )}
        detalle={(id, publicar) => (
            <DetalleSimple<TipoCentroCoste>
                id={id}
                publicar={publicar}
                clase="DetalleTipoCentroCoste"
                getUno={getTipoCentroCoste}
                guardar={guardar}
                vacia={tipoCentroCosteVacio}
                meta={metaTipoCentroCoste}
                titulo={(s) => `${s.id} - ${s.descripcion}`}
                tituloBorrar="Borrar tipo de centro de coste"
                mensajeBorrar={(s) => `¿Está seguro de que desea borrar el tipo de centro de coste "${s.id}"?`}
                borrar={deleteTipoCentroCoste}
                campos={({ modelo, entidad }) => {
                    const formulario = (
                        <quimera-formulario>
                            <QInput label="Código" nombre="id" valor={entidad.id} soloLectura />
                            <QInput label="Descripción" {...modelo.uiProps("descripcion")} maxLength={LONGITUD_DESCRIPCION_TIPO_CENTRO} />
                        </quimera-formulario>
                    );
                    if (!puede("produccion.tiempo_tarea")) return formulario;
                    return (
                        <Tabs
                            children={[
                                <Tab key="general" label="General" children={formulario} />,
                                <Tab key="tiempos" label="Tiempos" children={<TiemposTipoCentro tipoCentroId={entidad.id} />} />,
                            ]}
                        />
                    );
                }}
            />
        )}
    />
);
