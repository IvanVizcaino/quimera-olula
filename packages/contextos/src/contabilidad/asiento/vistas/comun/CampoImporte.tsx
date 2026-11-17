import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { useState } from "react";
import { textoAImporte } from "../../divisa_partida.ts";

/**
 * Importe de una partida. Mientras se escribe se respeta el texto tal cual
 * («84,», «100.2»…) y sólo se avisa con el número cuando el texto es válido:
 * el campo numérico del navegador descartaba la coma y, al reescribir el valor
 * en cada pulsación, el separador decimal se perdía. Acepta coma o punto.
 */
export const CampoImporte = ({
    nombre,
    label = "",
    valor,
    onChange,
    deshabilitado,
}: {
    nombre: string;
    label?: string;
    valor: number;
    onChange: (valor: number) => void;
    deshabilitado?: boolean;
}) => {
    const [texto, setTexto] = useState<string | null>(null);

    return (
        <QInput
            label={label}
            nombre={nombre}
            valor={texto ?? String(valor ?? 0).replace(".", ",")}
            deshabilitado={deshabilitado}
            // Al entrar se selecciona: lo que se escribe sustituye al 0.
            autoSeleccion
            onChange={(v) => {
                setTexto(v);
                const importe = textoAImporte(v);
                if (importe !== null) onChange(importe);
            }}
            onBlur={() => {
                if (texto !== null && textoAImporte(texto) === null) onChange(0);
                setTexto(null);
            }}
        />
    );
};
