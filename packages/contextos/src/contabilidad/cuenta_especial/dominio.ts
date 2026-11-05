import { CuentaEspecial } from "./diseño.ts";

export const etiquetaCuentaEspecial = (
    c: Pick<CuentaEspecial, "id" | "descripcion">
): string => (c.descripcion ? `${c.id} — ${c.descripcion}` : c.id);

export const cuentaEspecialVacia = (): CuentaEspecial => ({
    id: "",
    descripcion: "",
    codigoCuenta: "",
    codigoSubcuenta: "",
});
