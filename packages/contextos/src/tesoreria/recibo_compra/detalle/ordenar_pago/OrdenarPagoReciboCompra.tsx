import { CuentaBancariaSelect } from "#/tesoreria/comun/componentes/cuenta_bancaria_select.tsx";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QModal } from "@olula/componentes/index.js";
import { ContextoError } from "@olula/lib/contexto.ts";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { MetaModelo } from "@olula/lib/dominio.js";
import { useModelo } from "@olula/lib/useModelo.js";
import { useContext, useState } from "react";
import { ibanLegible } from "../../../comun/banca.ts";
import { TransferenciaBancaria } from "../../../comun/componentes/TransferenciaBancaria.tsx";
import { ReciboCompra } from "../../diseño.js";
import { OrdenPagoReciboCompraApi, postOrdenarPagoReciboCompra } from "../../infraestructura.js";

type ModeloCuenta = { cuenta_banco_id: string; nombre_cuenta: string };

const metaCuenta: MetaModelo<ModeloCuenta> = {
    campos: {
        cuenta_banco_id: { requerido: true },
    },
};

const vacio: ModeloCuenta = { cuenta_banco_id: "", nombre_cuenta: "" };

/**
 * Pago al proveedor: la empresa le transfiere el importe del recibo desde la
 * cuenta que se elija aquí. Si el proveedor bancario no puede ejecutar el
 * pago directamente, hay que autorizarlo en el banco de la empresa.
 */
export const OrdenarPagoReciboCompra = ({
    recibo,
    publicar,
}: {
    recibo: ReciboCompra;
    publicar: EmitirEvento;
}) => {
    const { intentar } = useContext(ContextoError);
    const { modelo, uiProps, valido } = useModelo(metaCuenta, vacio);
    const [orden, setOrden] = useState<OrdenPagoReciboCompraApi | null>(null);

    const proveedor = recibo.nombreProveedor || "el proveedor";

    const ordenar = () => {
        intentar(async () => {
            setOrden(await postOrdenarPagoReciboCompra(recibo.id, modelo.cuenta_banco_id));
        });
    };

    const cerrar = () => publicar("ordenar_pago_cerrado");

    return (
        <QModal
            abierto={true}
            nombre="ordenar_pago"
            titulo={`Pagar a ${proveedor}`}
            onCerrar={cerrar}
        >
            <div className="OrdenarPagoReciboCompra">
                {!orden ? (
                    <>
                        <p>
                            La empresa pagará el recibo {recibo.codigo} a{" "}
                            <strong>{proveedor}</strong>, en su cuenta de pago. Elige la
                            cuenta de la empresa desde la que sale el dinero.
                        </p>
                        <quimera-formulario>
                            <CuentaBancariaSelect
                                label="Cuenta de la empresa que envía el dinero"
                                {...uiProps("cuenta_banco_id", "nombre_cuenta")}
                            />
                        </quimera-formulario>
                        <div className="botones maestro-botones">
                            <QBoton onClick={ordenar} deshabilitado={!valido}>
                                Preparar pago
                            </QBoton>
                        </div>
                    </>
                ) : (
                    <>
                        <TransferenciaBancaria
                            envia={orden.ordenante}
                            recibe={orden.beneficiario}
                            importe={recibo.importe}
                            referencia={orden.referencia}
                        />
                        {orden.requiere_autorizacion && orden.url ? (
                            <>
                                <p>
                                    El dinero no sale hasta que{" "}
                                    <strong>{orden.ordenante.nombre}</strong> autorice la
                                    transferencia en su banco. Al abrir el banco, entra con el
                                    acceso de la cuenta {ibanLegible(orden.ordenante.iban)}: el
                                    banco solo permitirá pagar desde ella.
                                </p>
                                <div className="botones maestro-botones">
                                    <QBoton
                                        onClick={() =>
                                            window.open(orden.url ?? "", "_blank", "noopener,noreferrer")
                                        }
                                    >
                                        Autorizar en el banco
                                    </QBoton>
                                    <QBoton onClick={cerrar} variante="borde">
                                        Cerrar
                                    </QBoton>
                                </div>
                            </>
                        ) : (
                            <>
                                <p>
                                    Pago enviado: <strong>{orden.beneficiario.nombre}</strong>{" "}
                                    recibirá la transferencia de{" "}
                                    <strong>{orden.ordenante.nombre}</strong>.
                                </p>
                                <div className="botones maestro-botones">
                                    <QBoton onClick={cerrar}>Cerrar</QBoton>
                                </div>
                            </>
                        )}
                    </>
                )}
            </div>
        </QModal>
    );
};
