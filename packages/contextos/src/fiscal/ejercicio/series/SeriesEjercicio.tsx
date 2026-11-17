import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QSelect } from "@olula/componentes/atomos/qselect.tsx";
import { MetaTabla, QTabla } from "@olula/componentes/atomos/qtabla.tsx";
import { QModal } from "@olula/componentes/moleculas/qmodal.tsx";
import { ContextoError } from "@olula/lib/contexto.ts";
import { ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Ejercicio, SerieEjercicio } from "#/contabilidad/ejercicio/diseño.ts";
import { etiquetaEjercicio } from "#/contabilidad/ejercicio/dominio.ts";
import {
    deleteSerieEjercicio,
    getOpcionesSeries,
    getSeriesEjercicio,
    postCopiarSeries,
    postSerieEjercicio,
} from "#/contabilidad/ejercicio/infraestructura.ts";

const metaTablaSeries: MetaTabla<SerieEjercicio> = [
    { id: "serieId", cabecera: "Serie" },
    { id: "descripcion", cabecera: "Descripción" },
];

type Opcion = { valor: string; descripcion: string };
type Dialogo = "" | "anadir" | "copiar";

/** Un desplegable y su botón en un modal (añadir una serie, copiar series). */
const ElegirEnModal = ({ nombre, titulo, label, opciones, boton, onAceptar, onCerrar }: {
    nombre: string;
    titulo: string;
    label: string;
    opciones: Opcion[];
    boton: string;
    onAceptar: (valor: string) => Promise<void>;
    onCerrar: () => void;
}) => {
    const [valor, setValor] = useState("");
    return (
        <QModal abierto={true} nombre={nombre} titulo={titulo} onCerrar={onCerrar}>
            <quimera-formulario>
                <QSelect label={label} nombre={nombre} valor={valor} opciones={opciones}
                    onChange={(o) => setValor(o?.valor ?? "")} />
            </quimera-formulario>
            <div className="botones maestro-botones">
                <QBoton onClick={() => onAceptar(valor)} deshabilitado={!valor}>{boton}</QBoton>
            </div>
        </QModal>
    );
};

/** Pestaña «Series» de `ejercicios.ui` (secuenciasejercicios): añadir, quitar,
 * «Copiar series» de otro ejercicio (solo añade las que faltan) y lo que se
 * haga con la serie elegida (`accionesSerie`, p. ej. «Secuencias por serie»). */
export const SeriesEjercicio = ({
    ejercicio,
    ejercicios,
    editable,
    accionesSerie,
}: {
    ejercicio: Ejercicio;
    ejercicios: Ejercicio[];
    editable: boolean;
    accionesSerie?: (serie: SerieEjercicio | null) => ReactNode;
}) => {
    const { intentar } = useContext(ContextoError);
    const [series, setSeries] = useState<SerieEjercicio[]>([]);
    const [cargando, setCargando] = useState(true);
    const [activa, setActiva] = useState<SerieEjercicio | null>(null);
    const [opcionesSeries, setOpcionesSeries] = useState<Opcion[]>([]);
    const [dialogo, setDialogo] = useState<Dialogo>("");

    const recargar = useCallback(async () => {
        setCargando(true);
        try {
            setSeries(await getSeriesEjercicio(ejercicio.id));
        } finally {
            setCargando(false);
        }
    }, [ejercicio.id]);

    useEffect(() => { recargar(); }, [recargar]);
    useEffect(() => { getOpcionesSeries().then(setOpcionesSeries).catch(() => setOpcionesSeries([])); }, []);

    const libres = useMemo(
        () => opcionesSeries.filter((o) => !series.some((s) => s.serieId === o.valor)),
        [opcionesSeries, series],
    );
    const otrosEjercicios = useMemo(
        () => ejercicios.filter((e) => e.id !== ejercicio.id)
            .map((e) => ({ valor: e.id, descripcion: etiquetaEjercicio(e) })),
        [ejercicios, ejercicio.id],
    );

    const anadir = async (serieId: string) => {
        await intentar(() => postSerieEjercicio(ejercicio.id, serieId));
        setDialogo("");
        await recargar();
    };

    const quitar = async () => {
        if (!activa) return;
        await intentar(() => deleteSerieEjercicio(ejercicio.id, activa.serieId));
        setActiva(null);
        await recargar();
    };

    const copiar = async (origen: string) => {
        await intentar(() => postCopiarSeries(ejercicio.id, origen));
        setDialogo("");
        await recargar();
    };

    return (
        <div className="SeriesEjercicio">
            <div className="botones maestro-botones">
                {editable && (
                    <>
                        <QBoton onClick={() => setDialogo("anadir")}>Añadir serie</QBoton>
                        <QBoton onClick={quitar} deshabilitado={!activa}>Quitar serie</QBoton>
                        <QBoton onClick={() => setDialogo("copiar")}>Copiar series</QBoton>
                    </>
                )}
                {accionesSerie?.(activa)}
            </div>
            <QTabla metaTabla={metaTablaSeries} datos={series} cargando={cargando}
                seleccionadaId={activa?.id} onSeleccion={setActiva}
                orden={["serieId", "ASC"]} totalEntidades={series.length} />

            {dialogo === "anadir" && (
                <ElegirEnModal nombre="anadirSerieEjercicio" titulo="Añadir serie" label="Serie"
                    opciones={libres} boton="Añadir" onAceptar={anadir} onCerrar={() => setDialogo("")} />
            )}
            {dialogo === "copiar" && (
                <ElegirEnModal nombre="copiarSeriesEjercicio" titulo="Copiar series"
                    label="Copiar las series del ejercicio" opciones={otrosEjercicios} boton="Copiar"
                    onAceptar={copiar} onCerrar={() => setDialogo("")} />
            )}
        </div>
    );
};
