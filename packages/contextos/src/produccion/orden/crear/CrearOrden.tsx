import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { CampoFecha } from "../../comun/componentes/CampoFecha.tsx";
import { useMemo } from "react";
import { SelectorArticuloFabricado } from "../../articulo/SelectorArticuloFabricado.tsx";
import { CrearSimple } from "../../comun/maestro_simple/CrearSimple.tsx";
import { fechaDdMmAaaa } from "../../comun/dominio.ts";
import { fechaFabricacionPorDefecto, metaNuevaOrden, nuevaOrdenVacia } from "../dominio.ts";
import { postOrden } from "../infraestructura.ts";

/** Alta de una orden de producción con su lote (una orden, un lote). */
export const CrearOrden = ({ publicar }: { publicar: EmitirEvento }) => {
    const vacia = useMemo(() => nuevaOrdenVacia(), []);
    const porDefecto = useMemo(() => fechaDdMmAaaa(fechaFabricacionPorDefecto()), []);

    return (
        <CrearSimple
            publicar={publicar}
            nombre="crearOrdenProduccion"
            titulo="Nueva orden de producción"
            clase="CrearOrdenProduccion FormOrdenProduccion"
            meta={metaNuevaOrden}
            vacio={vacia}
            crear={postOrden}
            campos={({ uiProps }, focus) => (
                <>
                    <CampoFecha label="Fecha" {...uiProps("fecha")} />
                    <CampoFecha label="Fecha de entrega" {...uiProps("fechaEntrega")} />
                    <QInput label="Descripción" {...uiProps("descripcion")} ref={focus} />
                    <h4 className="subtitulo-lote">Lote</h4>
                    <SelectorArticuloFabricado {...uiProps("articuloId")} />
                    <QInput label="Cantidad" {...uiProps("cantidad")} />
                    <CampoFecha label={`Fecha de fabricación (vacía: ${porDefecto})`} {...uiProps("fechaFabricacion")} />
                </>
            )}
        />
    );
};
