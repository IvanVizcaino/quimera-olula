import { QSelect, QSelectProps } from "@olula/componentes/atomos/qselect.tsx";
import { useEffect, useState } from "react";
import { getSubfamilias } from "../../subfamilia/infraestructura.ts";
import type { Subfamilia as SubfamiliaType } from "../../subfamilia/diseño.ts";

type SubfamiliaProps = Omit<QSelectProps, "opciones" | "label" | "nombre"> & {
    label?: string;
    nombre?: string;
    familiaId?: string;
};

type OpcionSubfamilia = { valor: string; descripcion: string };

const sinSubfamilia: OpcionSubfamilia = { valor: "", descripcion: "—" };

/**
 * Selector de subfamilia, filtrado por familia si se indica `familiaId`.
 * Solo disponible con el plugin `subfamilias` activo.
 */
export const SubfamiliaSelector = ({
    valor,
    nombre = "subfamilia_id",
    label = "Subfamilia",
    familiaId,
    onChange,
    ...props
}: SubfamiliaProps) => {
    const [opciones, setOpciones] = useState<OpcionSubfamilia[]>([sinSubfamilia]);

    useEffect(() => {
        const criteria = familiaId
            ? { filtro: [{ campo: "familia_id", op: "=", valor: familiaId }], orden: ["descripcion"], paginacion: { limite: 500, pagina: 1 } }
            : { filtro: [], orden: ["descripcion"], paginacion: { limite: 500, pagina: 1 } };

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        getSubfamilias(criteria as any).then(({ datos }) =>
            setOpciones([
                sinSubfamilia,
                ...datos.map((s: SubfamiliaType) => ({ valor: s.id, descripcion: `${s.id} - ${s.descripcion}` })),
            ])
        );
    }, [familiaId]);

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
