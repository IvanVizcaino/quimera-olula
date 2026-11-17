import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QDate } from "@olula/componentes/atomos/qdate.tsx";
import { QModal } from "@olula/componentes/index.js";
import { ContextoError } from "@olula/lib/contexto.ts";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { useCallback, useContext, useState } from "react";
import { fechaAApi, postDeshacerDotaciones } from "../infraestructura.ts";

/** Borra las dotaciones (y sus asientos) con fecha desde la indicada. */
export const DeshacerDotaciones = ({ publicar }: { publicar: EmitirEvento }) => {
    const { intentar } = useContext(ContextoError);
    const hoy = new Date();
    const [fecha, setFecha] = useState<Date>(new Date(hoy.getFullYear(), hoy.getMonth(), 1, 12));
    const [mensaje, setMensaje] = useState<string | null>(null);
    const [ocupado, setOcupado] = useState(false);

    const deshacer = useCallback(async () => {
        if (ocupado) return;
        setOcupado(true);
        try {
            const r = await intentar(() => postDeshacerDotaciones(fecha));
            setMensaje(r.totalDotaciones === 0
                ? "No había dotaciones desde esa fecha"
                : `Se han borrado ${r.totalDotaciones} dotaciones por un total de ${r.importe.toLocaleString("es-ES", { minimumFractionDigits: 2 })}`);
        } finally {
            setOcupado(false);
        }
    }, [fecha, intentar, ocupado]);

    const cerrar = useCallback(
        () => publicar(mensaje ? "dotaciones_deshechas" : "deshacer_cancelado"),
        [publicar, mensaje]
    );

    return (
        <QModal abierto={true} nombre="deshacerDotaciones" titulo="Deshacer dotaciones"
            onCerrar={cerrar}>
            <div className="DeshacerDotaciones">
                {!mensaje && (
                    <>
                        <p>Se borrarán las dotaciones con fecha de asiento igual o posterior a la
                            indicada, junto con sus asientos.</p>
                        <quimera-formulario>
                            <QDate label="Desde" nombre="fecha_desde" valor={fechaAApi(fecha)}
                                onChange={(valor) => valor && setFecha(new Date(`${valor}T12:00:00`))} />
                        </quimera-formulario>
                        <div className="botones maestro-botones">
                            <QBoton onClick={deshacer} deshabilitado={ocupado}>
                                {ocupado ? "Borrando…" : "Deshacer"}
                            </QBoton>
                        </div>
                    </>
                )}
                {mensaje && (
                    <>
                        <p>{mensaje}</p>
                        <div className="botones maestro-botones">
                            <QBoton onClick={cerrar}>Aceptar</QBoton>
                        </div>
                    </>
                )}
            </div>
        </QModal>
    );
};
