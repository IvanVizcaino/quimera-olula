import { QEscanerCodigoBarras } from "@olula/componentes/moleculas/qescaner_codigo_barras.tsx";
import { KeyboardEvent, RefObject, useState } from "react";
import { ResultadoAtajo } from "../dominio.ts";

/**
 * Campo de lectura del Terminal: un lector de código de barras HID escribe el código y pulsa
 * Enter, igual que el teclado. Los atajos (`/`, `*`, `.`) los decide `atajo`. Opcionalmente,
 * la cámara (`QEscanerCodigoBarras`) lee el código y lo da por leído.
 */
export const LectorCodigo = ({
    nombre,
    etiqueta,
    valor,
    marcador,
    inputRef,
    deshabilitado,
    onChange,
    onLeer,
    atajo,
    onLimpiar,
}: {
    nombre: string;
    etiqueta: string;
    valor: string;
    marcador?: string;
    inputRef?: RefObject<HTMLInputElement | null>;
    deshabilitado?: boolean;
    onChange: (valor: string) => void;
    onLeer: (codigo: string) => void;
    atajo?: (valor: string, tecla: string) => ResultadoAtajo;
    onLimpiar?: () => void;
}) => {
    const [camara, setCamara] = useState(false);

    const teclear = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            e.preventDefault();
            onLeer(valor);
            return;
        }
        const resultado = atajo?.(valor, e.key);
        if (!resultado || resultado.tipo === "ninguno") return;
        e.preventDefault();
        if (resultado.tipo === "limpiar") onLimpiar?.();
        else onChange(resultado.valor);
    };

    return (
        <div className="LectorCodigo">
            <label htmlFor={`lector-${nombre}`}>{etiqueta}</label>
            <div className="fila-lector">
                <input
                    id={`lector-${nombre}`}
                    name={nombre}
                    ref={inputRef}
                    className="campo-lector"
                    autoComplete="off"
                    autoCapitalize="characters"
                    spellCheck={false}
                    placeholder={marcador}
                    value={valor}
                    disabled={deshabilitado}
                    onChange={(e) => onChange(e.target.value)}
                    onKeyDown={teclear}
                />
                <button
                    type="button"
                    className="boton-terminal secundario"
                    aria-pressed={camara}
                    aria-label={`Leer ${etiqueta.toLowerCase()} con la cámara`}
                    onClick={() => setCamara((c) => !c)}
                >
                    {camara ? "Cerrar cámara" : "Cámara"}
                </button>
            </div>
            {camara && (
                <QEscanerCodigoBarras
                    onDetectar={(codigo) => {
                        setCamara(false);
                        onLeer(codigo);
                    }}
                    onError={() => setCamara(false)}
                />
            )}
        </div>
    );
};
