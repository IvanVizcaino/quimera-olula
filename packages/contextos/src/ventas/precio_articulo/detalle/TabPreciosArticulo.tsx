import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.js";
import { useEffect } from "react";
import { BorrarPrecioArticulo } from "../borrar/BorrarPrecioArticulo.tsx";
import { CambiarPrecioArticulo } from "../cambiar/CambiarPrecioArticulo.tsx";
import { CrearPrecioArticulo } from "../crear/CrearPrecioArticulo.tsx";
import { getMaquina } from "./maquina.ts";
import { PreciosArticuloLista } from "./PreciosArticuloLista.tsx";
import { contextoInicial } from "./precios_articulo.ts";

/**
 * Pestaña "Precios por artículo" del detalle de cliente: condiciones de
 * `preciosarticulos` del cliente, con alta, cambio y borrado. Se muestra solo
 * si la secuencia de precios incluye `precios_articulos` (ver
 * `muestraPreciosArticulo`).
 *
 * Orquesta la lista y los modales; estos no reciben prop `activo` y reciben
 * la condición ya resuelta.
 */
export const TabPreciosArticulo = ({ clienteId }: { clienteId: string }) => {
    const { ctx, emitir } = useMaquina(getMaquina, contextoInicial(clienteId));

    useEffect(() => {
        if (clienteId) emitir("cliente_id_cambiado", clienteId, true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [clienteId]);

    const { estado, precios } = ctx;

    return (
        <div className="PreciosArticulo">
            <div className="botones maestro-botones">
                <QBoton onClick={() => emitir("alta_solicitada")}>Nuevo</QBoton>
                <QBoton
                    onClick={() => emitir("cambio_solicitado")}
                    deshabilitado={!precios.activo}
                >
                    Cambiar
                </QBoton>
                <QBoton
                    onClick={() => emitir("borrado_solicitado")}
                    deshabilitado={!precios.activo}
                    advertencia
                >
                    Borrar
                </QBoton>
            </div>
            <PreciosArticuloLista
                precios={precios.lista}
                seleccionado={precios.activo?.id}
                publicar={emitir}
            />
            {estado === "CREANDO" && (
                <CrearPrecioArticulo clienteId={ctx.clienteId} publicar={emitir} />
            )}
            {precios.activo && estado === "CAMBIANDO" && (
                <CambiarPrecioArticulo precio={precios.activo} publicar={emitir} />
            )}
            {precios.activo && estado === "BORRANDO" && (
                <BorrarPrecioArticulo precio={precios.activo} publicar={emitir} />
            )}
        </div>
    );
};
