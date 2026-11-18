import { MetaTabla } from "@olula/componentes/index.js";
import { Criteria } from "@olula/lib/diseño.ts";
import { criteriaDefecto } from "@olula/lib/dominio.js";
import { ListaActivaEntidades } from "@olula/lib/ListaActivaEntidades.js";
import { Ejercicio } from "../diseño.ts";

export type EstadoMaestroEjercicio = "INICIAL" | "CREANDO";

export type ContextoMaestroEjercicio = {
    estado: EstadoMaestroEjercicio;
    ejercicios: ListaActivaEntidades<Ejercicio>;
};

export const metaTablaEjercicio: MetaTabla<Ejercicio> = [
    { id: "id", cabecera: "Código" },
    { id: "nombre", cabecera: "Nombre" },
    { id: "fechaInicio", cabecera: "Inicio", tipo: "fecha" },
    { id: "fechaFin", cabecera: "Fin", tipo: "fecha" },
    { id: "estado", cabecera: "Estado" },
];

export const criteriaEjerciciosDefecto = (): Criteria => ({
    ...criteriaDefecto,
    filtro: [],
    orden: ["fecha_inicio", "DESC"],
});
