import { z } from "zod";
import { CommonSchemas } from "@a2ui/web_core/v0_9";
import { createComponentImplementation } from "@a2ui/react/v0_9";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import "./TarjetaResultado.css";

export const TarjetaResultadoApi = {
    name: "TarjetaResultado",
    schema: z.object({
        titulo: CommonSchemas.DynamicString,
        detalles: z.array(z.object({ etiqueta: z.string(), valor: z.string() })).optional(),
        textoBoton: CommonSchemas.DynamicString.optional(),
        accion: CommonSchemas.Action,
    }),
};

export const TarjetaResultado = createComponentImplementation(TarjetaResultadoApi, ({ props }) => (
    <div className="asistente-resultado">
        <p className="asistente-resultado__titulo">{String(props.titulo)}</p>
        {props.detalles && props.detalles.length > 0 && (
            <dl className="asistente-resultado__detalles">
                {props.detalles.map((d, i) => (
                    <div className="asistente-resultado__fila" key={i}>
                        <dt>{d.etiqueta}</dt>
                        <dd>{d.valor}</dd>
                    </div>
                ))}
            </dl>
        )}
        <div className="asistente-resultado__acciones">
            <QBoton exito onClick={props.accion as () => void}>
                {String(props.textoBoton ?? "Ver detalle")}
            </QBoton>
        </div>
    </div>
));
