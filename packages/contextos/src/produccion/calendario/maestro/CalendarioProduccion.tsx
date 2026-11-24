import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QDate } from "@olula/componentes/atomos/qdate.tsx";
import { QTabla } from "@olula/componentes/atomos/qtabla.tsx";
import { MetaTabla } from "@olula/componentes/index.js";
import { ContextoError } from "@olula/lib/contexto.ts";
import { useCallback, useContext, useEffect, useState } from "react";
import { fechaDdMmAaaa, tiempoEnHorasMinutos } from "../../comun/dominio.ts";
import { CambiarDiaCalendario } from "../cambiar_dia/CambiarDiaCalendario.tsx";
import { DiaCalendario, ResultadoGeneracion } from "../diseño.ts";
import { motivoRangoNoValido, rangoMes } from "../dominio.ts";
import { GenerarCalendario } from "../generar/GenerarCalendario.tsx";
import { getCalendarioRango } from "../infraestructura.ts";
import "./CalendarioProduccion.css";

const metaTabla: MetaTabla<DiaCalendario> = [
    { id: "fecha", cabecera: "Fecha", render: (d) => fechaDdMmAaaa(d.fecha) },
    { id: "descripcion", cabecera: "Día" },
    { id: "horario", cabecera: "Horario", render: (d) => d.horario || d.horarioId || "No laborable" },
    { id: "horaEntradaManana", cabecera: "Entrada mañana" },
    { id: "horaSalidaManana", cabecera: "Salida mañana" },
    { id: "horaEntradaTarde", cabecera: "Entrada tarde" },
    { id: "horaSalidaTarde", cabecera: "Salida tarde" },
    { id: "tiempo", cabecera: "Tiempo", render: (d) => tiempoEnHorasMinutos(d.tiempo) },
];

type Modal = { tipo: "generar" } | { tipo: "cambiar"; dia: DiaCalendario } | null;

/**
 * Producción > Calendario laboral (pr_calendario): los días de un rango de fechas con su
 * horario y su tiempo. Pulsando un día se cambia su horario; «Generar calendario» crea los días
 * de un rango a partir de los horarios de diario, sábado y domingo.
 */
export const CalendarioProduccion = () => {
    const { intentar } = useContext(ContextoError);
    const [rango, setRango] = useState(() => rangoMes(new Date()));
    const [dias, setDias] = useState<DiaCalendario[]>([]);
    const [cargando, setCargando] = useState(false);
    const [modal, setModal] = useState<Modal>(null);
    const [aviso, setAviso] = useState("");

    const motivo = motivoRangoNoValido(rango.desde, rango.hasta);

    const cargar = useCallback(async () => {
        if (motivoRangoNoValido(rango.desde, rango.hasta)) return;
        setCargando(true);
        try {
            setDias(await intentar(() => getCalendarioRango(rango.desde, rango.hasta)));
        } catch {
            setDias([]); // El error ya lo muestra la vista.
        } finally {
            setCargando(false);
        }
    }, [rango, intentar]);

    useEffect(() => {
        cargar();
    }, [cargar]);

    const generado = (r: ResultadoGeneracion) => {
        setModal(null);
        setAviso(`Generados ${r.dias} días del ${fechaDdMmAaaa(r.desde)} al ${fechaDdMmAaaa(r.hasta)}.`);
        setRango({ desde: r.desde, hasta: r.hasta });
    };

    const cambiado = () => {
        setModal(null);
        cargar();
    };

    const tiempoTotal = dias.reduce((total, d) => total + d.tiempo, 0);

    return (
        <div className="CalendarioProduccion">
            <h2>Calendario laboral</h2>
            <div className="calendario-filtros">
                <QDate label="Desde" nombre="desde" valor={rango.desde}
                    onChange={(desde) => setRango((r) => ({ ...r, desde }))} />
                <QDate label="Hasta" nombre="hasta" valor={rango.hasta}
                    onChange={(hasta) => setRango((r) => ({ ...r, hasta }))} />
                <div className="maestro-botones">
                    <QBoton onClick={() => setModal({ tipo: "generar" })}>Generar calendario</QBoton>
                </div>
            </div>
            {(motivo || aviso) && <p className="calendario-aviso">{motivo ?? aviso}</p>}
            {!motivo && (
                <>
                    <QTabla<DiaCalendario>
                        metaTabla={metaTabla}
                        datos={dias}
                        cargando={cargando}
                        orden={[]}
                        onSeleccion={(dia) => setModal({ tipo: "cambiar", dia })}
                    />
                    <p className="calendario-resumen">
                        {dias.length === 0 && !cargando
                            ? "No hay días generados en estas fechas."
                            : `${dias.length} días, ${dias.filter((d) => d.horarioId).length} laborables, ${tiempoEnHorasMinutos(tiempoTotal)} h de trabajo.`}
                    </p>
                </>
            )}

            {modal?.tipo === "generar" && (
                <GenerarCalendario onGenerado={generado} onCancelar={() => setModal(null)} />
            )}
            {modal?.tipo === "cambiar" && (
                <CambiarDiaCalendario dia={modal.dia} onCambiado={cambiado} onCancelar={() => setModal(null)} />
            )}
        </div>
    );
};
