import { getTpvConfig } from "#/tpv/comun/dominio.ts";
import { QRadio, QRadioProps } from "@olula/componentes/index.js";
import { useEffect, useState } from "react";

type TipoTarjetaProps = Omit<QRadioProps, "opciones" | "label" | "nombre"> & {
    label?: string;
    nombre?: string;
};

export const TipoTarjetaTpv = ({
    valor,
    nombre = "tipo_tarjeta",
    label = "Tipo de tarjeta",
    onChange,
    ...props
}: TipoTarjetaProps) => {
    const [opciones, setOpciones] = useState<{ valor: string; descripcion: string }[]>([]);
    const [valorDefecto, setValorDefecto] = useState<string>("");

    useEffect(() => {
        const cargar = async () => {
            const config = await getTpvConfig();
            setOpciones(
                config.tiposTarjeta.map((t) => ({
                    valor: t.id,
                    descripcion: t.nombre,
                }))
            );
            const porDefecto = config.tiposTarjeta.find((t) => t.defecto);
            if (porDefecto) {
                setValorDefecto(porDefecto.id);
            }
        };
        cargar();
    }, []);

    return (
        <QRadio
            label={label}
            nombre={nombre}
            valor={valor || valorDefecto}
            onChange={onChange}
            opciones={opciones}
            {...props}
        />
    );
};
