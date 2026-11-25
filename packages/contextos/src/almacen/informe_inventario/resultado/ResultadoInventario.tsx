import { PropsResultadoInforme } from "#/comun/informe_documentos/diseño.ts";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { descargarDocumento } from "@olula/lib/api/documentos.ts";
import { ContextoError } from "@olula/lib/contexto.ts";
import { useCallback, useContext, useState } from "react";
import { FormatoHoja, GrupoInventario, ResultadoInventario as Resultado } from "../diseño.ts";
import { cantidad, criteriosResultado, importe, nombreFicheroInventario } from "../dominio.ts";
import { getHojaInventario, getReportInventario, getResultadoInventario } from "../infraestructura.ts";
import "./ResultadoInventario.css";

type Ocupado = "calcular" | "pdf" | FormatoHoja | null;

/**
 * Pestaña Resultado de los informes de inventario: «Calcular» enseña el stock
 * agrupado por almacén (con precio, valor y totales en el valorado) y los
 * botones descargan el PDF y la hoja (Excel u ODS) de los criterios guardados.
 */
export const ResultadoInventario = ({ pestaña, ficha }: PropsResultadoInforme) => {
    const { intentar } = useContext(ContextoError);
    const [resultado, setResultado] = useState<Resultado | null>(null);
    const [ocupado, setOcupado] = useState<Ocupado>(null);

    const ejecutar = useCallback(
        async (accion: Exclude<Ocupado, null>, f: () => Promise<void>) => {
            if (ocupado) return;
            setOcupado(accion);
            try {
                await f();
            } catch {
                // intentar ya enseña el error.
            } finally {
                setOcupado(null);
            }
        },
        [ocupado]
    );

    const calcular = () =>
        ejecutar("calcular", async () => {
            setResultado(await intentar(() => getResultadoInventario(pestaña.url, ficha.id)));
        });

    const descargar = (extension: "pdf" | FormatoHoja) =>
        ejecutar(extension, async () => {
            const blob = await intentar(() =>
                extension === "pdf"
                    ? getReportInventario(pestaña.url, ficha.id)
                    : getHojaInventario(pestaña.url, ficha.id, extension)
            );
            await descargarDocumento(blob, nombreFicheroInventario(pestaña, ficha, extension));
        });

    return (
        <div className="ResultadoInventario">
            <div className="maestro-botones">
                <QBoton onClick={calcular} deshabilitado={!!ocupado}>
                    {ocupado === "calcular" ? "Calculando…" : "Calcular"}
                </QBoton>
                <QBoton variante="borde" onClick={() => descargar("pdf")} deshabilitado={!!ocupado}>
                    PDF
                </QBoton>
                <QBoton variante="borde" onClick={() => descargar("xlsx")} deshabilitado={!!ocupado}>
                    Excel
                </QBoton>
                <QBoton variante="borde" onClick={() => descargar("ods")} deshabilitado={!!ocupado}>
                    ODS
                </QBoton>
            </div>

            {!resultado && <p className="ayuda">Pulsa «Calcular» para ver el inventario con los criterios guardados.</p>}

            {resultado && (
                <>
                    <h3>{resultado.titulo}</h3>
                    <p className="criterios">{criteriosResultado(resultado)}</p>
                    {resultado.grupos.length === 0 && <p>No hay stock con estos criterios.</p>}
                    {resultado.grupos.map((grupo) => (
                        <GrupoAlmacen key={grupo.almacenId} grupo={grupo} valorado={resultado.valorado} />
                    ))}
                    {resultado.valorado && resultado.grupos.length > 0 && (
                        <p className="total-inventario">
                            Total inventario <span>{importe(resultado.total)}</span>
                        </p>
                    )}
                </>
            )}
        </div>
    );
};

const GrupoAlmacen = ({ grupo, valorado }: { grupo: GrupoInventario; valorado: boolean }) => {
    const direccion = [grupo.direccion, grupo.poblacion].filter(Boolean).join(" · ");
    return (
        <section className="grupo-almacen">
            <h4>
                {grupo.almacenId} · {grupo.almacen ?? ""}
                {direccion && <small>{direccion}</small>}
            </h4>
            <table>
                <thead>
                    <tr>
                        <th>Referencia</th>
                        <th>Descripción</th>
                        <th className="numero">Cantidad</th>
                        {valorado && <th className="numero">Precio</th>}
                        {valorado && <th className="numero">Valor</th>}
                    </tr>
                </thead>
                <tbody>
                    {grupo.filas.map((fila) => (
                        <tr key={fila.referencia}>
                            <td>{fila.referencia}</td>
                            <td>{fila.descripcion ?? ""}</td>
                            <td className="numero">{cantidad(fila.cantidad)}</td>
                            {valorado && <td className="numero">{importe(fila.precio)}</td>}
                            {valorado && <td className="numero">{importe(fila.valor)}</td>}
                        </tr>
                    ))}
                </tbody>
                {valorado && (
                    <tfoot>
                        <tr>
                            <td colSpan={4}>Total almacén</td>
                            <td className="numero">{importe(grupo.total)}</td>
                        </tr>
                    </tfoot>
                )}
            </table>
        </section>
    );
};
