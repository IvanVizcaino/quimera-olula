import { QAviso } from "@olula/componentes/atomos/qaviso.tsx";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QModal } from "@olula/componentes/index.js";
import { useState } from "react";
import { comandoClaudeMcp } from "../dominio.ts";
import { urlMcpServidor } from "../infraestructura.ts";
import "./ClaveCreada.css";

/** Copia al portapapeles y recuerda qué se copió por última vez, para el texto del botón. */
const useCopiar = () => {
    const [copiado, setCopiado] = useState<string | null>(null);
    const copiar = async (que: string, texto: string) => {
        try {
            await navigator.clipboard.writeText(texto);
            setCopiado(que);
        } catch {
            setCopiado(null);
        }
    };
    return { copiado, copiar };
};

/**
 * Enseña una sola vez la clave recién creada, con la orden para usarla desde
 * Claude Code plegada debajo. Al cerrar, la clave se olvida.
 */
export const ClaveCreada = ({ clave, onCerrar }: { clave: string; onCerrar: () => void }) => {
    const { copiado, copiar } = useCopiar();
    const comando = comandoClaudeMcp(urlMcpServidor(), clave);

    return (
        <QModal abierto={true} nombre="claveCreada" titulo="Clave de API creada" onCerrar={onCerrar}>
            <div className="ClaveCreada">
                <QAviso variante="advertencia">
                    Copia la clave ahora: no se vuelve a mostrar. Quien la tenga entra en Olula
                    con tus permisos hasta que caduque o la revoques.
                </QAviso>
                <pre className="valor">{clave}</pre>
                <div className="botones">
                    <QBoton onClick={() => copiar("clave", clave)}>
                        {copiado === "clave" ? "Clave copiada" : "Copiar clave"}
                    </QBoton>
                </div>

                <details className="usar-con-agente">
                    <summary>Usar esta clave con un agente</summary>
                    <p>
                        Para que Claude Code trabaje en Olula en tu nombre, ejecuta esta orden en
                        tu terminal. Da de alta Olula como servidor MCP llamado «olula».
                    </p>
                    <pre className="valor">{comando}</pre>
                    <div className="botones">
                        <QBoton variante="borde" onClick={() => copiar("comando", comando)}>
                            {copiado === "comando" ? "Orden copiada" : "Copiar orden"}
                        </QBoton>
                    </div>
                    <p className="nota">
                        Otros clientes MCP se conectan a <code>{urlMcpServidor()}</code> por HTTP
                        con la cabecera <code>Authorization: X-Api-Key &lt;clave&gt;</code>.
                    </p>
                </details>

                <div className="botones maestro-botones">
                    <QBoton variante="borde" onClick={onCerrar}>
                        Cerrar
                    </QBoton>
                </div>
            </div>
        </QModal>
    );
};
