import { QSelect } from "@olula/componentes/index.js";
import { QAutocompletarProps } from "@olula/componentes/moleculas/qautocompletar.tsx";

type TipoDocumentoAsientoProps = Omit<
    QAutocompletarProps,
    "obtenerOpciones" | "label" | "nombre"
> & {
    label?: string;
    nombre?: string;
};

/**
 * Los valores son los literales que guarda `co_asientos.tipodocumento`, que es
 * con los que habla la API. La primera opción, vacía, es el asiento sin
 * documento de origen: el caso normal de un asiento manual.
 */
const TIPOS_DOCUMENTO_ASIENTO = [
    { valor: "", descripcion: "Sin documento" },
    { valor: "Factura de cliente", descripcion: "Factura de cliente" },
    { valor: "Factura de proveedor", descripcion: "Factura de proveedor" },
    { valor: "Recibo de cliente", descripcion: "Recibo de cliente" },
    { valor: "Recibo de proveedor", descripcion: "Recibo de proveedor" },
    { valor: "Arqueo TPV", descripcion: "Arqueo TPV" },
];

export const TipoDocumentoAsiento = ({
    valor,
    nombre = "tipoDocumento",
    label = "Tipo de documento",
    onChange,
    ...props
}: TipoDocumentoAsientoProps) => {
    return (
        <QSelect
            label={label}
            nombre={nombre}
            valor={valor}
            onChange={onChange}
            opciones={TIPOS_DOCUMENTO_ASIENTO}
            {...props}
        />
    );
};
