import { Subcuenta } from "./diseño.ts";

export const etiquetaSubcuenta = (
    s: Pick<Subcuenta, "codigo" | "nombre">
): string => (s.nombre ? `${s.codigo} — ${s.nombre}` : s.codigo);

export const subcuentaVacia = (): Subcuenta => ({
    id: "",
    codigo: "",
    nombre: "",
    ejercicioId: "",
    cuentaId: 0,
    codigoCuenta: "",
    impuestoId: "",
    iva: 0,
    recargo: 0,
    cuentaEspecialId: "",
    esIva: false,
});
