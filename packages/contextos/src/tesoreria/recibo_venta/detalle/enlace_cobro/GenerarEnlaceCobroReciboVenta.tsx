import { CuentaBancariaSelect } from "#/tesoreria/comun/componentes/cuenta_bancaria_select.tsx";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QModal } from "@olula/componentes/index.js";
import { ContextoError } from "@olula/lib/contexto.ts";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { MetaModelo } from "@olula/lib/dominio.js";
import { useModelo } from "@olula/lib/useModelo.js";
import { useContext, useState } from "react";
import { TransferenciaBancaria } from "../../../comun/componentes/TransferenciaBancaria.tsx";
import { ReciboVenta } from "../../diseño.js";
import { EnlaceCobroReciboVentaApi, postEnlaceCobroReciboVenta } from "../../infraestructura.js";
import "./GenerarEnlaceCobroReciboVenta.css";

type ModeloCuenta = { cuenta_banco_id: string; nombre_cuenta: string };

const metaCuenta: MetaModelo<ModeloCuenta> = {
    campos: {
        cuenta_banco_id: { requerido: true },
    },
};

const vacio: ModeloCuenta = { cuenta_banco_id: "", nombre_cuenta: "" };

/**
 * Cobro al cliente: genera un enlace que la empresa le envía para que pague
 * el recibo desde su banco a la cuenta de la empresa que se elija aquí.
 */
export const GenerarEnlaceCobroReciboVenta = ({
    recibo,
    publicar,
}: {
    recibo: ReciboVenta;
    publicar: EmitirEvento;
}) => {
    const { intentar } = useContext(ContextoError);
    const { modelo, uiProps, valido } = useModelo(metaCuenta, vacio);
    const [enlace, setEnlace] = useState<EnlaceCobroReciboVentaApi | null>(null);
    const [copiado, setCopiado] = useState(false);

    const cliente = recibo.nombreCliente || "el cliente";

    const generar = () => {
        intentar(async () => {
            setEnlace(await postEnlaceCobroReciboVenta(recibo.id, modelo.cuenta_banco_id));
        });
    };

    const copiar = async () => {
        if (!enlace) return;
        try {
            await navigator.clipboard.writeText(enlace.url);
            setCopiado(true);
        } catch {
            setCopiado(false);
        }
    };

    const cerrar = () => publicar("enlace_cobro_cerrado");

    return (
        <QModal
            abierto={true}
            nombre="generar_enlace_cobro"
            titulo={`Cobrar a ${cliente}`}
            onCerrar={cerrar}
        >
            <div className="GenerarEnlaceCobroReciboVenta">
                {!enlace ? (
                    <>
                        <p>
                            Se generará un enlace para que <strong>{cliente}</strong> pague
                            el recibo {recibo.codigo} desde su banco. Elige la cuenta de la
                            empresa en la que se recibirá el dinero.
                        </p>
                        <quimera-formulario>
                            <CuentaBancariaSelect
                                label="Cuenta de la empresa que recibe el dinero"
                                {...uiProps("cuenta_banco_id", "nombre_cuenta")}
                            />
                        </quimera-formulario>
                        <div className="botones maestro-botones">
                            <QBoton onClick={generar} deshabilitado={!valido}>
                                Generar enlace de cobro
                            </QBoton>
                        </div>
                    </>
                ) : (
                    <>
                        <TransferenciaBancaria
                            envia={{ nombre: enlace.pagador.nombre }}
                            recibe={enlace.beneficiario}
                            importe={recibo.importe}
                            referencia={enlace.referencia}
                        />
                        <p>
                            Envía este enlace a <strong>{enlace.pagador.nombre}</strong> por
                            correo o WhatsApp. Al abrirlo elegirá su banco y autorizará la
                            transferencia a <strong>{enlace.beneficiario.nombre}</strong>.
                        </p>
                        <quimera-formulario>
                            <QInput label="Enlace de cobro" nombre="url" valor={enlace.url} soloLectura />
                        </quimera-formulario>
                        <div className="botones maestro-botones">
                            <QBoton onClick={copiar}>
                                {copiado ? "Enlace copiado" : "Copiar enlace"}
                            </QBoton>
                            <QBoton onClick={cerrar} variante="borde">
                                Cerrar
                            </QBoton>
                        </div>
                    </>
                )}
            </div>
        </QModal>
    );
};
