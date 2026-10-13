import { Almacen } from "#/almacen/comun/componentes/Almacen.tsx";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QModal } from "@olula/componentes/index.ts";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { useFocus } from "@olula/lib/useFocus.ts";
import { useForm } from "@olula/lib/useForm.ts";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useCallback, useMemo, useState } from "react";
import { ResultadoInventarioTotal } from "../../diseño.ts";
import { metaNuevoInventario, nuevoInventarioVacio } from "../../dominio.ts";
import { postInventarioTotal } from "../../infraestructura.ts";

export const CrearInventarioTotal = ({ publicar }: { publicar: EmitirEvento }) => {
    const inicial = useMemo(nuevoInventarioVacio, []);
    const { modelo, uiProps, valido } = useModelo(metaNuevoInventario, inicial);
    const [resultado, setResultado] = useState<ResultadoInventarioTotal | null>(null);

    const crear_ = useCallback(async () => {
        const res = await postInventarioTotal(modelo);
        setResultado(res);
    }, [modelo]);

    const cancelar_ = useCallback(() => publicar("inventario_total_cancelado"), [publicar]);

    const aceptarResultado_ = useCallback(() => {
        if (resultado) {
            publicar("inventario_total_creado", resultado.inventarioId);
        }
    }, [publicar, resultado]);

    const [crear, cancelar] = useForm(crear_, cancelar_);
    const [aceptarResultado] = useForm(aceptarResultado_, aceptarResultado_);
    const focus = useFocus();

    if (resultado) {
        return (
            <QModal
                abierto={true}
                nombre="resultadoInventarioTotal"
                titulo="Inventario total creado"
                onCerrar={aceptarResultado}
            >
                <p>
                    Inventario: <strong>{resultado.inventarioId}</strong>
                </p>
                <p>
                    Líneas generadas: <strong>{resultado.lineasCreadas}</strong>
                </p>
                {resultado.saltadosPorLotes > 0 && (
                    <p>
                        Omitidos por lotes: <strong>{resultado.saltadosPorLotes}</strong>
                    </p>
                )}
                <div className="botones maestro-botones">
                    <QBoton onClick={aceptarResultado}>Abrir inventario</QBoton>
                </div>
            </QModal>
        );
    }

    return (
        <QModal
            abierto={true}
            nombre="crearInventarioTotal"
            titulo="Inventario total (todos los stocks)"
            onCerrar={cancelar}
        >
            <quimera-formulario>
                <p>
                    Crea un inventario con una línea por cada artículo en stock del almacén (plugin
                    artículos compuestos).
                </p>
                <QInput label="Código inventario" {...uiProps("id")} ref={focus} />
                <Almacen {...uiProps("almacenId")} />
                <QInput label="Fecha" {...uiProps("fecha")} />
                <QInput label="Observaciones" {...uiProps("observaciones")} opcional />
            </quimera-formulario>
            <div className="botones maestro-botones">
                <QBoton onClick={crear} deshabilitado={!valido}>
                    Crear inventario total
                </QBoton>
            </div>
        </QModal>
    );
};
