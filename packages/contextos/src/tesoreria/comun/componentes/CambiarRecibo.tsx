import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QSelect } from "@olula/componentes/atomos/qselect.tsx";
import { QDate, QInput, QModal } from "@olula/componentes/index.js";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { MetaModelo } from "@olula/lib/dominio.js";
import { useModelo } from "@olula/lib/useModelo.js";
import { useEffect, useMemo, useState } from "react";

import { CambiosRecibo } from "../recibo.ts";

export type ReciboEditable = {
    codigo: string;
    estado: string;
    importe: number;
    fechaEmision: Date | null;
    fechaVencimiento: Date | null;
    cuentaDomiciliacionId: string | null;
    /** Recibo de factura, no agrupado: solo esos admiten bajar el importe. */
    importeEditable: boolean;
};

type Opcion = { valor: string; descripcion: string };

const metaCambios = (recibo: ReciboEditable): MetaModelo<CambiosRecibo> => ({
    campos: {
        fecha_vencimiento: {
            tipo: "fecha",
            requerido: true,
            validacion: (m) =>
                !recibo.fechaEmision || m.fecha_vencimiento >= recibo.fechaEmision
                    ? true
                    : "La fecha de vencimiento debe ser igual o posterior a la de emisión",
        },
        cuenta_domiciliacion_id: {},
        importe: {
            tipo: "moneda",
            requerido: true,
            validacion: (m) =>
                m.importe === recibo.importe || (m.importe > 0 && m.importe < recibo.importe)
                    ? true
                    : "Solo se puede bajar el importe: la diferencia pasa a un recibo nuevo",
        },
    },
    editable: (_, campo) => campo !== "importe" || recibo.importeEditable,
});

/**
 * TES-06: edita vencimiento, cuenta de domiciliación (una de las cuentas
 * bancarias del cliente o proveedor) e importe del recibo. Publica
 * `cambio_recibo_confirmado` con los cambios o `cambio_recibo_cancelado`.
 */
export const CambiarRecibo = ({
    recibo,
    getCuentas,
    publicar,
}: {
    recibo: ReciboEditable;
    getCuentas: () => Promise<Opcion[]>;
    publicar: EmitirEvento;
}) => {
    const [cuentas, setCuentas] = useState<Opcion[]>([]);

    useEffect(() => {
        getCuentas().then(setCuentas).catch(() => setCuentas([]));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const meta = useMemo(() => metaCambios(recibo), [recibo]);
    const inicial = useMemo(
        (): CambiosRecibo => ({
            fecha_vencimiento: recibo.fechaVencimiento ?? new Date(),
            cuenta_domiciliacion_id: recibo.cuentaDomiciliacionId ?? "",
            importe: recibo.importe,
        }),
        [recibo]
    );

    const { modelo, uiProps, valido } = useModelo(meta, inicial);

    const guardar = async () => {
        await publicar("cambio_recibo_confirmado", { ...modelo });
    };

    return (
        <QModal
            abierto={true}
            nombre="cambiar_recibo"
            titulo={`Editar recibo ${recibo.codigo}`}
            onCerrar={() => publicar("cambio_recibo_cancelado")}
        >
            <div className="CambiarRecibo">
                <quimera-formulario>
                    <QDate label="Fecha de vencimiento" {...uiProps("fecha_vencimiento")} />
                    <QSelect
                        label="Cuenta de domiciliación"
                        {...uiProps("cuenta_domiciliacion_id")}
                        opciones={[{ valor: "", descripcion: "(sin cuenta)" }, ...cuentas]}
                    />
                    <QInput label="Importe" {...uiProps("importe")} />
                </quimera-formulario>
                <div className="botones maestro-botones">
                    <QBoton onClick={guardar} deshabilitado={!valido}>
                        Guardar
                    </QBoton>
                </div>
            </div>
        </QModal>
    );
};
