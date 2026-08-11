import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { ListaEntidades } from "@olula/lib/ListaEntidades.js";
import { BorrarLineaOrden } from "../../borrar_linea/BorrarLineaOrden.tsx";
import { CambiarLineaOrden } from "../../cambiar_linea/CambiarLineaOrden.tsx";
import { CrearLineaOrden } from "../../crear_linea/CrearLineaOrden.tsx";
import { LineaOrdenAlmacen, OrdenAlmacen } from "../../../diseño.ts";
import { EstadoOrdenAlmacen } from "../maquina.ts";
import { LineasOrdenLista } from "./LineasOrdenLista.tsx";

export const LineasOrden = ({
    orden,
    lineas,
    estado,
    publicar,
}: {
    orden: OrdenAlmacen;
    lineas: ListaEntidades<LineaOrdenAlmacen>;
    estado: EstadoOrdenAlmacen;
    publicar: EmitirEvento;
}) => {
    return (
        <>
            <div className="botones maestro-botones">
                <QBoton onClick={() => publicar("alta_linea_solicitada")}>
                    Nueva línea
                </QBoton>
                <QBoton
                    onClick={() => publicar("cambio_linea_solicitado")}
                    deshabilitado={!lineas.activo}
                >
                    Editar
                </QBoton>
                <QBoton
                    onClick={() => publicar("baja_linea_solicitada")}
                    deshabilitado={!lineas.activo}
                >
                    Borrar
                </QBoton>
            </div>
            <LineasOrdenLista
                orden={orden}
                lineas={lineas.lista}
                seleccionada={lineas.activo?.id}
                publicar={publicar}
            />
            {estado === "CREANDO_LINEA" && (
                <CrearLineaOrden orden={orden} publicar={publicar} />
            )}
            {lineas.activo && estado === "CAMBIANDO_LINEA" && (
                <CambiarLineaOrden
                    orden={orden}
                    linea={lineas.activo}
                    publicar={publicar}
                />
            )}
            {lineas.activo && estado === "BORRANDO_LINEA" && (
                <BorrarLineaOrden
                    orden={orden}
                    linea={lineas.activo}
                    publicar={publicar}
                />
            )}
        </>
    );
};
