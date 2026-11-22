import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { MetaTabla, QTabla } from "@olula/componentes/atomos/qtabla.tsx";
import { formatearFechaDate } from "@olula/lib/dominio.ts";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Ejercicio, FilaAsientoEjercicio } from "../diseño.ts";
import { urlAsiento } from "../dominio.ts";
import { getFilasAsientosEjercicio } from "../infraestructura.ts";

const metaTablaAsientos: MetaTabla<FilaAsientoEjercicio> = [
    { id: "titulo", cabecera: "Asiento" },
    { id: "numero", cabecera: "Número", tipo: "numero" },
    { id: "fecha", cabecera: "Fecha", render: (f) => (f.fecha ? formatearFechaDate(f.fecha) : "") },
    { id: "concepto", cabecera: "Concepto" },
    { id: "importe", cabecera: "Importe", tipo: "moneda" },
];

/** Asientos del ejercicio (apertura, regularización y cierre, los que haya)
 * con «Ir a ver asiento», que abre la fila elegida en Contabilidad > Asientos.
 * La usan Contabilidad > Apertura y Cierre de Ejercicio y la pestaña Asientos
 * de Fiscalidad > Ejercicios fiscales. */
export const AsientosEjercicio = ({ ejercicio }: { ejercicio: Ejercicio }) => {
    const navigate = useNavigate();
    const [filas, setFilas] = useState<FilaAsientoEjercicio[]>([]);
    const [cargando, setCargando] = useState(true);
    const [activa, setActiva] = useState<FilaAsientoEjercicio | null>(null);

    useEffect(() => {
        let vigente = true;
        setCargando(true);
        setActiva(null);
        getFilasAsientosEjercicio(ejercicio)
            .then((f) => vigente && setFilas(f))
            .finally(() => vigente && setCargando(false));
        return () => { vigente = false; };
    }, [ejercicio]);

    const irAlAsiento = () => {
        if (activa) navigate(urlAsiento(activa.id, activa.ejercicioId));
    };

    return (
        <div className="AsientosEjercicio">
            <div className="maestro-botones">
                <QBoton onClick={irAlAsiento} deshabilitado={!activa || activa.numero === null}>
                    Ir a ver asiento
                </QBoton>
            </div>
            {!cargando && filas.length === 0
                ? <p>El ejercicio no tiene asientos de apertura, regularización ni cierre.</p>
                : (
                    <QTabla metaTabla={metaTablaAsientos} datos={filas} cargando={cargando}
                        seleccionadaId={activa?.id} onSeleccion={setActiva}
                        orden={["", "ASC"]} totalEntidades={filas.length} />
                )}
        </div>
    );
};
