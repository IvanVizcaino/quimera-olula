import { Detalle } from "@olula/componentes/detalle/Detalle.tsx";
import { Tab, Tabs } from "@olula/componentes/detalle/tabs/Tabs.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.js";
import { QuimeraAcciones } from "@olula/componentes/moleculas/qacciones.tsx";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { useModelo } from "@olula/lib/useModelo.js";
import { useCallback, useEffect } from "react";
import { BorrarUsuarioTenant } from "../borrar/BorrarUsuarioTenant.js";
import { UsuarioTenant } from "../diseño.js";
import { contextoDetalleUsuarioTenantInicial, guardarUsuario, metaUsuarioTenant } from "./detalle.js";
import { getMaquina } from "./maquina.js";
import { TabGeneral } from "./TabGeneral.js";

export const DetalleUsuarioTenant = ({
    id,
    publicar = async () => {},
}: {
    id?: string;
    publicar?: EmitirEvento;
}) => {

    const { ctx, emitir } = useMaquina(
        getMaquina,
        contextoDetalleUsuarioTenantInicial,
        publicar
    );

    const autoGuardar = useCallback(
        async (usuario: UsuarioTenant) => {
            await guardarUsuario(ctx, usuario);
            await emitir("usuario_guardado");
        },
        [ctx, emitir]
    );

    const formModelo = useModelo(metaUsuarioTenant, ctx.usuario, autoGuardar);

    const { estado } = ctx;

    useEffect(() => {
        emitir("usuario_id_cambiado", id, true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    if (!ctx.usuario.id) return null;

    const titulo = (u: UsuarioTenant) => u.nombre;

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
            entidad={ctx.usuario}
            cerrarDetalle={() => emitir("usuario_deseleccionado", null, true)}
        >
            <div className="DetalleUsuarioTenant">
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
                <BorrarUsuarioTenant
                    usuario={ctx.usuario}
                    publicar={emitir}
                />
            )}
        </Detalle>
    );
};
