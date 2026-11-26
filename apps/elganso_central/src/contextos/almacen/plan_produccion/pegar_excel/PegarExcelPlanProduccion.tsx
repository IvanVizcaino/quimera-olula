import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QTextArea } from "@olula/componentes/atomos/qtextarea.tsx";
import { QModal } from "@olula/componentes/index.js";
import { ContextoError } from "@olula/lib/contexto.ts";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { useCallback, useContext, useState } from "react";
import { FilaResuelta, filasValidas, parsearPegado, resolverPegado } from "../dominio.ts";
import { getTallasArticulo } from "../infraestructura.ts";
import "./PegarExcelPlanProduccion.css";

type Analisis = { error?: string; filas: FilaResuelta[] };

/**
 * Modal de pegado desde Excel. Emite "pegado_importado" con las filas válidas
 * (la máquina las fusiona en la rejilla en memoria) o "pegado_cancelado".
 */
export const PegarExcelPlanProduccion = ({ publicar }: { publicar: EmitirEvento }) => {
    const [texto, setTexto] = useState("");
    const [analisis, setAnalisis] = useState<Analisis | null>(null);
    const { intentar } = useContext(ContextoError);

    const analizar = useCallback(async () => {
        const parseo = parsearPegado(texto);
        if (parseo.error) {
            setAnalisis({ error: parseo.error, filas: [] });
            return;
        }
        const referencias = [...new Set(parseo.filas.map((f) => f.referencia))];
        const articulos = await intentar(() => getTallasArticulo(referencias));
        setAnalisis({ filas: resolverPegado(parseo.filas, articulos) });
    }, [texto, intentar]);

    const cambiarTexto = (valor: string) => {
        setTexto(valor);
        setAnalisis(null);
    };

    const validas = analisis ? filasValidas(analisis.filas) : [];
    const erroneas = analisis ? analisis.filas.length - validas.length : 0;

    return (
        <QModal
            abierto={true}
            nombre="pegarExcelPlanProduccion"
            titulo="Pegar desde Excel"
            onCerrar={() => publicar("pegado_cancelado")}
        >
            <div className="PegarExcelPlanProduccion">
                <p>
                    Copia en Excel desde la celda «Referencia» hasta la última talla, incluyendo la
                    fila de cabecera, y pégala aquí (Ctrl+V).
                </p>
                <QTextArea
                    label="Datos copiados de Excel"
                    nombre="pegado_excel"
                    valor={texto}
                    onChange={cambiarTexto}
                    rows={6}
                />
                <div className="botones maestro-botones">
                    <QBoton variante="borde" onClick={analizar} deshabilitado={texto.trim() === ""}>
                        Analizar
                    </QBoton>
                </div>

                {analisis?.error && <div className="pegado-error-global">{analisis.error}</div>}

                {analisis && !analisis.error && (
                    <>
                        <div className="pegado-contadores" role="status">
                            <span className="pegado-contador">{analisis.filas.length} filas</span>
                            <span className="pegado-contador pegado-ok">{validas.length} válidas</span>
                            <span className={`pegado-contador${erroneas > 0 ? " pegado-ko" : ""}`}>
                                {erroneas} con errores
                            </span>
                        </div>
                        <div className="pegado-scroll">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Fila</th>
                                        <th>Referencia</th>
                                        <th>Descripción</th>
                                        <th className="pegado-num">Unidades</th>
                                        <th>Resultado</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {analisis.filas.map((f) => (
                                        <tr key={f.fila} className={f.error ? "pegado-erronea" : undefined}>
                                            <td>{f.fila}</td>
                                            <td>{f.referencia}</td>
                                            <td>{f.descripcion || f.articulo?.descripcion}</td>
                                            <td className="pegado-num">
                                                {f.unidades}
                                            </td>
                                            <td className="pegado-motivo">{f.error ? `Error: ${f.error}` : "OK"}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}

                <div className="botones maestro-botones">
                    <QBoton
                        onClick={() => publicar("pegado_importado", validas)}
                        deshabilitado={validas.length === 0}
                    >
                        {`Importar ${validas.length} filas válidas`}
                    </QBoton>
                </div>
            </div>
        </QModal>
    );
};
