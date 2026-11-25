import { QAviso } from "@olula/componentes/atomos/qaviso.tsx";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { useState } from "react";
import { EstadoPaginaSuscripcion, Suscripcion } from "../diseño.ts";
import { fechaCorta, puedeCancelar, puedeReanudar } from "../dominio.ts";

/**
 * Cancelar (al final del periodo) o reanudar. La confirmación va en la propia página:
 * estado CONFIRMANDO_CANCELACION de la máquina. El plan legado no se cancela desde aquí.
 */
export const CancelarSuscripcion = ({
    suscripcion, estado, publicar,
}: {
    suscripcion: Suscripcion;
    estado: EstadoPaginaSuscripcion;
    publicar: EmitirEvento;
}) => {
    const [ocupado, setOcupado] = useState(false);
    const ejecutar = async (evento: string) => {
        setOcupado(true);
        try {
            await publicar(evento);
        } finally {
            setOcupado(false);
        }
    };

    if (!puedeCancelar(suscripcion) && !puedeReanudar(suscripcion)) return null;

    return (
        <section className="susc-seccion" aria-labelledby="susc-cancelar">
            <h3 id="susc-cancelar">Cancelar suscripción</h3>

            {puedeReanudar(suscripcion) && (
                <>
                    <p>
                        Tu suscripción está cancelada y terminará el {fechaCorta(suscripcion.finPeriodo)}.
                        Si cambias de idea, puedes reanudarla y seguirá renovándose con normalidad.
                    </p>
                    <QBoton onClick={() => ejecutar("reanudacion_solicitada")} deshabilitado={estado !== "ABIERTA" || ocupado}>
                        Reanudar suscripción
                    </QBoton>
                </>
            )}

            {puedeCancelar(suscripcion) && estado !== "CONFIRMANDO_CANCELACION" && (
                <>
                    <p>
                        Al cancelar no se te cobrará más, y seguirás teniendo acceso hasta el final del periodo
                        ({fechaCorta(suscripcion.finPeriodo)}).
                    </p>
                    <QBoton variante="borde" destructivo onClick={() => ejecutar("cancelacion_solicitada")}
                        deshabilitado={estado !== "ABIERTA" || ocupado}>
                        Cancelar suscripción
                    </QBoton>
                </>
            )}

            {puedeCancelar(suscripcion) && estado === "CONFIRMANDO_CANCELACION" && (
                <QAviso variante="advertencia">
                    <div>
                        <p>
                            ¿Seguro que quieres cancelar? Tu suscripción terminará el {fechaCorta(suscripcion.finPeriodo)}
                            {" "}y no se renovará. Podrás reanudarla hasta esa fecha.
                        </p>
                        <div className="susc-acciones">
                            <QBoton destructivo onClick={() => ejecutar("cancelacion_confirmada")} deshabilitado={ocupado}>
                                Sí, cancelar al final del periodo
                            </QBoton>
                            <QBoton variante="borde" onClick={() => ejecutar("cancelacion_abandonada")} deshabilitado={ocupado}>
                                No, mantener mi suscripción
                            </QBoton>
                        </div>
                    </div>
                </QAviso>
            )}
        </section>
    );
};
