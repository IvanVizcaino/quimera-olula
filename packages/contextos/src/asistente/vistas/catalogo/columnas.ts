import { z } from "zod";
import { MetaTabla } from "@olula/componentes/atomos/qtabla.tsx";
import { Entidad } from "@olula/lib/diseño.ts";

export const ColumnaA2uiSchema = z.object({
    id: z.string(),
    cabecera: z.string(),
    tipo: z.enum(["texto", "numero", "moneda", "fecha", "hora", "fechahora", "booleano"]).optional(),
    prioridad: z.enum(["alta", "media", "baja"]).optional(),
    divisa: z.string().optional(),
});

export type ColumnaA2ui = z.infer<typeof ColumnaA2uiSchema>;

export const columnasAMetaTabla = (columnas: ColumnaA2ui[]): MetaTabla<Entidad> =>
    columnas.map(columna => ({ ...columna }));
