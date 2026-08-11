import { z } from "zod";
import { CommonSchemas } from "@a2ui/web_core/v0_9";
import { createComponentImplementation } from "@a2ui/react/v0_9";
import { QTarjetaMetatabla } from "@olula/componentes/moleculas/qtarjeta_metatabla.tsx";
import { Entidad } from "@olula/lib/diseño.ts";
import { ColumnaA2uiSchema, columnasAMetaTabla } from "#/asistente/vistas/catalogo/columnas.ts";

export const TarjetaDatosApi = {
    name: "TarjetaDatos",
    schema: z.object({
        columnas: z.array(ColumnaA2uiSchema),
        datos: CommonSchemas.DynamicValue,
    }),
};

export const TarjetaDatos = createComponentImplementation(TarjetaDatosApi, ({ props }) => {
    const datos = props.datos as unknown as Entidad | undefined;
    if (!datos || typeof datos !== "object") return null;

    return <QTarjetaMetatabla<Entidad> entidad={datos} metaTabla={columnasAMetaTabla(props.columnas)} />;
});
