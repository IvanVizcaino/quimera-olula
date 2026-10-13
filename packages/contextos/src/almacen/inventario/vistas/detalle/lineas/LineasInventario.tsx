import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { ListaEntidades } from "@olula/lib/ListaEntidades.js";
import { Inventario, LineaInventario } from "../../../diseño.ts";
import { CrearLineaInventario } from "../../crear_linea/CrearLineaInventario.tsx";
import { LineasInventarioLista } from "./LineasInventarioLista.tsx";

export const LineasInventario = ({
    inventario,
    lineas,
    estado,
    editable,
    publicar,
}: {
    inventario: Inventario;
    lineas: ListaEntidades<LineaInventario>;
    estado: string;
    editable: boolean;
    publicar: EmitirEvento;
}) => (
    <section className="LineasInventario">
        {editable && (
            <div className="maestro-botones">
                <QBoton onClick={() => publicar("alta_linea_solicitada")}>Añadir línea</QBoton>
            </div>
        )}
        <LineasInventarioLista
            lineas={lineas.lista}
            seleccionada={lineas.activo?.id}
            publicar={publicar}
        />
        {estado === "CREANDO_LINEA" && (
            <CrearLineaInventario inventario={inventario} publicar={publicar} />
        )}
    </section>
);
