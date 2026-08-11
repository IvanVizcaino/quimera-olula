import { MetaTabla } from "@olula/componentes/index.js";
import { ListaActivaEntidades } from "@olula/lib/ListaActivaEntidades.js";
import { minutosAHorasMinutos } from "../dominio.ts";
import { RegistroJornada } from "../diseño.ts";

export type EstadoMaestroJornadas = 'INICIAL' | 'CREANDO_JORNADA';

export type ContextoMaestroJornadas = {
    estado: EstadoMaestroJornadas;
    jornadas: ListaActivaEntidades<RegistroJornada>;
    mediaMinutos: number;
};

export const metaTablaJornada: MetaTabla<RegistroJornada> = [
    {
        id: "empleadoId",
        cabecera: "Empleado",
    },
    {
        id: "fecha",
        cabecera: "Fecha",
        tipo: "fecha",
    },
    {
        id: "horaEntrada",
        cabecera: "Entrada",
    },
    {
        id: "horaSalida",
        cabecera: "Salida",
    },
    {
        id: "estado",
        cabecera: "Estado",
    },
    {
        id: "minutosJornada",
        cabecera: "Jornada",
        render: (j: RegistroJornada) => minutosAHorasMinutos(j.minutosJornada),
    },
];
