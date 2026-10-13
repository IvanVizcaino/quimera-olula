import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QModal } from "@olula/componentes/index.ts";
import { QModalConfirmacion } from "@olula/componentes/moleculas/qmodalconfirmacion.tsx";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { useForm } from "@olula/lib/useForm.ts";
import { useCallback, useState } from "react";
import { Inventario, ResultadoRegularizacionInventario } from "../../diseño.ts";
import { patchRegularizarInventario } from "../../infraestructura.ts";

export const RegularizarInventario = ({
    inventario,
    publicar,
}: {
    inventario: Inventario;
    publicar: EmitirEvento;
}) => {
    const [resultado, setResultado] = useState<ResultadoRegularizacionInventario | null>(null);

    const regularizar_ = useCallback(async () => {
        const res = await patchRegularizarInventario(inventario.id);
        setResultado(res);
    }, [inventario.id]);

    const cancelar_ = useCallback(() => publicar("regularizacion_cancelada"), [publicar]);

    const cerrarResultado_ = useCallback(() => {
        if (resultado) {
            publicar("regularizacion_completada", resultado);
        }
    }, [publicar, resultado]);

    const [regularizar, cancelar] = useForm(regularizar_, cancelar_);
    const [cerrarResultado] = useForm(cerrarResultado_, cerrarResultado_);

    if (resultado) {
        return (
            <QModal
                abierto={true}
                nombre="resultadoRegularizarInventario"
                titulo="Regularización completada"
                onCerrar={cerrarResultado}
            >
                <p>
                    Movimientos de stock creados: <strong>{resultado.movistocks.length}</strong>
                </p>
                {resultado.saltados.length > 0 && (
                    <>
                        <p>Artículos no regularizados (p. ej. por lotes con trazabilidad):</p>
                        <ul>
                            {resultado.saltados.map((s) => (
                                <li key={`${s.stockId}-${s.referencia}`}>
                                    {s.referencia}: {s.motivo}
                                </li>
                            ))}
                        </ul>
                    </>
                )}
                <div className="botones maestro-botones">
                    <QBoton onClick={cerrarResultado}>Cerrar</QBoton>
                </div>
            </QModal>
        );
    }

    return (
        <QModalConfirmacion
            nombre="confirmarRegularizarInventario"
            abierto={true}
            titulo="Regularizar inventario"
            mensaje={`¿Regularizar el stock según las líneas del inventario "${inventario.id}"? Se crearán movimientos de regularización para las diferencias.`}
            onCerrar={cancelar}
            onAceptar={regularizar}
        />
    );
};
