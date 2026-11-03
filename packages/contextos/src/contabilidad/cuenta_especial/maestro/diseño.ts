import { MetaTabla } from "@olula/componentes/index.js";
import { MetaFiltro } from "@olula/componentes/maestro/maestroFiltros/MaestroFiltrosActivoControlado.tsx";
import { Criteria } from "@olula/lib/diseño.ts";
import { criteriaDefecto } from "@olula/lib/dominio.js";
import { ListaActivaEntidades } from "@olula/lib/ListaActivaEntidades.js";
import { CuentaEspecial } from "../diseño.ts";

export type EstadoMaestroCuentaEspecial = 'INICIAL' | 'CREANDO';

export type ContextoMaestroCuentaEspecial = {
    estado: EstadoMaestroCuentaEspecial;
    cuentasEspeciales: ListaActivaEntidades<CuentaEspecial>;
};

export const metaTablaCuentaEspecial: MetaTabla<CuentaEspecial> = [
    { id: 'id', cabecera: 'Código' },
    { id: 'descripcion', cabecera: 'Descripción' },
    { id: 'codigoCuenta', cabecera: 'Cuenta' },
    { id: 'codigoSubcuenta', cabecera: 'Subcuenta' },
];

/** Filtro explícito: el metaFiltro por defecto usaría el `id` camelCase de la
 * columna como nombre de campo de API, y la API espera snake_case. */
export const metaFiltroCuentaEspecial: MetaFiltro = {
    id: {
        id: "id",
        campo: "id",
        label: "Código",
        filtro: (valor) => {
            if (!valor || valor === "") return null;
            return ["id", "~", valor as string];
        },
    },
    descripcion: {
        id: "descripcion",
        campo: "descripcion",
        label: "Descripción",
        filtro: (valor) => {
            if (!valor || valor === "") return null;
            return ["descripcion", "~", valor as string];
        },
    },
};

export const criteriaCuentasEspecialesDefecto = (): Criteria => ({
    ...criteriaDefecto,
    filtro: [],
    orden: ["id", "ASC"],
});
