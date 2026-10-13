import { conColumnaImpreso } from "#/comun/marca_impresion.ts";
import { MetaTabla } from "@olula/componentes/atomos/qtabla.tsx";
import { ContextoMaestroPresupuesto, EstadoMaestroPresupuesto, Presupuesto } from "../diseño.ts";

export type { ContextoMaestroPresupuesto, EstadoMaestroPresupuesto, Presupuesto };

// La columna de estado la añade delante MaestroConDetallePresupuesto.
export const metaTablaPresupuesto: MetaTabla<Presupuesto> = conColumnaImpreso([
    {
        id: "codigo",
        cabecera: "Código",
        prioridad: "alta",
    },
    {
        id: "nombre_cliente",
        cabecera: "Cliente",
        prioridad: "alta",
        render: (p) => p.cliente.nombre_cliente,
    },
    {
        id: "fecha",
        cabecera: "Fecha",
        tipo: "fecha",
        prioridad: "alta",
    },
    {
        id: "total",
        cabecera: "Total",
        tipo: "moneda",
        prioridad: "alta",
        divisa: (presupuesto) => presupuesto.divisa_id,
    },
    {
        id: "nombre_agente",
        cabecera: "Agente",
        prioridad: "baja",
    },
    {
        id: "almacen_id",
        cabecera: "Almacén",
        prioridad: "baja",
    },
]);
