import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QCheckbox } from "@olula/componentes/atomos/qcheckbox.tsx";
import { QSelect } from "@olula/componentes/atomos/qselect.tsx";
import { QTabla } from "@olula/componentes/atomos/qtabla.tsx";
import { MetaTabla } from "@olula/componentes/index.js";
import { ContextoError } from "@olula/lib/contexto.ts";
import { useContext, useState } from "react";
import { Secuencia, TipoProceso } from "../diseño.ts";
import { esSecuencial, motivoSecuenciaNoValida, nombreTarea } from "../dominio.ts";
import { deleteSecuencia, postSecuencia } from "../infraestructura.ts";

/**
 * Secuencias del tipo de proceso (`pr_secuencias`): qué tarea sigue a cuál. En un tipo secuencial
 * se regeneran solas (de cada tarea a la siguiente) y no se tocan a mano.
 */
export const SecuenciasTipoProceso = ({
    tipo,
    recargar,
}: {
    tipo: TipoProceso;
    recargar: () => Promise<void>;
}) => {
    const { intentar } = useContext(ContextoError);
    const [inicio, setInicio] = useState("");
    const [fin, setFin] = useState("");
    const [requerida, setRequerida] = useState(true);
    const secuencial = esSecuencial(tipo);

    const opciones = tipo.tareas.map((t) => ({ valor: t.id, descripcion: nombreTarea(t.codigo, t.descripcion) }));
    const motivo = motivoSecuenciaNoValida(inicio, fin, tipo.secuencias);

    const anadir = async () => {
        if (motivo) return;
        await intentar(() => postSecuencia(tipo.id, inicio, fin, requerida));
        setInicio("");
        setFin("");
        await recargar();
    };

    const quitar = (s: Secuencia) => async () => {
        await intentar(() => deleteSecuencia(tipo.id, s.tareaInicioId, s.tareaFinId));
        await recargar();
    };

    const metaTabla: MetaTabla<Secuencia> = [
        { id: "inicio", cabecera: "Tarea de inicio", render: (s) => nombreTarea(s.codigoInicio, s.descripcionInicio) },
        { id: "fin", cabecera: "Tarea de fin", render: (s) => nombreTarea(s.codigoFin, s.descripcionFin) },
        { id: "requerida", cabecera: "Requerida", ancho: "12%", render: (s) => (s.requerida ? "Sí" : "") },
        {
            id: "acciones",
            cabecera: "",
            ancho: "12%",
            render: (s) => !secuencial && (
                <QBoton variante="texto" tamaño="pequeño" destructivo onClick={quitar(s)}>Quitar</QBoton>
            ),
        },
    ];

    return (
        <div className="SecuenciasTipoProceso">
            <h3>Secuencias</h3>
            {secuencial ? (
                <p className="nota-secuencial">Tipo secuencial: las secuencias van de cada tarea a la siguiente y se regeneran solas.</p>
            ) : tipo.tareas.length > 1 && (
                <div className="anadir-secuencia">
                    <QSelect label="Tarea de inicio" nombre="secuenciaInicio" valor={inicio} opcional
                        opciones={opciones} onChange={(o) => setInicio(o?.valor ?? "")} />
                    <QSelect label="Tarea de fin" nombre="secuenciaFin" valor={fin} opcional
                        opciones={opciones} onChange={(o) => setFin(o?.valor ?? "")} />
                    <QCheckbox label="Requerida" nombre="secuenciaRequerida" valor={requerida}
                        onChange={(v) => setRequerida(v === "true")} />
                    <QBoton onClick={anadir} deshabilitado={!!motivo}>Añadir</QBoton>
                </div>
            )}
            {!secuencial && inicio && fin && motivo && <p className="motivo-secuencia">{motivo}</p>}
            <QTabla<Secuencia> metaTabla={metaTabla} datos={tipo.secuencias} cargando={false} orden={[]} />
        </div>
    );
};
