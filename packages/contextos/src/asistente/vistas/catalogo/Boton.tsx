import { z } from "zod";
import { CommonSchemas } from "@a2ui/web_core/v0_9";
import { createComponentImplementation } from "@a2ui/react/v0_9";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";

export const BotonApi = {
    name: "Boton",
    schema: z.object({
        texto: CommonSchemas.DynamicString,
        variante: z.enum(["solido", "borde", "texto"]).optional(),
        tamaño: z.enum(["pequeño", "mediano", "grande", "xl"]).optional(),
        destructivo: z.boolean().optional(),
        advertencia: z.boolean().optional(),
        exito: z.boolean().optional(),
        action: CommonSchemas.Action,
    }),
};

export const Boton = createComponentImplementation(BotonApi, ({ props }) => (
    <QBoton
        variante={props.variante}
        tamaño={props.tamaño}
        destructivo={props.destructivo}
        advertencia={props.advertencia}
        exito={props.exito}
        onClick={props.action as () => void}
    >
        {String(props.texto)}
    </QBoton>
));
