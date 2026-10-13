import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QModal } from "@olula/componentes/index.js";
import { ContextoError } from "@olula/lib/contexto.ts";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { useContext, useState } from "react";
import { ValeEmitido } from "../diseño.ts";
import { anularVale } from "../infraestructura.ts";

/**
 * Modal para anular un vale con saldo.
 *
 * Según la spec (T7.6), el backend necesita un `venta_id` de una venta vacía
 * y un `punto_venta_id`. La venta la crea el backend internamente al anular
 * (o se pasa una existente). Aquí pedimos el `punto_venta_id` al usuario.
 *
 * El backend crea un pago en efectivo negativo por el saldo pendiente
 * (devuelve el dinero) y marca el vale como anulado.
 */
export const AnularVale = ({
    vale,
    publicar = async () => {},
}: {
    vale: ValeEmitido;
    publicar?: EmitirEvento;
}) => {
    const { intentar } = useContext(ContextoError);
    const [puntoVentaId, setPuntoVentaId] = useState(vale.puntoVentaId ?? "");

    const cancelar = () => publicar("anulacion_cancelada");

    const anular = async () => {
        if (!puntoVentaId) return;
        await intentar(() =>
            anularVale(vale.id, vale.ventaId, puntoVentaId)
        );
        publicar("vale_anulado", { ...vale, anulado: true });
    };

    return (
        <QModal
            abierto={true}
            nombre="anularVale"
            titulo="Anular vale"
            onCerrar={cancelar}
        >
            <div>
                <p>
                    Vale <strong>{vale.id}</strong> — Saldo pendiente:{" "}
                    <strong>{vale.saldoPendiente.toFixed(2)} €</strong>
                </p>
                <p>Se devolverá en efectivo el saldo pendiente y el vale quedará anulado.</p>
                <quimera-formulario>
                    <QInput
                        label="Punto de venta"
                        nombre="punto_venta_id"
                        valor={puntoVentaId}
                        onChange={(v) => setPuntoVentaId(v as string)}
                    />
                </quimera-formulario>
                <div className="botones">
                    <QBoton onClick={anular} deshabilitado={!puntoVentaId} advertencia>
                        Anular vale
                    </QBoton>
                    <QBoton onClick={cancelar} variante="texto">
                        Cancelar
                    </QBoton>
                </div>
            </div>
        </QModal>
    );
};
