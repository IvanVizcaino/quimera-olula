import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { MetaTabla } from "@olula/componentes/index.js";
import { HookModelo } from "@olula/lib/useModelo.ts";
import { tiempoEnHorasMinutos } from "../../comun/dominio.ts";
import { CrearSimple } from "../../comun/maestro_simple/CrearSimple.tsx";
import { DetalleSimple } from "../../comun/maestro_simple/DetalleSimple.tsx";
import { MaestroSimple } from "../../comun/maestro_simple/MaestroSimple.tsx";
import { Horario, HorasHorario, NuevoHorario } from "../diseño.ts";
import {
    horarioVacio,
    LONGITUD_CODIGO_HORARIO,
    LONGITUD_DESCRIPCION_HORARIO,
    metaHorario,
    metaNuevoHorario,
    motivoHorasNoValidas,
    nuevoHorarioVacio,
    tiempoHorario,
} from "../dominio.ts";
import { deleteHorario, getHorario, getHorarios, patchHorario, postHorario } from "../infraestructura.ts";
import "./MaestroHorario.css";

// Los id de columna son los campos de la API: con ellos se ordena.
const metaTabla: MetaTabla<Horario> = [
    { id: "id", cabecera: "Código", estilo: "secundario" },
    { id: "descripcion", cabecera: "Descripción", estilo: "destacado" },
    { id: "hora_entrada_manana", cabecera: "Entrada mañana", render: (h) => h.horaEntradaManana },
    { id: "hora_salida_manana", cabecera: "Salida mañana", render: (h) => h.horaSalidaManana },
    { id: "hora_entrada_tarde", cabecera: "Entrada tarde", render: (h) => h.horaEntradaTarde },
    { id: "hora_salida_tarde", cabecera: "Salida tarde", render: (h) => h.horaSalidaTarde },
    { id: "tiempo", cabecera: "Tiempo", render: (h) => tiempoEnHorasMinutos(h.tiempo) },
];

const consultas = { getUno: getHorario, getLista: getHorarios };

const guardar = (h: Horario) => patchHorario(h.id, h);

/** Las cuatro horas y el tiempo que suman (calculado al vuelo; el servidor guarda el suyo). */
const CamposHoras = <T extends NuevoHorario | Horario>({ modelo }: { modelo: HookModelo<T> }) => {
    const motivo = motivoHorasNoValidas(modelo.modelo as HorasHorario);
    return (
        <>
            <QInput label="Entrada mañana" {...modelo.uiProps("horaEntradaManana")} opcional />
            <QInput label="Salida mañana" {...modelo.uiProps("horaSalidaManana")} opcional />
            <QInput label="Entrada tarde" {...modelo.uiProps("horaEntradaTarde")} opcional />
            <QInput label="Salida tarde" {...modelo.uiProps("horaSalidaTarde")} opcional />
            <QInput
                label="Tiempo (h:mm)"
                nombre="tiempo"
                valor={tiempoEnHorasMinutos(tiempoHorario(modelo.modelo as HorasHorario))}
                soloLectura
            />
            {motivo && <p className="aviso-horas">{motivo}</p>}
        </>
    );
};

/** Producción > Horarios (pr_horarios). */
export const MaestroHorario = () => (
    <MaestroSimple<Horario>
        clase="MaestroHorario"
        titulo="Horarios"
        textoNuevo="Nuevo horario"
        metaTabla={metaTabla}
        consultas={consultas}
        tarjeta={(h) => (
            <div key={h.id}>
                <div>{h.id} - {h.descripcion}</div>
                <div>{tiempoEnHorasMinutos(h.tiempo)} h</div>
            </div>
        )}
        crear={(publicar) => (
            <CrearSimple
                publicar={publicar}
                nombre="crearHorario"
                titulo="Nuevo horario"
                clase="CrearHorario FormHorario"
                meta={metaNuevoHorario}
                vacio={nuevoHorarioVacio}
                crear={postHorario}
                campos={(modelo, focus) => (
                    <>
                        <QInput label="Código" {...modelo.uiProps("id")} maxLength={LONGITUD_CODIGO_HORARIO} ref={focus} />
                        <QInput label="Descripción" {...modelo.uiProps("descripcion")} maxLength={LONGITUD_DESCRIPCION_HORARIO} />
                        <CamposHoras modelo={modelo} />
                    </>
                )}
            />
        )}
        detalle={(id, publicar) => (
            <DetalleSimple<Horario>
                id={id}
                publicar={publicar}
                clase="DetalleHorario FormHorario"
                getUno={getHorario}
                guardar={guardar}
                vacia={horarioVacio}
                meta={metaHorario}
                titulo={(h) => `${h.id} - ${h.descripcion}`}
                tituloBorrar="Borrar horario"
                mensajeBorrar={(h) => `¿Está seguro de que desea borrar el horario "${h.id}"?`}
                borrar={deleteHorario}
                campos={({ modelo, entidad }) => (
                    <quimera-formulario>
                        <QInput label="Código" nombre="id" valor={entidad.id} soloLectura />
                        <QInput label="Descripción" {...modelo.uiProps("descripcion")} maxLength={LONGITUD_DESCRIPCION_HORARIO} />
                        <CamposHoras modelo={modelo} />
                    </quimera-formulario>
                )}
            />
        )}
    />
);
