import { z } from "zod";
import { CommonSchemas } from "@a2ui/web_core/v0_9";
import { createComponentImplementation } from "@a2ui/react/v0_9";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import "./TarjetaConfirmacion.css";

export const TarjetaConfirmacionApi = {
    name: "TarjetaConfirmacion",
    schema: z.object({
        titulo: CommonSchemas.DynamicString,
        detalles: z.array(z.object({ etiqueta: z.string(), valor: z.string() })).optional(),
        textoConfirmar: CommonSchemas.DynamicString.optional(),
        textoCancelar: CommonSchemas.DynamicString.optional(),
        accionConfirmar: CommonSchemas.Action,
        accionCancelar: CommonSchemas.Action,
    }),
};

export const TarjetaConfirmacion = createComponentImplementation(TarjetaConfirmacionApi, ({ props }) => (
    <div className="asistente-confirmacion">
        <p className="asistente-confirmacion__titulo">{String(props.titulo)}</p>
        {props.detalles && props.detalles.length > 0 && (
            <dl className="asistente-confirmacion__detalles">
                {props.detalles.map((d, i) => (
                    <div className="asistente-confirmacion__fila" key={i}>
                        <dt>{d.etiqueta}</dt>
                        <dd>{d.valor}</dd>
                    </div>
                ))}
            </dl>
        )}
        <div className="asistente-confirmacion__acciones">
            <QBoton variante="texto" onClick={props.accionCancelar as () => void}>
                {String(props.textoCancelar ?? "Cancelar")}
            </QBoton>
            <QBoton onClick={props.accionConfirmar as () => void}>
                {String(props.textoConfirmar ?? "Confirmar")}
            </QBoton>
        </div>
    </div>
));
