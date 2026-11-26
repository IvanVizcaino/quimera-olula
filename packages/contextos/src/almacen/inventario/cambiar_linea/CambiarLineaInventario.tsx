import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QModal } from "@olula/componentes/index.js";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { useForm } from "@olula/lib/useForm.js";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useCallback, useMemo } from "react";
import { Inventario, LineaInventario } from "../diseño.ts";
import { patchLineaInventario } from "../infraestructura.ts";
import { avisoLecturas, lineaACambios, metaCambiosLineaInventario } from "./cambiar_linea.ts";

/**
 * Cambia la cantidad contada, el motivo y la ubicación de una línea con un
 * solo `PATCH`: la línea conserva sus lecturas de fichero y el servidor
 * recalcula el stock.
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

    const { modelo, uiProps, valido } = useModelo(metaCambiosLineaInventario, inicial);

    const cambiar_ = useCallback(async () => {
        const id = await patchLineaInventario(inventario.id, linea, modelo);
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
                    <QInput label="Ubicación" {...uiProps("ubicacion")} />
                </quimera-formulario>
                {linea.lecturas > 0 && (
                    <p className="aviso-inventario">
                        {avisoLecturas(linea.lecturas)}
                    </p>
                )}
                <div className="botones maestro-botones">
                    <QBoton onClick={cambiar} deshabilitado={!valido}>
                        Cambiar
                    </QBoton>
                </div>
            </div>
        </QModal>
    );
};
