import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QModal } from "@olula/componentes/index.js";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { useForm } from "@olula/lib/useForm.js";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useCallback, useMemo } from "react";
import { metaNuevaLineaInventario } from "../crear_linea/crear_linea.ts";
import { Inventario, LineaInventario } from "../diseño.ts";
import { cambiarLineaInventario } from "../infraestructura.ts";
import { lineaACambios } from "./cambiar_linea.ts";

/**
 * Cambia la cantidad contada (y el motivo) de una línea. El servidor no
 * tiene edición de líneas: se borra y se crea de nuevo (ver
 * `cambiarLineaInventario`).
 */
export const CambiarLineaInventario = ({
    inventario,
    linea,
    publicar,
}: {
    inventario: Inventario;
    linea: LineaInventario;
    publicar: EmitirEvento;
}) => {
    const inicial = useMemo(() => lineaACambios(linea), [linea]);

    const { modelo, uiProps, valido } = useModelo(metaNuevaLineaInventario, inicial);

    const cambiar_ = useCallback(async () => {
        const id = await cambiarLineaInventario(inventario.id, linea, modelo);
        publicar("linea_cambiada", id);
    }, [inventario.id, linea, modelo, publicar]);

    const cancelar_ = useCallback(
        () => publicar("cambio_de_linea_cancelado"),
        [publicar]
    );

    const [cambiar, cancelar] = useForm(cambiar_, cancelar_);

    return (
        <QModal
            abierto={true}
            nombre="cambiarLineaInventario"
            titulo={`Cambiar línea de ${linea.articuloId}`}
            onCerrar={cancelar}
        >
            <div className="CambiarLineaInventario">
                <quimera-formulario>
                    <QInput label="Artículo" nombre="articulo" valor={`${linea.articuloId} ${linea.descripcion ?? ""}`.trim()} soloLectura />
                    <QInput label="Cantidad contada" {...uiProps("cantidad")} />
                    <QInput label="Motivo" {...uiProps("motivo")} />
                </quimera-formulario>
                <p className="aviso-inventario">
                    La línea se borra y se crea de nuevo con la cantidad indicada; si venía de un
                    fichero, se pierden sus lecturas.
                </p>
                <div className="botones maestro-botones">
                    <QBoton onClick={cambiar} deshabilitado={!valido}>
                        Cambiar
                    </QBoton>
                </div>
            </div>
        </QModal>
    );
};
