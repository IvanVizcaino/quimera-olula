import { QSelect } from "@olula/componentes/index.js";
import { QAutocompletarProps } from "@olula/componentes/moleculas/qautocompletar.tsx";

type OpcionFijaProps = Omit<
    QAutocompletarProps,
    "obtenerOpciones" | "label" | "nombre"
> & {
    label?: string;
    nombre?: string;
};

/**
 * Los valores son los literales que guarda `co_i_diario` en Eneboo, que son
 * con los que habla la API. No se traducen: cambiarlos rompería la
 * compatibilidad con los informes dados de alta desde el ERP de escritorio.
 */
const CRITERIOS_ORDEN = [
    { valor: "No ordenar", descripcion: "No ordenar" },
    { valor: "Asiento", descripcion: "Asiento" },
    { valor: "Fecha", descripcion: "Fecha" },
    { valor: "Subcuenta", descripcion: "Subcuenta" },
];

const SENTIDOS_ORDEN = [
    { valor: "Ascendente", descripcion: "Ascendente" },
    { valor: "Descendente", descripcion: "Descendente" },
];

export const CriterioOrdenInforme = ({
    valor,
    nombre = "orden1",
    label = "Criterio",
    onChange,
    ...props
}: OpcionFijaProps) => (
    <QSelect
        label={label}
        nombre={nombre}
        valor={valor}
        onChange={onChange}
        opciones={CRITERIOS_ORDEN}
        {...props}
    />
);

export const SentidoOrdenInforme = ({
    valor,
    nombre = "tipoOrden1",
    label = "Orden",
    onChange,
    ...props
}: OpcionFijaProps) => (
    <QSelect
        label={label}
        nombre={nombre}
        valor={valor}
        onChange={onChange}
        opciones={SENTIDOS_ORDEN}
        {...props}
    />
);
