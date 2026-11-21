import { MetaCampoFiltro } from "@olula/componentes/maestro/maestroFiltros/MaestroFiltrosActivoControlado.js";
import { almacenDeTrabajo } from "../preferencias.ts";
import { Almacen } from "./Almacen.tsx";

/**
 * Filtro «Almacén» de los listados del SGA. Elegir uno lo recuerda como almacén de trabajo; con
 * `conAlmacenDeTrabajo` (preferencias.ts) el listado entra ya filtrado por él.
 */
export const filtroAlmacen = (campo = "almacen_id"): MetaCampoFiltro => ({
    id: "almacen",
    campo,
    label: "Almacén",
    filtro: (v) => (v ? [campo, "=", v as string] : null),
    render: (valor, onChange) => (
        <Almacen
            nombre={campo}
            valor={(valor as string) ?? ""}
            enlace=""
            onChange={(opcion) => {
                if (opcion?.valor) almacenDeTrabajo.fijar(opcion.valor, opcion.descripcion);
                onChange(opcion?.valor ?? "");
            }}
        />
    ),
});
