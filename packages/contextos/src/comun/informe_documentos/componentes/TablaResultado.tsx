import { Fragment } from "react";
import { ColumnaResultado, ResultadoInforme, ValorCelda } from "../diseño.ts";
import { esNumerica, textoCelda } from "../dominio.ts";

const Celdas = ({
    celdas,
    columnas,
}: {
    celdas: ValorCelda[];
    columnas: ColumnaResultado[];
}) => (
    <>
        {columnas.map((columna, i) => (
            <td key={columna.id} className={esNumerica(columna.tipo) ? "importe" : undefined}>
                {textoCelda(celdas[i], columna.tipo)}
            </td>
        ))}
    </>
);

/** El resultado tal como lo manda el servidor: una fila por documento, sus
 * líneas debajo (si las hay) y las filas de total. Es lo mismo que el PDF del
 * resumen. */
export const TablaResultado = ({ resultado }: { resultado: ResultadoInforme }) => {
    const { columnas, columnasLineas } = resultado;
    return (
        <table className="tabla-informe-documentos">
            <thead>
                <tr>
                    {columnas.map((columna) => (
                        <th key={columna.id} className={esNumerica(columna.tipo) ? "importe" : undefined}>
                            {columna.cabecera}
                        </th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {resultado.filas.map((fila, indice) => (
                    <Fragment key={indice}>
                        <tr className={`fila-${fila.tipo}`}>
                            <Celdas celdas={fila.celdas} columnas={columnas} />
                        </tr>
                        {fila.lineas.length > 0 && columnasLineas.length > 0 && (
                            <tr className="fila-lineas">
                                <td colSpan={columnas.length}>
                                    <table className="tabla-lineas-informe">
                                        <thead>
                                            <tr>
                                                {columnasLineas.map((columna) => (
                                                    <th
                                                        key={columna.id}
                                                        className={esNumerica(columna.tipo) ? "importe" : undefined}
                                                    >
                                                        {columna.cabecera}
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {fila.lineas.map((linea, i) => (
                                                <tr key={i}>
                                                    <Celdas celdas={linea} columnas={columnasLineas} />
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </td>
                            </tr>
                        )}
                    </Fragment>
                ))}
            </tbody>
        </table>
    );
};
