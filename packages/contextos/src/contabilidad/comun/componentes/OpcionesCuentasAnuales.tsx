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
 * Los valores son los literales que guarda `co_i_cuentasanuales` en Eneboo,
 * que son con los que habla la API. No se traducen: cambiarlos rompería la
 * compatibilidad con los informes dados de alta desde el ERP de escritorio.
 */
const TIPOS_CUENTAS_ANUALES = [
    { valor: "Situacion", descripcion: "Situación" },
    { valor: "Perdidas y ganancias", descripcion: "Pérdidas y ganancias" },
    { valor: "Ingresos y gastos", descripcion: "Ingresos y gastos" },
];

const FORMATOS_CUENTAS_ANUALES = [
    { valor: "Normal", descripcion: "Normal" },
    { valor: "Abreviado", descripcion: "Abreviado" },
];

const NIVELES_DESGLOSE = [
    { valor: "No desglosar", descripcion: "No desglosar" },
    { valor: "Cuenta", descripcion: "Cuenta" },
    { valor: "Subcuenta", descripcion: "Subcuenta" },
];

export const TipoCuentasAnuales = ({
    valor,
    nombre = "tipo",
    label = "Tipo de informe",
    onChange,
    ...props
}: OpcionFijaProps) => (
    <QSelect
        label={label}
        nombre={nombre}
        valor={valor}
        onChange={onChange}
        opciones={TIPOS_CUENTAS_ANUALES}
        {...props}
    />
);

export const FormatoCuentasAnuales = ({
    valor,
    nombre = "formato",
    label = "Formato",
    onChange,
    ...props
}: OpcionFijaProps) => (
    <QSelect
        label={label}
        nombre={nombre}
        valor={valor}
        onChange={onChange}
        opciones={FORMATOS_CUENTAS_ANUALES}
        {...props}
    />
);

export const NivelDesgloseCuentasAnuales = ({
    valor,
    nombre = "nivelDesglose",
    label = "Desglose",
    onChange,
    ...props
}: OpcionFijaProps) => (
    <QSelect
        label={label}
        nombre={nombre}
        valor={valor}
        onChange={onChange}
        opciones={NIVELES_DESGLOSE}
        {...props}
    />
);
