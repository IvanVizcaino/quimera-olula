import { Articulo } from "#/almacen/comun/componentes/Articulo.tsx";
import { Lote } from "#/almacen/comun/componentes/Lote.tsx";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QModal } from "@olula/componentes/index.ts";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { pluginActivo } from "@olula/lib/plugins.tsx";
import { useFocus } from "@olula/lib/useFocus.ts";
import { useForm } from "@olula/lib/useForm.ts";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useCallback, useMemo } from "react";
import { Inventario } from "../../diseño.ts";
import { metaNuevaLineaInventario, nuevaLineaInventarioVacia } from "../../dominio.ts";
import { postLineaInventario } from "../../infraestructura.ts";

export const CrearLineaInventario = ({
    inventario,
    publicar,
}: {
    inventario: Inventario;
    publicar: EmitirEvento;
}) => {
    const inicial = useMemo(nuevaLineaInventarioVacia, []);
    const { modelo, uiProps, valido, set } = useModelo(metaNuevaLineaInventario, inicial);

    const crear_ = useCallback(async () => {
        const idLinea = await postLineaInventario(inventario.id, modelo);
        publicar("linea_creada", idLinea);
    }, [inventario.id, modelo, publicar]);

    const cancelar_ = useCallback(() => publicar("alta_de_linea_cancelada"), [publicar]);

    const [crear, cancelar] = useForm(crear_, cancelar_);
    const focus = useFocus();
    const conLotes = pluginActivo("trazabilidad");

    return (
        <QModal abierto={true} nombre="crearLineaInventario" titulo="Línea de recuento" onCerrar={cancelar}>
            <quimera-formulario>
                <Articulo
                    valor={modelo.referencia}
                    onChange={(opcion) =>
                        set({ ...modelo, referencia: opcion?.valor ?? "" })
                    }
                    ref={focus}
                />
                <QInput label="Cantidad recogida" {...uiProps("cantidadFin")} />
                {conLotes && (
                    <Lote
                        sku={modelo.referencia}
                        valor={modelo.codlote}
                        onChange={(opcion) =>
                            set({ ...modelo, codlote: opcion?.valor ?? "" })
                        }
                    />
                )}
            </quimera-formulario>
            <div className="botones maestro-botones">
                <QBoton onClick={crear} deshabilitado={!valido}>
                    Guardar
                </QBoton>
            </div>
        </QModal>
    );
};
