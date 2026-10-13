import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QModal } from "@olula/componentes/index.js";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useMemo } from "react";
import { VentaTpv } from "../diseño.ts";
import { CambiarTotalVenta } from "./diseño.ts";
import { cambiarTotalVentaVacio, metaCambiarTotalVenta } from "./dominio.ts";

interface CambiarTotalVentaTpvProps {
    publicar: EmitirEvento;
    venta: VentaTpv;
}

export const CambiarTotalVentaTpv = ({
    publicar,
    venta,
}: CambiarTotalVentaTpvProps) => {
    const totalInicial = useMemo(
        () => ({ ...cambiarTotalVentaVacio, total: venta.total }),
        [venta]
    );

    const { modelo, uiProps, valido, init } = useModelo(
        metaCambiarTotalVenta,
        totalInicial
    );

    const guardar = async () => {
        const cambio: CambiarTotalVenta = { total: modelo.total };
        await publicar("total_aplicado", cambio);
        init(totalInicial);
    };

    const cancelar = () => {
        publicar("cambio_total_cancelado");
        init(totalInicial);
    };

    return (
        <QModal
            abierto={true}
            nombre="cambiar_total_venta"
            titulo="Cambiar total"
            onCerrar={cancelar}
        >
            <div className="CambiarTotalVentaTpv">
                <quimera-formulario>
                    <QInput label="Total (€)" {...uiProps("total")} />
                </quimera-formulario>
                <div className="botones maestro-botones">
                    <QBoton onClick={guardar} deshabilitado={!valido}>
                        Aplicar
                    </QBoton>
                </div>
            </div>
        </QModal>
    );
};
