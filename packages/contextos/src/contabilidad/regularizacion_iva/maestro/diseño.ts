import { MetaTabla } from "@olula/componentes/index.js";
import { MetaFiltro } from "@olula/componentes/maestro/maestroFiltros/MaestroFiltrosActivoControlado.tsx";
import { Criteria } from "@olula/lib/diseño.ts";
import { criteriaDefecto } from "@olula/lib/dominio.js";
import { ListaActivaEntidades } from "@olula/lib/ListaActivaEntidades.js";
import { RegularizacionIva } from "../diseño.ts";

export type EstadoMaestroRegularizacionIva = "INICIAL" | "CREANDO";

export type ContextoMaestroRegularizacionIva = {
    estado: EstadoMaestroRegularizacionIva;
    regularizaciones: ListaActivaEntidades<RegularizacionIva>;
};

export const metaTablaRegularizacionIva: MetaTabla<RegularizacionIva> = [
    { id: "ejercicioId", cabecera: "Ejercicio" },
    { id: "periodo", cabecera: "Periodo" },
    { id: "fechaInicio", cabecera: "Desde", tipo: "fecha" },
    { id: "fechaFin", cabecera: "Hasta", tipo: "fecha" },
    { id: "numeroAsiento", cabecera: "Asiento" },
    { id: "importe", cabecera: "Importe", tipo: "numero" },
];

export const metaFiltroRegularizacionIva: MetaFiltro = {
    ejercicio_id: {
        id: "ejercicio_id",
        campo: "ejercicio_id",
        label: "Ejercicio",
        filtro: (valor) => {
            if (!valor || valor === "") return null;
            return ["ejercicio_id", "eq", valor as string];
        },
    },
};

export const criteriaRegularizacionesIvaDefecto = (): Criteria => ({
    ...criteriaDefecto,
    filtro: [],
    orden: ["fecha_inicio", "DESC"],
});
