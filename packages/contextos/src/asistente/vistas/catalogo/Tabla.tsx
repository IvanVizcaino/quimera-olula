import { z } from "zod";
import { CommonSchemas } from "@a2ui/web_core/v0_9";
import { createComponentImplementation } from "@a2ui/react/v0_9";
import { QTabla } from "@olula/componentes/atomos/qtabla.tsx";
import { Entidad } from "@olula/lib/diseño.ts";
import { ColumnaA2uiSchema, columnasAMetaTabla } from "#/asistente/vistas/catalogo/columnas.ts";
import { useAsistenteContext } from "#/asistente/vistas/AsistenteRuntimeProvider.tsx";

const EnlaceFilaSchema = z.object({
    ruta: z.string(),
    parametros: z.record(z.string(), z.string()).optional(),
});

export const TablaApi = {
    name: "Tabla",
    schema: z.object({
        columnas: z.array(ColumnaA2uiSchema),
        filas: CommonSchemas.DynamicValue,
        enlaceFila: EnlaceFilaSchema.optional(),
    }),
};

export const Tabla = createComponentImplementation(TablaApi, ({ props }) => {
    const { enviarAccion } = useAsistenteContext();
    const enlaceFila = props.enlaceFila;

    const onSeleccion = enlaceFila
        ? (entidad: Entidad) => {
              void enviarAccion({
                  name: "navegar",
                  surfaceId: "tabla",
                  sourceComponentId: "fila",
                  timestamp: new Date().toISOString(),
                  context: {
                      ruta: enlaceFila.ruta,
                      parametros: { ...enlaceFila.parametros, id: String(entidad.id) },
                  },
              });
          }
        : undefined;

    return (
        <QTabla<Entidad>
            metaTabla={columnasAMetaTabla(props.columnas)}
            datos={Array.isArray(props.filas) ? (props.filas as Entidad[]) : []}
            cargando={false}
            orden={[]}
            onSeleccion={onSeleccion}
        />
    );
});
