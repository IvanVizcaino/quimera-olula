import { Detalle } from "@olula/componentes/detalle/Detalle.tsx";
import { Tab, Tabs } from "@olula/componentes/detalle/tabs/Tabs.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.js";
import { QuimeraAcciones } from "@olula/componentes/index.js";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { useModelo } from "@olula/lib/useModelo.js";
import { useCallback, useEffect } from "react";
import { BorrarEmpresa } from "../borrar/BorrarEmpresa.js";
import { Empresa } from "../diseño.js";
import {
    contextoDetalleEmpresaInicial,
    guardarEmpresa,
    metaEmpresa,
} from "./detalle.js";
import "./DetalleEmpresa.css";
import { getMaquina } from "./maquina.js";
import { TabComercial } from "./TabComercial.js";
import { TabDireccion } from "./TabDireccion.js";
import { TabGeneral } from "./TabGeneral.js";

export const DetalleEmpresa = ({
    id,
    publicar = async () => {},
}: {
    id?: string;
    publicar?: EmitirEvento;
}) => {

    const { ctx, emitir } = useMaquina(
        getMaquina,
        contextoDetalleEmpresaInicial,
        publicar,
    );

    const autoGuardar = useCallback(
        async (empresa: Empresa) => {
            await guardarEmpresa(ctx, empresa);
            await emitir("empresa_guardada");
        },
        [ctx, emitir],
    );

    const formModelo = useModelo(metaEmpresa, ctx.empresa, autoGuardar);

    const { estado, empresa } = ctx;

    useEffect(() => {
        emitir("empresa_id_cambiado", id, true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    if (!ctx.empresa.id) return null;

    const titulo = (e: Empresa) => e.nombre;

    const accionesEmpresa = [
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
            entidad={ctx.empresa}
            cerrarDetalle={() => emitir("empresa_deseleccionada", null, true)}
        >
            <div className="DetalleEmpresa">
                <QuimeraAcciones acciones={accionesEmpresa} />
                <Tabs children={[
                    <Tab label="General"
                        key="tab-general"
                        children={<TabGeneral form={formModelo} />}
                    />,
                    <Tab label="Dirección"
                        key="tab-direccion"
                        children={<TabDireccion form={formModelo} />}
                    />,
                    <Tab label="Comercial"
                        key="tab-comercial"
                        children={<TabComercial form={formModelo} />}
                    />,
                ]}/>
            </div>

            {estado === "BORRANDO" && (
                <BorrarEmpresa
                    empresa={empresa}
                    publicar={emitir}
                />
            )}
        </Detalle>
    );
};
