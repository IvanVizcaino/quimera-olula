import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { MetaTabla, QTabla } from "@olula/componentes/atomos/qtabla.tsx";
import { QModal } from "@olula/componentes/moleculas/qmodal.tsx";
import { ContextoError } from "@olula/lib/contexto.ts";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { FilaFormulario } from "#/contabilidad/comun/componentes/FilaFormulario.tsx";
import { SecuenciaSerie } from "../diseño.ts";
import { cambiosSecuencia, datosSecuencia, metaDatosSecuencia } from "../dominio.ts";
import { getSecuenciasSerie, patchSecuenciaSerie } from "../infraestructura.ts";

const metaTablaSecuencias: MetaTabla<SecuenciaSerie> = [
    { id: "nombre", cabecera: "Nombre" },
    { id: "descripcion", cabecera: "Descripción" },
    { id: "valor", cabecera: "Valor", tipo: "numero" },
    { id: "valorout", cabecera: "Valor sin bloqueo", tipo: "numero" },
    { id: "valorini", cabecera: "Valor inicial", tipo: "numero" },
];

/** Formulario `secuencias` de Eneboo: el nombre no se cambia. */
const EditarSecuencia = ({ secuencia, onGuardar }: {
    secuencia: SecuenciaSerie;
    onGuardar: (s: SecuenciaSerie, cambios: ReturnType<typeof cambiosSecuencia>) => Promise<void>;
}) => {
    const inicial = useMemo(() => datosSecuencia(secuencia), [secuencia]);
    const { modelo, uiProps, valido } = useModelo(metaDatosSecuencia, inicial);
    const cambios = cambiosSecuencia(secuencia, modelo);
    return (
        <div className="EditarSecuencia">
            <quimera-formulario>
                <FilaFormulario columnas="1fr 2fr">
                    <QInput label="Nombre" nombre="nombre" valor={secuencia.nombre} soloLectura />
                    <QInput label="Descripción" {...uiProps("descripcion")} />
                </FilaFormulario>
                <FilaFormulario>
                    <QInput label="Valor" {...uiProps("valor")} />
                    <QInput label="Valor sin bloqueo" {...uiProps("valorout")} />
                    <QInput label="Valor inicial" {...uiProps("valorini")} />
                </FilaFormulario>
            </quimera-formulario>
            <div className="botones maestro-botones">
                <QBoton onClick={() => onGuardar(secuencia, cambios)}
                    deshabilitado={!valido || Object.keys(cambios).length === 0}>
                    Guardar
                </QBoton>
            </div>
        </div>
    );
};

/** Botón «Secuencias por serie» (formulario secuenciasejercicios): las
 * secuencias de numeración de la serie en el ejercicio, editables. */
export const SecuenciasSerie = ({ ejercicioId, serieId, editable, onCerrar }: {
    ejercicioId: string;
    serieId: string;
    editable: boolean;
    onCerrar: () => void;
}) => {
    const { intentar } = useContext(ContextoError);
    const [secuencias, setSecuencias] = useState<SecuenciaSerie[]>([]);
    const [cargando, setCargando] = useState(true);
    const [activa, setActiva] = useState<SecuenciaSerie | null>(null);

    const recargar = useCallback(async () => {
        setCargando(true);
        try {
            const lista = await getSecuenciasSerie(ejercicioId, serieId);
            setSecuencias(lista);
            setActiva((a) => (a ? lista.find((s) => s.id === a.id) ?? null : null));
        } finally {
            setCargando(false);
        }
    }, [ejercicioId, serieId]);

    useEffect(() => { recargar(); }, [recargar]);

    const guardar = async (s: SecuenciaSerie, cambios: ReturnType<typeof cambiosSecuencia>) => {
        await intentar(() => patchSecuenciaSerie(ejercicioId, serieId, s.nombre, cambios));
        await recargar();
    };

    return (
        <QModal abierto={true} nombre="secuenciasSerie"
            titulo={`Secuencias de la serie ${serieId} en el ejercicio ${ejercicioId}`}
            onCerrar={onCerrar}>
            <div className="SecuenciasSerie">
                <QTabla metaTabla={metaTablaSecuencias} datos={secuencias} cargando={cargando}
                    seleccionadaId={activa?.id} onSeleccion={setActiva}
                    orden={["", "ASC"]} totalEntidades={secuencias.length} />
                {editable && activa && (
                    <EditarSecuencia key={`${activa.id}|${activa.idsec}|${activa.valorout}|${activa.valor}|${activa.valorini}|${activa.descripcion}`}
                        secuencia={activa} onGuardar={guardar} />
                )}
            </div>
        </QModal>
    );
};
