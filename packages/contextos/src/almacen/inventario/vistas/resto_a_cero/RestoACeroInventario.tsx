import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QModal } from "@olula/componentes/index.ts";
import { QModalConfirmacion } from "@olula/componentes/moleculas/qmodalconfirmacion.tsx";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { useForm } from "@olula/lib/useForm.ts";
import { useCallback, useState } from "react";
import { Inventario, ResultadoRestoACeroInventario } from "../../diseño.ts";
import { patchRestoACeroInventario } from "../../infraestructura.ts";

export const RestoACeroInventario = ({
    inventario,
    publicar,
}: {
    inventario: Inventario;
    publicar: EmitirEvento;
}) => {
    const [resultado, setResultado] = useState<ResultadoRestoACeroInventario | null>(null);

    const ejecutar_ = useCallback(async () => {
        const res = await patchRestoACeroInventario(inventario.id);
        setResultado(res);
    }, [inventario.id]);

    const cancelar_ = useCallback(() => publicar("resto_a_cero_cancelado"), [publicar]);

    const cerrarResultado_ = useCallback(() => {
        if (resultado) {
            publicar("resto_a_cero_completado", resultado);
        }
    }, [publicar, resultado]);

    const [ejecutar, cancelar] = useForm(ejecutar_, cancelar_);
    const [cerrarResultado] = useForm(cerrarResultado_, cerrarResultado_);

    if (resultado) {
        return (
            <QModal
                abierto={true}
                nombre="resultadoRestoACeroInventario"
                titulo="Resto a cero"
                onCerrar={cerrarResultado}
            >
                <p>
                    Líneas creadas con cantidad 0: <strong>{resultado.lineasCreadas}</strong>
                </p>
                {resultado.saltadosPorLotes > 0 && (
                    <p>
                        Artículos por lotes omitidos (trazabilidad):{" "}
                        <strong>{resultado.saltadosPorLotes}</strong>
                    </p>
                )}
                <div className="botones maestro-botones">
                    <QBoton onClick={cerrarResultado}>Cerrar</QBoton>
                </div>
            </QModal>
        );
    }

    return (
        <QModalConfirmacion
            nombre="confirmarRestoACeroInventario"
            abierto={true}
            titulo="Añadir resto a cero"
            mensaje={`¿Crear líneas con recuento 0 para los artículos del almacén "${inventario.almacenId}" que aún no están en este inventario? Los artículos por lotes se omitirán si la trazabilidad está activa.`}
            onCerrar={cancelar}
            onAceptar={ejecutar}
        />
    );
};
