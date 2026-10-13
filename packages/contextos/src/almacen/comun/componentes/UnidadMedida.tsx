import { QSelect, QSelectProps } from "@olula/componentes/atomos/qselect.tsx";
import { useEffect, useState } from "react";
import { getUnidadesMedida } from "../../pesosmedidas/infraestructura.ts";
import type { UnidadMedida as UnidadMedidaType } from "../../pesosmedidas/diseño.ts";

type UnidadMedidaProps = Omit<QSelectProps, "opciones" | "label" | "nombre"> & {
    label?: string;
    nombre?: string;
};

type OpcionUnidad = { valor: string; descripcion: string };

const sinUnidad: OpcionUnidad = { valor: "", descripcion: "—" };

/**
 * Selector de unidad de medida (`pesosmedidas`).
 * Solo disponible con el plugin `pesos_medidas` activo.
 */
export const UnidadMedidaSelector = ({
    valor,
    nombre = "unidad_id",
    label = "Unidad de medida",
    onChange,
    ...props
}: UnidadMedidaProps) => {
    const [opciones, setOpciones] = useState<OpcionUnidad[]>([sinUnidad]);

    useEffect(() => {
        const criteria = {
            filtro: [],
            orden: ["descripcion"],
            paginacion: { limite: 500, pagina: 1 },
        };

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        getUnidadesMedida(criteria as any).then(({ datos }) =>
            setOpciones([
                sinUnidad,
                ...datos.map((u: UnidadMedidaType) => ({
                    valor: u.id,
                    descripcion: `${u.id} - ${u.descripcion}`,
                })),
            ]),
        );
    }, []);

    return (
        <QSelect
            label={label}
            nombre={nombre}
            valor={valor ?? ""}
            onChange={onChange}
            opciones={opciones}
            {...props}
        />
    );
};
