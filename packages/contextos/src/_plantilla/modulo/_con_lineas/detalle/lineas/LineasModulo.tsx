import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { ListaEntidades } from "@olula/lib/ListaEntidades.js";
import { BorrarLineaModulo } from "../../borrar_linea/BorrarLineaModulo.js";
import { CambiarLineaModulo } from "../../cambiar_linea/CambiarLineaModulo.js";
import { CrearLineaModulo } from "../../crear_linea/CrearLineaModulo.js";
import { LineaModulo, ModLin } from "../../diseño.js";
import { EstadoDetalleModLin } from "../maquina.js";
import { LineasLista } from "./LineasLista.js";

export const LineasModulo = ({
    modLin,
    lineas,
    estado,
    publicar,
}: {
    modLin: ModLin;
    lineas: ListaEntidades<LineaModulo>;
    estado: EstadoDetalleModLin;
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
            <LineasLista
                lineas={lineas.lista}
                seleccionada={lineas.activo?.id}
                publicar={publicar}
            />
            {estado === "CREANDO_LINEA" && (
                <CrearLineaModulo modLin={modLin} publicar={publicar} />
            )}
            {lineas.activo && estado === "CAMBIANDO_LINEA" && (
                <CambiarLineaModulo
                    modLin={modLin}
                    linea={lineas.activo}
                    publicar={publicar}
                />
            )}
            {lineas.activo && estado === "BORRANDO_LINEA" && (
                <BorrarLineaModulo
                    modLin={modLin}
                    linea={lineas.activo}
                    publicar={publicar}
                />
            )}
        </>
    );
};
