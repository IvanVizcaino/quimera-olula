import { Detalle } from "@olula/componentes/detalle/Detalle.tsx";
import { Tab, Tabs } from "@olula/componentes/detalle/tabs/Tabs.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.js";
import { QuimeraAcciones } from "@olula/componentes/index.js";
import { EmitirEvento } from "@olula/lib/diseño.ts";
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
import { TabGeneral } from "./TabGeneral.js";
import { TabIdentificacion } from "./TabIdentificacion.js";

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

    const formModelo = useModelo(metaCuentaBancaria, ctx.cuenta, autoGuardar);

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
                <Tabs children={[
                    <Tab label="General"
                        key="tab-general"
                        children={<TabGeneral form={formModelo} />}
                    />,
                    <Tab label="Identificación"
                        key="tab-identificacion"
                        children={<TabIdentificacion form={formModelo} />}
                    />,
                ]}/>
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
