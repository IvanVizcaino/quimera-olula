import { ejercicioActual } from "#/contabilidad/asiento/dominio.ts";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QDate } from "@olula/componentes/atomos/qdate.tsx";
import { QModal } from "@olula/componentes/index.js";
import { ContextoError } from "@olula/lib/contexto.ts";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { useCallback, useContext, useState } from "react";
import { ResultadoGeneracion } from "../diseño.ts";
import { esFinDeMes, finDeMes, resumenGeneracion } from "../dominio.ts";
import { fechaAApi, postGenerarDotaciones } from "../infraestructura.ts";

/** `pbnGenerar_clicked`: fecha límite (fin de mes) y resumen de lo generado.
 * Los asientos van al ejercicio actual. */
export const GenerarDotaciones = ({ publicar }: { publicar: EmitirEvento }) => {
    const { intentar } = useContext(ContextoError);
    const [fecha, setFecha] = useState<Date>(finDeMes());
    const [resultado, setResultado] = useState<ResultadoGeneracion | null>(null);
    const [ocupado, setOcupado] = useState(false);

    const generar = useCallback(async () => {
        if (ocupado) return;
        setOcupado(true);
        try {
            setResultado(await intentar(() => postGenerarDotaciones(ejercicioActual(), fecha)));
        } finally {
            setOcupado(false);
        }
    }, [fecha, intentar, ocupado]);

    const cerrar = useCallback(
        () => publicar(resultado ? "dotaciones_generadas" : "generacion_cancelada"),
        [publicar, resultado]
    );

    const valida = esFinDeMes(fecha);

    return (
        <QModal abierto={true} nombre="generarDotaciones" titulo="Generar dotaciones"
            onCerrar={cerrar}>
            <div className="GenerarDotaciones">
                {!resultado && (
                    <>
                        <p>Ejercicio de los asientos: {ejercicioActual()}</p>
                        <quimera-formulario>
                            <QDate
                                label="Fecha límite"
                                nombre="fecha_limite"
                                valor={fechaAApi(fecha)}
                                onChange={(valor) => valor && setFecha(new Date(`${valor}T12:00:00`))}
                                textoValidacion={valida ? "" : "La fecha indicada debe ser fin de mes"}
                                erroneo={!valida}
                            />
                        </quimera-formulario>
                        <div className="botones maestro-botones">
                            <QBoton onClick={generar} deshabilitado={!valida || ocupado}>
                                {ocupado ? "Generando…" : "Generar"}
                            </QBoton>
                        </div>
                    </>
                )}
                {resultado && (
                    <>
                        <h4>Dotaciones creadas</h4>
                        <pre className="resumen-dotaciones">{resumenGeneracion(resultado)}</pre>
                        <div className="botones maestro-botones">
                            <QBoton onClick={cerrar}>Aceptar</QBoton>
                        </div>
                    </>
                )}
            </div>
        </QModal>
    );
};
