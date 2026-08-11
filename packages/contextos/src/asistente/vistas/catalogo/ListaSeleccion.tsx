import { useState } from "react";
import { z } from "zod";
import { CommonSchemas } from "@a2ui/web_core/v0_9";
import { createComponentImplementation } from "@a2ui/react/v0_9";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QRadio } from "@olula/componentes/atomos/qradio.tsx";
import { QMultiCheckbox } from "@olula/componentes/atomos/qmulticheckbox.tsx";
import { useAsistenteContext } from "#/asistente/vistas/AsistenteRuntimeProvider.tsx";
import "./ListaSeleccion.css";

const OpcionSchema = z.object({ id: z.string(), etiqueta: z.string(), valor: z.string() });

export const ListaSeleccionApi = {
    name: "ListaSeleccion",
    schema: z.object({
        titulo: CommonSchemas.DynamicString,
        opciones: z.array(OpcionSchema),
        // Varias tools (resolver_cliente/resolver_articulo con AMBIGUO) piden elegir
        // exactamente UNA opción; otras podrían necesitar varias — ver el componente
        // como checklist genérico, no acoplado a un caso concreto.
        multiple: z.boolean().optional(),
        textoBoton: CommonSchemas.DynamicString.optional(),
    }),
};

export const ListaSeleccion = createComponentImplementation(ListaSeleccionApi, ({ props }) => {
    const { enviarAccion } = useAsistenteContext();
    const [seleccionados, setSeleccionados] = useState<string[]>([]);
    const opciones = props.opciones.map(o => ({ valor: o.id, descripcion: o.etiqueta }));

    const enviar = () => {
        const valores = props.opciones
            .filter(o => seleccionados.includes(o.id))
            .map(o => o.valor);
        if (!valores.length) return;
        void enviarAccion({
            name: "select",
            surfaceId: "",
            sourceComponentId: "",
            timestamp: new Date().toISOString(),
            context: { value: valores.join("; ") },
        });
    };

    return (
        <div className="asistente-lista-seleccion">
            <p className="asistente-lista-seleccion__titulo">{String(props.titulo)}</p>
            {props.multiple ? (
                <QMultiCheckbox
                    label="" nombre="opciones"
                    opciones={opciones}
                    valor={seleccionados as unknown as string}
                    onChange={v => setSeleccionados(v as unknown as string[])}
                />
            ) : (
                <QRadio
                    label="" nombre="opcion"
                    opciones={opciones}
                    valor={seleccionados[0] ?? ""}
                    onChange={opcion => setSeleccionados(opcion ? [opcion.valor] : [])}
                />
            )}
            <div className="asistente-lista-seleccion__acciones">
                <QBoton deshabilitado={!seleccionados.length} onClick={enviar}>
                    {String(props.textoBoton ?? "Enviar")}
                </QBoton>
            </div>
        </div>
    );
});
