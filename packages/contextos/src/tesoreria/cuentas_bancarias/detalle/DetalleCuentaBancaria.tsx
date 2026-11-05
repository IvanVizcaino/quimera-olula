import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QCheckbox } from "@olula/componentes/atomos/qcheckbox.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { Detalle } from "@olula/componentes/detalle/Detalle.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.js";
import { QuimeraAcciones } from "@olula/componentes/index.js";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { puede } from "@olula/lib/dominio.ts";
import { useModelo } from "@olula/lib/useModelo.js";
import { useCallback, useEffect } from "react";
import { BorrarCuentaBancaria } from "../borrar/BorrarCuentaBancaria.js";
import { CuentaBancaria } from "../diseño.js";
import {
    contextoDetalleCuentaBancariaInicial,
    guardarCuenta,
    metaCuentaBancaria,
} from "./detalle.js";
import "./DetalleCuentaBancaria.css";
import { getMaquina } from "./maquina.js";

export const DetalleCuentaBancaria = ({
    id,
    publicar = async () => {},
}: {
    id?: string;
    publicar?: EmitirEvento;
}) => {

    const { ctx, emitir } = useMaquina(
        getMaquina,
        contextoDetalleCuentaBancariaInicial,
        publicar,
    );

    const autoGuardar = useCallback(
        async (cuenta: CuentaBancaria) => {
            await guardarCuenta(ctx, cuenta);
            await emitir("cuenta_guardada");
        },
        [ctx, emitir],
    );

    const { uiProps } = useModelo(metaCuentaBancaria, ctx.cuenta, autoGuardar);

    const { estado, cuenta } = ctx;

    useEffect(() => {
        emitir("cuenta_id_cambiado", id, true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    if (!ctx.cuenta.id) return null;

    const titulo = (c: CuentaBancaria) => c.descripcion || c.iban || c.codigoCuenta;

    const accionesCuenta = [
        {
            texto: "Borrar",
            onClick: () => publicar("borrado_solicitado"),
            advertencia: true,
        },
    ];

    return (
        <Detalle
            id={id}
            obtenerTitulo={titulo}
            setEntidad={() => {}}
            entidad={ctx.cuenta}
            cerrarDetalle={() => emitir("cuenta_deseleccionada", null, true)}
        >
            <div className="DetalleCuentaBancaria">
                <QuimeraAcciones acciones={accionesCuenta} />
                {puede("tesoreria.conciliacion") && (
                    <div className="botones">
                        <QBoton variante="borde" enlace={`/tesoreria/cuentas_bancarias/${cuenta.id}/conciliacion`}>
                            Conciliación bancaria
                        </QBoton>
                    </div>
                )}
                <quimera-formulario>
                    <QInput label="Descripción" {...uiProps("descripcion")} />
                    <QInput label="IBAN" {...uiProps("iban")} />
                    <QInput label="Empresa" {...uiProps("empresaId")} />
                    <QCheckbox label="Obsoleta" {...uiProps("obsoleta")} />

                    {/* Calculados por el servidor a partir del IBAN */}
                    <QInput label="Código de cuenta" {...uiProps("codigoCuenta")} soloLectura />
                    <QInput label="País" {...uiProps("paisId")} soloLectura />
                    <QInput label="Dígito control" {...uiProps("digitoControl")} soloLectura />
                    <QInput label="Número de cuenta" {...uiProps("cuenta")} soloLectura />
                    <QInput label="BIC / SWIFT" {...uiProps("bic")} soloLectura />
                    <QInput label="Entidad" {...uiProps("entidad")} soloLectura />
                    <QInput label="Agencia" {...uiProps("agencia")} soloLectura />
                </quimera-formulario>
            </div>

            {estado === "BORRANDO" && (
                <BorrarCuentaBancaria
                    cuenta={cuenta}
                    publicar={emitir}
                />
            )}
        </Detalle>
    );
};
