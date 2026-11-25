import { DemoModulo } from "../diseño.ts";
import { fecha } from "./comun.ts";

/** Plantilla inventada de Hortalizas del Sur (almacén y oficina). */
const EMPLEADOS = [
    { id: "E001", nombre: "Lucía Herrera Gil" },
    { id: "E002", nombre: "Antonio Molina Ruiz" },
    { id: "E003", nombre: "Carmen Vidal Ortiz" },
    { id: "E004", nombre: "Sergio Navarro León" },
    { id: "E005", nombre: "Rocío Campos Prieto" },
];

type Pausa = [inicio: string, fin: string | null, causa: string];

const minutos = (hora: string): number => {
    const [h, m] = hora.split(":").map(Number);
    return h * 60 + m;
};

const duracion = (inicio: string, fin: string | null): number => (fin ? minutos(fin) - minutos(inicio) : 0);

/**
 * Jornada como la manda el servidor: los minutos de jornada son el tiempo entre
 * entrada y salida menos las pausas (0 mientras no hay salida).
 */
const jornada = (id: string, empleado: number, dias: number, entrada: string, salida: string | null,
    estado: "BORRADOR" | "APROBADA" | "ANULADA", estadoBorrador: "ACTIVA" | "PAUSADA" | "CERRADA" | null,
    pausas: Pausa[] = [], observaciones: string | null = null) => {
    const tiempoPausas = pausas.reduce((total, [inicio, fin]) => total + duracion(inicio, fin), 0);
    return {
        id, empleado_id: EMPLEADOS[empleado].id, empleado: EMPLEADOS[empleado].nombre, fecha: fecha(dias),
        hora_entrada: entrada, hora_salida: salida, estado, observaciones,
        tiempo_total_pausas: tiempoPausas,
        minutos_jornada: salida ? duracion(entrada, salida) - tiempoPausas : 0,
        estado_borrador: estadoBorrador,
        pausas: pausas.map(([inicio, fin, causa], i) => ({ id: `${id}-p${i + 1}`, hora_inicio: inicio, hora_fin: fin, causa })),
    };
};

const JORNADAS = [
    jornada("J01", 0, 0, "07:58", null, "BORRADOR", "ACTIVA", [["10:30", "10:50", "Desayuno"]]),
    jornada("J02", 1, 0, "06:30", null, "BORRADOR", "PAUSADA", [["10:00", null, "Desayuno"]]),
    jornada("J03", 2, -1, "08:02", "16:05", "BORRADOR", "CERRADA", [["11:00", "11:20", "Desayuno"]]),
    jornada("J04", 3, -1, "06:00", "14:10", "BORRADOR", "CERRADA", [["09:30", "10:00", "Desayuno"]],
        "Descarga de camión de cítricos"),
    jornada("J05", 4, -1, "09:00", "14:00", "BORRADOR", "CERRADA"),
    jornada("J06", 0, -2, "08:00", "17:30", "APROBADA", null,
        [["10:30", "10:50", "Desayuno"], ["14:00", "15:00", "Comida"]]),
    jornada("J07", 1, -2, "06:30", "14:30", "APROBADA", null, [["10:00", "10:20", "Desayuno"]]),
    jornada("J08", 2, -3, "08:00", "16:00", "ANULADA", null, [], "Fichaje duplicado"),
];

const conSalida = JORNADAS.filter((j) => j.hora_salida && j.estado !== "ANULADA");
const MEDIA_MINUTOS = Math.round(conSalida.reduce((t, j) => t + j.minutos_jornada, 0) / conSalida.length);

export const demo: DemoModulo = {
    pantallas: [{ nombre: "Registro de jornada", ruta: "/rrhh/registro_jornada" }],
    guia: "Abre una jornada para ver sus pausas, aprueba las cerradas o registra una nueva.",
    colecciones: {
        "rrhh/jornada": JORNADAS,
        "rrhh/empleado/tags": EMPLEADOS,
    },
    fijas: [
        // El listado lleva además la media de minutos de las jornadas.
        { metodo: "GET", ruta: "rrhh/jornada", cuerpo: { datos: JORNADAS, total: JORNADAS.length, media_minutos: MEDIA_MINUTOS } },
        { metodo: "PATCH", ruta: "rrhh/jornada/aprobar", cuerpo: {} },
        { metodo: "PATCH", ruta: /^rrhh\/jornada\/[^/]+\/anular$/, cuerpo: {} },
        {
            metodo: "GET",
            ruta: "rrhh/jornada/verificar",
            cuerpo: { datos: { verificada: true, total_eventos: 46, eventos_pre_firma: 0, primer_id_invalido: null } },
        },
    ],
};
