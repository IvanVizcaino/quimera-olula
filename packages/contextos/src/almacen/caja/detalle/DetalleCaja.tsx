import { Detalle } from "@olula/componentes/detalle/Detalle.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.ts";
import { QuimeraAcciones } from "@olula/componentes/index.js";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useCallback, useEffect } from "react";
import { BorrarCaja } from "../borrar/BorrarCaja.js";
import { Caja } from "../diseño.ts";
import { ArbolContenidoCaja } from "./ArbolContenidoCaja.tsx";
import "./DetalleCaja.css";
import { contextoDetalleCajaInicial, guardarCaja, metaCaja } from "./dominio.ts";
import { getMaquina } from "./maquina.ts";

const titulo = ( caja : Caja ) => `Caja ${caja.lpn} en ${caja.ubicacion}`;

export const DetalleCaja = ({
    id,
    publicar = async () => {},
}: {
    id?: string;
    publicar?: EmitirEvento;
}) => {
    const { ctx, emitir } = useMaquina(
        getMaquina,
        contextoDetalleCajaInicial,
        publicar
    );

    const autoGuardar = useCallback(
        async (caja: Caja) => {
            await guardarCaja(ctx, caja);
            await emitir("caja_guardada");
        },
        [ctx, emitir]
    );

    // Auto-guardado: useModelo detecta cambios y llama a autoGuardar
    useModelo(metaCaja, ctx.caja, autoGuardar);

    const { estado, caja } = ctx;

    useEffect(() => {
        emitir("caja_id_cambiado", id, true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    if (!caja.id) return null;

    const accionesCaja = [
        {
            texto: "Borrar",
            onClick: () => emitir("borrado_solicitado"),
            advertencia: true,
        },
    ];

    return (
        <Detalle
            id={id}
            obtenerTitulo={titulo}
            setEntidad={() => {}}
            entidad={caja}
            cerrarDetalle={() => emitir("caja_deseleccionada", null, true)}
        >
            <div className="DetalleCaja">
                <QuimeraAcciones acciones={accionesCaja} />
                <ArbolContenidoCaja contenido={caja.contenido} />
            </div>

            {estado === "BORRANDO" && (
                <BorrarCaja
                    caja={ctx.caja}
                    publicar={emitir}
                />
            )}
        </Detalle>
    );
};
