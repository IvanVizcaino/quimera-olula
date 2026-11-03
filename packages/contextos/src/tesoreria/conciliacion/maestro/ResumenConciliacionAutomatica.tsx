import { QAviso } from "@olula/componentes/atomos/qaviso.tsx";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QModal } from "@olula/componentes/moleculas/qmodal.tsx";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { ResumenConciliacionAutomatica as Resumen } from "../diseño.js";
import "./ResumenSincronizacionMovimientoBancario.css";

export const ResumenConciliacionAutomatica = ({
    resumen,
    publicar,
}: {
    resumen: Resumen;
    publicar: EmitirEvento;
}) => {
    const cerrar = () => publicar("resumen_conciliacion_automatica_cerrado");

    return (
        <QModal
            nombre="resumenConciliacionAutomatica"
            titulo="Conciliación automática"
            abierto={true}
            onCerrar={cerrar}
        >
            <div className="ResumenSincronizacionMovimientoBancario">
                <p>
                    {resumen.analizados} movimientos analizados: {resumen.conciliados} casados y{" "}
                    {resumen.conCandidatos} con candidatos para revisar
                    {resumen.conciliadosIa + resumen.conCandidatosIa > 0 &&
                        ` (la IA ha casado ${resumen.conciliadosIa} y propuesto candidatos en ${resumen.conCandidatosIa})`}.
                </p>

                {resumen.errores.length > 0 && (
                    <>
                        <QAviso variante="advertencia">No se han podido conciliar:</QAviso>
                        <ul className="errores-sincronizacion">
                            {resumen.errores.map((error, indice) => <li key={indice}>{error}</li>)}
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
