import { QIcono } from "@olula/componentes/atomos/qicono.tsx";
import { useEffect, useState } from "react";
import { RegistroJornada } from "../diseño.ts";
import { minutosAHorasMinutos } from "../dominio.ts";
import "./Cronometro.css";

const horaAMinutos = (hora: string): number => {
    const [hh, mm] = hora.split(":").map(Number);
    return hh * 60 + mm;
};

const horaActualString = (): string => {
    const ahora = new Date();
    return `${String(ahora.getHours()).padStart(2, "0")}:${String(ahora.getMinutes()).padStart(2, "0")}`;
};

const entreHoras = (inicio: string, fin: string): number =>
    Math.max(0, horaAMinutos(fin) - horaAMinutos(inicio));

// Calcula minutos de pausas ya terminadas directamente del array pausas,
// sin depender del campo tiempoTotalPausas del servidor (cuya unidad es incierta)
const minutosPausasCompletadas = (jornada: RegistroJornada): number =>
    jornada.pausas
        .filter((p) => p.horaFin !== null)
        .reduce((total, p) => total + entreHoras(p.horaInicio, p.horaFin!), 0);

const calcularTrabajados = (jornada: RegistroJornada): number => {
    if (!jornada.horaEntrada) return jornada.minutosJornada;

    const pausasCompletadas = minutosPausasCompletadas(jornada);

    if (jornada.estadoBorrador === "PAUSADA") {
        const pausaActiva = jornada.pausas.find((p) => p.horaFin === null);
        if (pausaActiva) {
            return Math.max(0, entreHoras(jornada.horaEntrada, pausaActiva.horaInicio) - pausasCompletadas);
        }
    }

    // ACTIVA: tiempo desde entrada hasta ahora, menos pausas completadas
    return Math.max(0, entreHoras(jornada.horaEntrada, horaActualString()) - pausasCompletadas);
};

const calcularPausados = (jornada: RegistroJornada): number => {
    const completadas = minutosPausasCompletadas(jornada);
    const pausaActiva = jornada.pausas.find((p) => p.horaFin === null);
    if (!pausaActiva) return completadas;
    return completadas + entreHoras(pausaActiva.horaInicio, horaActualString());
};

export const Cronometro = ({ jornada }: { jornada: RegistroJornada }) => {
    const enVivo = jornada.estadoBorrador === "ACTIVA";
    const enPausa = jornada.estadoBorrador === "PAUSADA";
    const corriendo = enVivo || enPausa;

    const [trabajados, setTrabajados] = useState<number>(() =>
        corriendo ? calcularTrabajados(jornada) : jornada.minutosJornada
    );
    const [pausados, setPausados] = useState<number>(() => calcularPausados(jornada));

    useEffect(() => {
        const actualizar = () => {
            setTrabajados(corriendo ? calcularTrabajados(jornada) : jornada.minutosJornada);
            setPausados(calcularPausados(jornada));
        };

        actualizar();

        if (!corriendo) return;

        const interval = setInterval(actualizar, 60_000);
        return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [enVivo, enPausa, jornada.horaEntrada, jornada.minutosJornada, jornada.pausas]);

    const mostrarPausa = enPausa || jornada.pausas.some((p) => p.horaFin !== null);

    return (
        <div className="Cronometro">
            {jornada.empleado && <span className="Cronometro-empleado">{jornada.empleado}</span>}
            <time className="Cronometro-tiempo">{minutosAHorasMinutos(trabajados)}</time>
            {mostrarPausa && (
                <div className="Cronometro-pausa">
                    <QIcono nombre="pausa_relleno" tamaño="md"/>
                    <time>{minutosAHorasMinutos(pausados)}</time>
                </div>
            )}
        </div>
    );
};
