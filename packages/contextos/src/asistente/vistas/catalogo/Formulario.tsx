import { useState } from "react";
import { z } from "zod";
import { CommonSchemas } from "@a2ui/web_core/v0_9";
import { createComponentImplementation } from "@a2ui/react/v0_9";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QCheckbox } from "@olula/componentes/atomos/qcheckbox.tsx";
import { QDate } from "@olula/componentes/atomos/qdate.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QSelect } from "@olula/componentes/atomos/qselect.tsx";
import { useAsistenteContext } from "#/asistente/vistas/AsistenteRuntimeProvider.tsx";
import "./Formulario.css";

const OpcionCampoSchema = z.object({ valor: z.string(), descripcion: z.string() });

const CampoFormularioSchema = z.object({
    nombre: z.string(),
    etiqueta: z.string(),
    tipo: z.enum(["texto", "numero", "fecha", "booleano", "seleccion"]),
    opciones: z.array(OpcionCampoSchema).optional(),
    obligatorio: z.boolean().optional(),
});

export type CampoFormulario = z.infer<typeof CampoFormularioSchema>;

export const FormularioApi = {
    name: "Formulario",
    schema: z.object({
        titulo: CommonSchemas.DynamicString.optional(),
        campos: z.array(CampoFormularioSchema),
        textoBoton: CommonSchemas.DynamicString.optional(),
    }),
};

// Prefijo que el LLM reconoce en el system prompt para distinguir la respuesta
// del formulario de un mensaje de texto libre normal (ver pedir_datos en
// consultas/comun/ia/aplicacion.py, backend).
const PREFIJO_RESPUESTA_FORMULARIO = "DATOS_FORMULARIO";

const valorInicial = (campo: CampoFormulario) => (campo.tipo === "booleano" ? "false" : "");

export const Formulario = createComponentImplementation(FormularioApi, ({ props }) => {
    const { enviarAccion } = useAsistenteContext();
    const [valores, setValores] = useState<Record<string, string>>(() =>
        Object.fromEntries(props.campos.map(campo => [campo.nombre, valorInicial(campo)]))
    );
    const [enviando, setEnviando] = useState(false);
    const [enviado, setEnviado] = useState(false);

    const actualizar = (nombre: string, valor: string) => setValores(prev => ({ ...prev, [nombre]: valor }));

    const faltanObligatorios = props.campos.some(campo => campo.obligatorio && !valores[campo.nombre]);

    const enviar = async () => {
        // QBoton.deshabilitado solo aplica estilo, no bloquea el onClick — hay que
        // frenar aquí para que no se pueda enviar dos veces ni con campos incompletos.
        if (enviando || enviado || faltanObligatorios) return;
        setEnviando(true);
        setEnviado(true);
        try {
            await enviarAccion({
                name: "select",
                surfaceId: "formulario",
                sourceComponentId: "formulario",
                timestamp: new Date().toISOString(),
                context: { value: `${PREFIJO_RESPUESTA_FORMULARIO}: ${JSON.stringify(valores)}` },
            });
        } finally {
            setEnviando(false);
        }
    };

    return (
        <div className="asistente-formulario">
            {props.titulo && <p className="asistente-formulario__titulo">{String(props.titulo)}</p>}
            {props.campos.map(campo => (
                <CampoInput
                    key={campo.nombre}
                    campo={campo}
                    valor={valores[campo.nombre]}
                    deshabilitado={enviado}
                    onChange={valor => actualizar(campo.nombre, valor)}
                />
            ))}
            <QBoton onClick={enviar} deshabilitado={enviando || enviado || faltanObligatorios}>
                {String(props.textoBoton ?? "Enviar")}
            </QBoton>
        </div>
    );
});

interface CampoInputProps {
    campo: CampoFormulario;
    valor: string;
    deshabilitado: boolean;
    onChange: (valor: string) => void;
}

function CampoInput({ campo, valor, deshabilitado, onChange }: CampoInputProps) {
    const opcional = !campo.obligatorio;

    switch (campo.tipo) {
        case "booleano":
            return (
                <QCheckbox
                    label={campo.etiqueta}
                    nombre={campo.nombre}
                    valor={valor}
                    opcional={opcional}
                    deshabilitado={deshabilitado}
                    onChange={onChange}
                />
            );
        case "fecha":
            return (
                <QDate
                    label={campo.etiqueta}
                    nombre={campo.nombre}
                    valor={valor}
                    opcional={opcional}
                    deshabilitado={deshabilitado}
                    onChange={onChange}
                />
            );
        case "seleccion":
            return (
                <QSelect
                    label={campo.etiqueta}
                    nombre={campo.nombre}
                    valor={valor}
                    opcional={opcional}
                    deshabilitado={deshabilitado}
                    opciones={campo.opciones ?? []}
                    onChange={opcion => onChange(opcion?.valor ?? "")}
                />
            );
        case "numero":
            return (
                <QInput
                    label={campo.etiqueta}
                    nombre={campo.nombre}
                    tipo="numero"
                    valor={valor}
                    opcional={opcional}
                    deshabilitado={deshabilitado}
                    onChange={onChange}
                />
            );
        default:
            return (
                <QInput
                    label={campo.etiqueta}
                    nombre={campo.nombre}
                    tipo="texto"
                    valor={valor}
                    opcional={opcional}
                    deshabilitado={deshabilitado}
                    onChange={onChange}
                />
            );
    }
}
