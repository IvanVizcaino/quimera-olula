import { MetaTabla } from "@olula/componentes/index.js";
import { MetaFiltro } from "@olula/componentes/maestro/maestroFiltros/MaestroFiltrosActivoControlado.tsx";
import { Criteria } from "@olula/lib/diseño.ts";
import { criteriaDefecto } from "@olula/lib/dominio.js";
import { ListaActivaEntidades } from "@olula/lib/ListaActivaEntidades.js";
import { ejercicioActual } from "#/contabilidad/asiento/dominio.ts";
import { Subcuenta } from "../diseño.ts";

export type EstadoMaestroSubcuenta = 'INICIAL' | 'CREANDO';

export type ContextoMaestroSubcuenta = {
    estado: EstadoMaestroSubcuenta;
    subcuentas: ListaActivaEntidades<Subcuenta>;
};

export const metaTablaSubcuenta: MetaTabla<Subcuenta> = [
    { id: 'codigo', cabecera: 'Código' },
    { id: 'nombre', cabecera: 'Descripción' },
    { id: 'codigoCuenta', cabecera: 'Cuenta' },
    { id: 'ejercicioId', cabecera: 'Ejercicio' },
];

/** Filtro explícito: el metaFiltro por defecto usaría el `id` camelCase de la
 * columna como nombre de campo de API, y la API espera snake_case. */
export const metaFiltroSubcuenta: MetaFiltro = {
    ejercicioId: {
        id: "ejercicioId",
        campo: "ejercicio_id",
        label: "Ejercicio",
        filtro: (valor) => {
            if (!valor || valor === "") return null;
            return ["ejercicio_id", "eq", valor as string];
        },
    },
    codigo: {
        id: "codigo",
        campo: "codigo",
        label: "Código",
        filtro: (valor) => {
            if (!valor || valor === "") return null;
            return ["codigo", "~", valor as string];
        },
    },
    nombre: {
        id: "nombre",
        campo: "nombre",
        label: "Descripción",
        filtro: (valor) => {
            if (!valor || valor === "") return null;
            return ["nombre", "~", valor as string];
        },
    },
};

export const criteriaSubcuentasDefecto = (): Criteria => ({
    ...criteriaDefecto,
    filtro: [["ejercicio_id", "eq", ejercicioActual()]],
    orden: ["codigo", "ASC"],
});
