import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useCallback, useState } from "react";
import { EstadoPaginaSuscripcion, MiSuscripcion } from "../diseño.ts";
import { fechaCorta, metaNuevoMandato, necesitaMetodoPago, nuevoMandatoInicial } from "../dominio.ts";

const FormularioMandato = ({ publicar }: { publicar: EmitirEvento }) => {
    const { modelo, uiProps, valido } = useModelo(metaNuevoMandato, nuevoMandatoInicial);
    const [enviando, setEnviando] = useState(false);

    const guardar = useCallback(async () => {
        setEnviando(true);
        try {
            await publicar("mandato_guardado", modelo);
        } finally {
            setEnviando(false);
        }
    }, [publicar, modelo]);

    return (
        <div className="susc-mandato">
            <p>
                Domiciliación bancaria (SEPA). Al guardarla autorizas a Olula a cargar en esta cuenta
                las cuotas de tu suscripción.
            </p>
            <quimera-formulario>
                <QInput label="Titular de la cuenta" {...uiProps("titular")} />
                <QInput label="IBAN" {...uiProps("iban")} />
            </quimera-formulario>
            <div className="susc-acciones">
                <QBoton onClick={guardar} deshabilitado={!valido || enviando}>
                    {enviando ? "Guardando…" : "Guardar domiciliación"}
                </QBoton>
                <QBoton variante="borde" onClick={() => publicar("mandato_cancelado")} deshabilitado={enviando}>
                    Cancelar
                </QBoton>
            </div>
        </div>
    );
};

export const PagoSuscripcion = ({
    mi, estado, publicar,
}: {
    mi: MiSuscripcion;
    estado: EstadoPaginaSuscripcion;
    publicar: EmitirEvento;
}) => {
    const s = mi.suscripcion!;
    const [ocupado, setOcupado] = useState(false);
    const ejecutar = async (evento: string) => {
        setOcupado(true);
        try {
            await publicar(evento);
        } finally {
            setOcupado(false);
        }
    };
    const libre = estado === "ABIERTA" && !ocupado;

    return (
        <section className="susc-seccion" aria-labelledby="susc-pago">
            <h3 id="susc-pago">Método de pago</h3>

            {estado === "PIDIENDO_MANDATO" && <FormularioMandato publicar={publicar} />}

            {estado !== "PIDIENDO_MANDATO" && !necesitaMetodoPago(s) && (
                mi.mandatoSepa ? (
                    <>
                        <dl className="susc-mandato-datos">
                            <dt>Domiciliación SEPA</dt>
                            <dd>{mi.mandatoSepa.titular}</dd>
                            <dt>Cuenta</dt>
                            <dd>{mi.mandatoSepa.iban}</dd>
                            <dt>Referencia del mandato</dt>
                            <dd>{mi.mandatoSepa.referencia}{mi.mandatoSepa.fechaFirma ? ` (firmado el ${fechaCorta(mi.mandatoSepa.fechaFirma)})` : ""}</dd>
                        </dl>
                        <QBoton variante="borde" onClick={() => ejecutar("mandato_solicitado")} deshabilitado={!libre}>
                            Cambiar domiciliación
                        </QBoton>
                    </>
                ) : (
                    <>
                        <p>Tienes un método de pago guardado.</p>
                        <QBoton variante="borde" onClick={() => ejecutar("portal_solicitado")} deshabilitado={!libre}>
                            Cambiar tarjeta o ver recibos
                        </QBoton>
                    </>
                )
            )}

            {estado !== "PIDIENDO_MANDATO" && necesitaMetodoPago(s) && (
                <>
                    <p>
                        {s.estado === "prueba"
                            ? "Aún no has añadido ningún método de pago. Añádelo antes de que termine la prueba para seguir sin interrupciones."
                            : "No tienes ningún método de pago guardado."}
                    </p>
                    <QBoton onClick={() => ejecutar("pago_solicitado")} deshabilitado={!libre}>
                        Añadir método de pago
                    </QBoton>
                </>
            )}
        </section>
    );
};
