import { MetaTabla } from "@olula/componentes/index.js";
import { ListaActivaEntidades } from "@olula/lib/ListaActivaEntidades.js";
import { RegistroJornada } from "../diseño.ts";
import { minutosAHorasMinutos } from "../dominio.ts";

export type EstadoMaestroJornadas = 'INICIAL' | 'CREANDO_JORNADA' | 'APROBANDO_JORNADAS' | 'REVISANDO_JORNADAS';

export type ContextoMaestroJornadas = {
    estado: EstadoMaestroJornadas;
    jornadas: ListaActivaEntidades<RegistroJornada>;
    mediaMinutos: number;
    seleccionadas: string[];
};

export const metaTablaJornada: MetaTabla<RegistroJornada> = [
    {
        id: "empleadoId",
        cabecera: "Id",
    },
    {
        id: "empleado",
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
