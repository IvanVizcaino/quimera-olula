import { MetaModelo } from "@olula/lib/dominio.ts";
import {
    DatosGrupoContableAmortizacion,
    GrupoContableAmortizacion,
    NuevoGrupoContableAmortizacion,
    RolSubcuentaGrupo,
} from "./diseño.ts";

/** Longitudes de `co_gruposcontablesamo.mtd`. */
export const LONGITUD_CODIGO = 10;
export const LONGITUD_DESCRIPCION = 100;
export const LONGITUD_SUBCUENTA = 15;

export const ROLES_SUBCUENTA: {
    rol: RolSubcuentaGrupo;
    campo: keyof DatosGrupoContableAmortizacion;
    etiqueta: string;
}[] = [
    { rol: "elemento", campo: "subcuentaElemento", etiqueta: "Subcuenta de elemento" },
    { rol: "amortizacion", campo: "subcuentaAmortizacion", etiqueta: "Subcuenta de amortización acumulada" },
    { rol: "gasto", campo: "subcuentaGasto", etiqueta: "Subcuenta de gasto (dotación)" },
    { rol: "perdidas", campo: "subcuentaPerdidas", etiqueta: "Subcuenta de pérdidas" },
    { rol: "ganancias", campo: "subcuentaGanancias", etiqueta: "Subcuenta de ganancias" },
];

export const descripcionesVacias = (): Record<RolSubcuentaGrupo, string> => ({
    elemento: "",
    amortizacion: "",
    gasto: "",
    perdidas: "",
    ganancias: "",
});

export const grupoContableAmortizacionVacio = (): GrupoContableAmortizacion => ({
    id: "",
    descripcion: "",
    subcuentaElemento: "",
    subcuentaAmortizacion: "",
    subcuentaGasto: "",
    subcuentaPerdidas: "",
    subcuentaGanancias: "",
    descripcionesSubcuentas: descripcionesVacias(),
});

export const nuevoGrupoContableAmortizacionVacio = (): NuevoGrupoContableAmortizacion => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { descripcionesSubcuentas, ...datos } = grupoContableAmortizacionVacio();
    return datos;
};

export const etiquetaGrupoContableAmortizacion = (g: GrupoContableAmortizacion): string =>
    g.descripcion ? `${g.id} — ${g.descripcion}` : g.id;

const camposSubcuenta = Object.fromEntries(
    ROLES_SUBCUENTA.map(({ campo }) => [campo, { requerido: true, maximo: LONGITUD_SUBCUENTA }])
);

export const metaGrupoContableAmortizacion: MetaModelo<GrupoContableAmortizacion> = {
    campos: {
        descripcion: { requerido: false, maximo: LONGITUD_DESCRIPCION },
        ...camposSubcuenta,
    },
};

export const metaNuevoGrupoContableAmortizacion: MetaModelo<NuevoGrupoContableAmortizacion> = {
    campos: {
        id: { requerido: true, maximo: LONGITUD_CODIGO },
        descripcion: { requerido: false, maximo: LONGITUD_DESCRIPCION },
        ...camposSubcuenta,
    },
};
