import { QAviso } from "@olula/componentes/atomos/qaviso.tsx";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QModal } from "@olula/componentes/moleculas/qmodal.tsx";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { ResumenSincronizacionMovimientoBancario as ResumenSincronizacion } from "../diseño.js";
import "./ResumenSincronizacionMovimientoBancario.css";

export const ResumenSincronizacionMovimientoBancario = ({
    resumen,
    publicar,
}: {
    resumen: ResumenSincronizacion;
    publicar: EmitirEvento;
}) => {
    const cerrar = () => publicar("resumen_sincronizacion_cerrado");

    return (
        <QModal
            nombre="resumenSincronizacionMovimientoBancario"
            titulo="Resultado de la sincronización"
            abierto={true}
            onCerrar={cerrar}
        >
            <div className="ResumenSincronizacionMovimientoBancario">
                <p>
                    {resumen.conexiones} conexión{resumen.conexiones === 1 ? "" : "es"} sincronizada
                    {resumen.conexiones === 1 ? "" : "s"}: {resumen.nuevos} nuevos, {resumen.modificados}{" "}
                    modificados, {resumen.eliminados} eliminados.
                </p>
                <p>
                    Conciliación automática: {resumen.conciliados} casados y {resumen.conCandidatos} con
                    candidatos para revisar
                    {resumen.conciliadosIa + resumen.conCandidatosIa > 0 &&
                        ` (la IA ha casado ${resumen.conciliadosIa} y propuesto candidatos en ${resumen.conCandidatosIa})`}.
                </p>

                {resumen.erroresConciliacion.length > 0 && (
                    <>
                        <QAviso variante="advertencia">No se han podido conciliar:</QAviso>
                        <ul className="errores-sincronizacion">
                            {resumen.erroresConciliacion.map((error, indice) => <li key={indice}>{error}</li>)}
                        </ul>
                    </>
                )}

                {resumen.errores.length > 0 && (
                    <>
                        <QAviso variante="error">
                            Se han producido errores en {resumen.errores.length} conexión
                            {resumen.errores.length === 1 ? "" : "es"}:
                        </QAviso>
                        <ul className="errores-sincronizacion">
                            {resumen.errores.map((error, indice) => (
                                <li key={`${error.conexionId}-${indice}`}>
                                    <strong>{error.institucionNombre ?? "Banco sin identificar"}:</strong>{" "}
                                    {error.error}
                                    {error.requiereReautenticacion && (
                                        <>
                                            {" "}— hay que volver a autenticar la conexión.{" "}
                                            <QBoton
                                                tamaño="pequeño"
                                                variante="borde"
                                                enlace={`/tesoreria/conexion_bancaria?id=${encodeURIComponent(error.conexionId)}`}
                                            >
                                                Ir a la conexión
                                            </QBoton>
                                        </>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </>
                )}

                <div className="botones maestro-botones">
                    <QBoton onClick={cerrar}>Cerrar</QBoton>
                </div>
            </div>
        </QModal>
    );
};
