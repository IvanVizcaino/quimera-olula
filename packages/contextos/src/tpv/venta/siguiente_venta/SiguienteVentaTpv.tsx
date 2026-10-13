import { OpcionesTpv } from "#/tpv/config/diseño.ts";
import { LineaFactura, VentaTpv } from "#/tpv/venta/diseño.ts";
import { PasoSiguienteVenta, pasoTrasRegalo } from "#/tpv/venta/impresion.ts";
import { QModalConfirmacion } from "@olula/componentes/moleculas/qmodalconfirmacion.tsx";
import { useEffect, useRef, useState } from "react";
import { TiqueRegaloVentaTpv } from "../tique_regalo/TiqueRegaloVentaTpv.tsx";

type Paso = NonNullable<PasoSiguienteVenta> | "REGALO_SELECCION";

// Flujo tras cobrar o emitir un vale cuando `pasar_siguiente_venta_auto` está activo:
// pregunta por el tique regalo (según `ticket_regalo`), pide confirmación
// (`confirmar_siguiente_venta`) y pasa a la siguiente venta.
export const SiguienteVentaTpv = ({
    venta,
    lineas,
    opciones,
    pasoInicial,
    onPasar,
    onCancelar,
}: {
    venta: VentaTpv;
    lineas: LineaFactura[];
    opciones: OpcionesTpv;
    pasoInicial: NonNullable<PasoSiguienteVenta>;
    onPasar: () => void;
    onCancelar: () => void;
}) => {
    const [paso, setPaso] = useState<Paso>(pasoInicial);
    const pasado = useRef(false);

    useEffect(() => {
        if (paso === "PASAR" && !pasado.current) {
            pasado.current = true;
            onPasar();
        }
    }, [paso, onPasar]);

    const trasRegalo = () => setPaso(pasoTrasRegalo(opciones) as Paso);

    if (paso === "REGALO") {
        return (
            <QModalConfirmacion
                nombre="preguntaTiqueRegalo"
                abierto={true}
                titulo="Tique regalo"
                // Textos literales de Eneboo: oficial (bucle) y Crema (una vez)
                mensaje={
                    opciones.ticketRegalo === "preguntar_en_bucle"
                        ? "¿Desea imprimir el ticket regalo?"
                        : "¿Desea imprimir el ticket de regalo?"
                }
                onCerrar={trasRegalo}
                onAceptar={() => setPaso("REGALO_SELECCION")}
            />
        );
    }

    if (paso === "REGALO_SELECCION") {
        return (
            <TiqueRegaloVentaTpv
                venta={venta}
                lineas={lineas}
                publicar={async () => {
                    if (opciones.ticketRegalo === "preguntar_en_bucle") setPaso("REGALO");
                    else trasRegalo();
                }}
            />
        );
    }

    if (paso === "CONFIRMAR") {
        return (
            <QModalConfirmacion
                nombre="siguienteVenta"
                abierto={true}
                titulo="Venta realizada"
                mensaje={"Venta realizada.\nPulse aceptar para pasar a la siguiente"}
                onCerrar={onCancelar}
                onAceptar={() => setPaso("PASAR")}
            />
        );
    }

    return null;
};
