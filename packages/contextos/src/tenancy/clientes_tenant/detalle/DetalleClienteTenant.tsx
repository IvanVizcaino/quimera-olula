import { Detalle } from "@olula/componentes/detalle/Detalle.tsx";
import { Tab, Tabs } from "@olula/componentes/detalle/tabs/Tabs.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.js";
import { QuimeraAcciones } from "@olula/componentes/moleculas/qacciones.tsx";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { useModelo } from "@olula/lib/useModelo.js";
import { useCallback, useEffect } from "react";
import { BorrarClienteTenant } from "../borrar/BorrarClienteTenant.js";
import { ClienteTenant } from "../diseño.js";
import { contextoDetalleClienteTenantInicial, guardarCliente, metaClienteTenant } from "./detalle.js";
import { getMaquina } from "./maquina.js";
import { TabGeneral } from "./TabGeneral.js";

export const DetalleClienteTenant = ({
    id,
    publicar = async () => {},
}: {
    id?: string;
    publicar?: EmitirEvento;
}) => {

    const { ctx, emitir } = useMaquina(
        getMaquina,
        contextoDetalleClienteTenantInicial,
        publicar
    );

    const autoGuardar = useCallback(
        async (cliente: ClienteTenant) => {
            await guardarCliente(ctx, cliente);
            await emitir("cliente_guardado");
        },
        [ctx, emitir]
    );

    const formModelo = useModelo(metaClienteTenant, ctx.cliente, autoGuardar);

    const { estado } = ctx;

    useEffect(() => {
        emitir("cliente_id_cambiado", id, true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    if (!ctx.cliente.id) return null;

    const titulo = (c: ClienteTenant) => c.nombre;

    const acciones = [
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
            entidad={ctx.cliente}
            cerrarDetalle={() => emitir("cliente_deseleccionado", null, true)}
        >
            <div className="DetalleClienteTenant">
                <div className="maestro-botones">
                    <QuimeraAcciones acciones={acciones} vertical />
                </div>
                <Tabs children={[
                    <Tab label="General"
                        key="tab-general"
                        children={
                            <TabGeneral form={formModelo} publicar={emitir} />
                        }
                    />,
                ]} />
            </div>

            {estado === "BORRANDO" && (
                <BorrarClienteTenant
                    cliente={ctx.cliente}
                    publicar={emitir}
                />
            )}
        </Detalle>
    );
};
