import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { useEffect, useState } from "react";
import { LineaPlanProduccion } from "../../diseño.ts";
import {
    cantidadTalla, columnasTalla, totalColumna, totalGeneral, totalLinea,
} from "../../dominio.ts";
import "./RejillaPlanProduccion.css";

/**
 * Orquestador de la rejilla: barra de acciones, alta de línea por referencia y
 * tabla editable. Edita la copia en memoria; "Guardar rejilla" envía todas las
 * líneas al servidor.
 */
export const RejillaPlanProduccion = ({
    rejilla,
    modificada,
    publicar,
}: {
    rejilla: LineaPlanProduccion[];
    modificada: boolean;
    publicar: EmitirEvento;
}) => {
    const [referencia, setReferencia] = useState("");

    // Avisa al cerrar o recargar la pestaña con cambios sin guardar
    useEffect(() => {
        if (!modificada) return;
        const avisar = (e: BeforeUnloadEvent) => e.preventDefault();
        window.addEventListener("beforeunload", avisar);
        return () => window.removeEventListener("beforeunload", avisar);
    }, [modificada]);

    const anadir = async () => {
        if (!referencia.trim()) return;
        await publicar("linea_anadida_solicitada", referencia);
        setReferencia("");
    };

    return (
        <div className="RejillaPlanProduccion">
            <div className="rejilla-barra">
                <div className="rejilla-grupo rejilla-nueva">
                    <QInput
                        label="Añadir referencia"
                        nombre="nueva_referencia"
                        valor={referencia}
                        onChange={setReferencia}
                        onEnterKeyUp={anadir}
                    />
                    <QBoton variante="borde" onClick={anadir} deshabilitado={!referencia.trim()}>
                        Añadir
                    </QBoton>
                    <QBoton variante="borde" onClick={() => publicar("pegar_excel_solicitado")}>
                        Pegar desde Excel
                    </QBoton>
                </div>
                <div className="rejilla-grupo rejilla-guardado">
                    {modificada && (
                        <span className="rejilla-aviso" role="status">
                            Cambios sin guardar
                        </span>
                    )}
                    <QBoton
                        variante="borde"
                        onClick={() => publicar("rejilla_descartada")}
                        deshabilitado={!modificada}
                    >
                        Descartar cambios
                    </QBoton>
                    <QBoton
                        onClick={() => publicar("rejilla_guardada_solicitada")}
                        deshabilitado={!modificada}
                    >
                        Guardar rejilla
                    </QBoton>
                </div>
            </div>

            <TablaRejilla rejilla={rejilla} publicar={publicar} />
        </div>
    );
};

const TablaRejilla = ({
    rejilla,
    publicar,
}: {
    rejilla: LineaPlanProduccion[];
    publicar: EmitirEvento;
}) => {
    const columnas = columnasTalla(rejilla);

    const cambiar = (indice: number, talla: string, texto: string) => {
        if (!/^\d*$/.test(texto)) return;
        publicar("cantidad_cambiada", { indice, talla, cantidad: texto === "" ? 0 : parseInt(texto, 10) });
    };

    return (
        <div className="rejilla-scroll">
            <table>
                <thead>
                    <tr>
                        <th className="rejilla-ref">Referencia</th>
                        <th className="rejilla-desc">Descripción</th>
                        {columnas.map((c) => (
                            <th key={c.talla} className="rejilla-talla" title={c.descripcion}>{c.talla}</th>
                        ))}
                        <th className="rejilla-total">Total</th>
                        <th className="rejilla-accion"><span className="rejilla-solo-lector">Acciones</span></th>
                    </tr>
                </thead>
                <tbody>
                    {rejilla.map((linea, indice) => (
                        <tr key={linea.id ?? `nueva-${linea.referencia}`}>
                            <td className="rejilla-ref">{linea.referencia}</td>
                            <td className="rejilla-desc" title={linea.descripcion}>{linea.descripcion}</td>
                            {columnas.map((c) => {
                                const cantidad = cantidadTalla(linea, c.talla);
                                return cantidad === undefined ? (
                                    <td
                                        key={c.talla}
                                        className="rejilla-sin-talla"
                                        title={`${linea.referencia} no tiene talla ${c.talla}`}
                                    />
                                ) : (
                                    <td key={c.talla} className="rejilla-numero">
                                        <input
                                            className="rejilla-celda"
                                            inputMode="numeric"
                                            placeholder="0"
                                            aria-label={`${linea.referencia} ${c.talla}`}
                                            value={cantidad === 0 ? "" : String(cantidad)}
                                            onChange={(e) => cambiar(indice, c.talla, e.target.value)}
                                        />
                                    </td>
                                );
                            })}
                            <td className="rejilla-total">{totalLinea(linea)}</td>
                            <td className="rejilla-accion">
                                <QBoton
                                    tamaño="pequeño"
                                    variante="texto"
                                    advertencia
                                    onClick={() => publicar("linea_quitada", indice)}
                                >
                                    Quitar
                                </QBoton>
                            </td>
                        </tr>
                    ))}
                </tbody>
                <tfoot>
                    <tr>
                        <td className="rejilla-ref" colSpan={2}>Total</td>
                        {columnas.map((c) => (
                            <td key={c.talla} className="rejilla-numero">{totalColumna(rejilla, c.talla)}</td>
                        ))}
                        <td className="rejilla-total">{totalGeneral(rejilla)}</td>
                        <td className="rejilla-accion"></td>
                    </tr>
                </tfoot>
            </table>
        </div>
    );
};
