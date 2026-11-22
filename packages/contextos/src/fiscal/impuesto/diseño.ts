import { Entidad, Modelo } from "@olula/lib/diseño.ts";

/** Sufijo de las columnas codsubcuenta<sufijo> de impuestos.mtd. */
export type SufijoSubcuenta =
    | "rep" | "sop" | "acr" | "deu" | "ivadevadue" | "ivarepspue" | "ivadedadue"
    | "ivasopspue" | "ivadeventue" | "ivasopimp" | "ivarepimp" | "ivarepexp"
    | "ivasopexe" | "ivarepexe" | "ivarepre" | "ivasopagra" | "ivarepesue"
    | "ivarepspim" | "ivasopspim";

export type CampoSubcuenta = `sc_${SufijoSubcuenta}`;

export type TipoBienes = "Corrientes" | "De Inversion" | "Servicios" | "No Deducible" | "No Sujeto";

/** Tabla `impuestos` (impuestos.ui); cada subcuenta en un campo `sc_<sufijo>`. */
export type DatosImpuesto = Modelo & {
    descripcion: string;
    iva: number;
    recargo: number;
    tipoBienes: TipoBienes;
} & Record<CampoSubcuenta, string>;

export type Impuesto = Entidad & DatosImpuesto & { id: string };

export type NuevoImpuesto = DatosImpuesto & { id: string };
