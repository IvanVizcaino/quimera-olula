import { getPuntosVentaTpv } from "#/tpv/punto_de_venta/infraestructura.ts";
import { PuntoVentaTpv as TipoPuntoVentaTpv } from "#/tpv/punto_de_venta/diseño.ts";
import { QSelect } from "@olula/componentes/index.js";
import { Criteria } from "@olula/lib/diseño.js";
import { useEffect, useState } from "react";

interface ArticuloProps {
    valor: string;
    nombre?: string;
    label?: string;
    opcional?: boolean;
    ref?: React.RefObject<HTMLSelectElement | null>;
    onChange: (opcion: { valor: string; descripcion: string } | null) => void;
}

type OpcionPuntoVenta = {
    valor: string;
    descripcion: string;
    punto: TipoPuntoVentaTpv
}

export const PuntoVentaTpv = ({
    valor,
    nombre = "punto_venta_tpv",
    label = "Punto de venta",
    onChange,
    ...props
}: ArticuloProps) => {

    const [agentes, setAgentes] = useState<OpcionPuntoVenta[]>([]);

    useEffect(() => {
        const obtenerOpciones = async () => {
            const criteria: Criteria = {
                filtro: [],
                orden: ["nombre"],
                paginacion: { limite: 1000, pagina: 1 },
            };

            const puntos_ = await getPuntosVentaTpv(criteria);

            setAgentes(
                puntos_.datos.map((punto) => ({
                    valor: punto.id,
                    descripcion: punto.nombre,
                    punto: punto,
                }))
            );
        };
        obtenerOpciones();
    }, []);

    return  (
        <QSelect
            label={label}
            nombre={nombre}
            valor={valor}
            onChange={onChange}
            opciones={agentes}
            {...props}
        />
    )
};
