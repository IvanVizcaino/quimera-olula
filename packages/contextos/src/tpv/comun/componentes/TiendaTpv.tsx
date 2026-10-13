import { TiendaTpv as TipoTiendaTpv } from "#/tpv/tienda/diseño.ts";
import { getTiendasTpv } from "#/tpv/tienda/infraestructura.ts";
import { QSelect, QSelectProps } from "@olula/componentes/index.js";
import { Criteria } from "@olula/lib/diseño.js";
import { useEffect, useState } from "react";

type TiendaProps = Omit<QSelectProps, "opciones">;

type OpcionTienda = {
    valor: string;
    descripcion: string;
    tienda: TipoTiendaTpv;
};

export const TiendaTpv = ({
    valor,
    nombre = "tienda_tpv",
    label = "Tienda",
    onChange,
    ...props
}: TiendaProps) => {
    const [tiendas, setTiendas] = useState<OpcionTienda[]>([]);

    useEffect(() => {
        const obtenerOpciones = async () => {
            const criteria: Criteria = {
                filtro: [],
                orden: ["nombre"],
                paginacion: { limite: 1000, pagina: 1 },
            };

            const tiendas_ = await getTiendasTpv(criteria);

            setTiendas(
                tiendas_.datos.map((tienda) => ({
                    valor: tienda.id,
                    descripcion: tienda.nombre,
                    tienda,
                })),
            );
        };
        obtenerOpciones();
    }, []);

    return (
        <QSelect
            label={label}
            nombre={nombre}
            valor={valor}
            onChange={onChange}
            opciones={tiendas}
            {...props}
        />
    );
};
