import { PropsResultadoInforme } from "#/comun/informe_documentos/diseño.ts";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { descargarDocumento } from "@olula/lib/api/documentos.ts";
import { ContextoError } from "@olula/lib/contexto.ts";
import { useCallback, useContext, useState } from "react";
import { FormatoHoja, GrupoInformeTareas, ResultadoInformeTareas as Resultado } from "../diseño.ts";
import { fechaCorta, lineaResultado, nombreFicheroTareas, tiempo, tituloGrupo, unidadComun } from "../dominio.ts";
import { getHojaInformeTareas, getReportInformeTareas, getResultadoInformeTareas } from "../infraestructura.ts";
import "./ResultadoInformeTareas.css";

type Ocupado = "calcular" | "pdf" | FormatoHoja | null;

/**
 * Pestaña Resultado del informe de tareas: «Calcular» enseña las tareas con sus tiempos
 * previsto, real y diferencia (por centro de coste si la ficha lo pide) y los totales; los
 * botones descargan el PDF y la hoja (Excel u ODS) de los criterios guardados.
 */
export const ResultadoInformeTareas = ({ pestaña, ficha }: PropsResultadoInforme) => {
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
            setResultado(await intentar(() => getResultadoInformeTareas(ficha.id)));
        });

    const descargar = (extension: "pdf" | FormatoHoja) =>
        ejecutar(extension, async () => {
            const blob = await intentar(() =>
                extension === "pdf" ? getReportInformeTareas(ficha.id) : getHojaInformeTareas(ficha.id, extension)
            );
            await descargarDocumento(blob, nombreFicheroTareas(pestaña, ficha, extension));
        });

    const todas = resultado?.grupos.flatMap((g) => g.filas) ?? [];

    return (
        <div className="ResultadoInformeTareas">
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

            {!resultado && <p className="ayuda">Pulsa «Calcular» para ver las tareas con los criterios guardados.</p>}

            {resultado && (
                <>
                    <h3>{resultado.titulo}</h3>
                    <p className="criterios">{lineaResultado(resultado)}</p>
                    {resultado.totalTareas === 0 && <p>No hay tareas con estos criterios.</p>}
                    {resultado.grupos
                        .filter((g) => g.filas.length > 0)
                        .map((grupo) => (
                            <GrupoTareas key={grupo.centroId ?? "-"} grupo={grupo} agrupado={resultado.agrupado} />
                        ))}
                    {resultado.totalTareas > 0 && (
                        <dl className="total-informe">
                            <div><dt>Tareas</dt><dd>{resultado.totalTareas}</dd></div>
                            <div><dt>T. previsto</dt><dd>{tiempo(resultado.totalPrevisto)}</dd></div>
                            <div><dt>T. real</dt><dd>{tiempo(resultado.totalReal)}</dd></div>
                            <div>
                                <dt>Diferencia</dt>
                                <dd className={resultado.totalDiferencia < 0 ? "negativa" : undefined}>
                                    {tiempo(resultado.totalDiferencia)}
                                </dd>
                            </div>
                            {unidadComun(todas) && <div><dt>Unidad</dt><dd>{unidadComun(todas)}</dd></div>}
                        </dl>
                    )}
                </>
            )}
        </div>
    );
};

/**
 * Tabla de un grupo. Los tiempos van tras la tarea (lo que se mira primero en un panel
 * estrecho); el resto de columnas, después, con desplazamiento horizontal si no caben.
 */
const GrupoTareas = ({ grupo, agrupado }: { grupo: GrupoInformeTareas; agrupado: boolean }) => (
    <section className="grupo-tareas">
        {agrupado && <h4>{tituloGrupo(grupo)}</h4>}
        <table>
            <thead>
                <tr>
                    <th>Orden</th>
                    <th>Tarea</th>
                    <th>Descripción</th>
                    <th>Estado</th>
                    <th className="numero">T. prev.</th>
                    <th className="numero">T. real</th>
                    <th className="numero">Dif.</th>
                    <th>Unidad</th>
                    {!agrupado && <th>Centro</th>}
                    <th>Lote</th>
                    <th>Cliente</th>
                    <th>Pedido</th>
                    <th>Prevista</th>
                    <th>Inicio</th>
                    <th>Fin</th>
                </tr>
            </thead>
            <tbody>
                {grupo.filas.map((f) => (
                    <tr key={f.tareaId}>
                        <td className="codigo">{f.ordenId}</td>
                        <td className="codigo">{f.tareaId}</td>
                        <td>{f.descripcion}</td>
                        <td className="codigo">{f.estado}</td>
                        <td className="numero">{tiempo(f.tiempoPrevisto)}</td>
                        <td className="numero">{tiempo(f.tiempoReal)}</td>
                        <td className={`numero${f.diferencia < 0 ? " negativa" : ""}`}>{tiempo(f.diferencia)}</td>
                        <td>{f.unidad}</td>
                        {!agrupado && <td className="codigo">{f.centroId}</td>}
                        <td className="codigo">{f.loteId}</td>
                        <td className="cliente" title={f.cliente ? `${f.clienteId} · ${f.cliente}` : f.clienteId}>
                            {f.cliente || f.clienteId}
                        </td>
                        <td className="codigo">{f.pedidoId}</td>
                        <td className="codigo">{fechaCorta(f.fechaPrevista)}</td>
                        <td className="codigo">{fechaCorta(f.diaInicio)}</td>
                        <td className="codigo">{fechaCorta(f.diaFin)}</td>
                    </tr>
                ))}
            </tbody>
            {agrupado && (
                <tfoot>
                    <tr>
                        <td colSpan={4}>Total centro ({grupo.filas.length})</td>
                        <td className="numero">{tiempo(grupo.totalPrevisto)}</td>
                        <td className="numero">{tiempo(grupo.totalReal)}</td>
                        <td className={`numero${grupo.totalDiferencia < 0 ? " negativa" : ""}`}>{tiempo(grupo.totalDiferencia)}</td>
                        <td>{unidadComun(grupo.filas)}</td>
                        <td colSpan={6}></td>
                    </tr>
                </tfoot>
            )}
        </table>
    </section>
);
