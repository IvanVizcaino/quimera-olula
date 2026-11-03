import { Cuenta } from "./diseño.ts";

export const etiquetaCuenta = (c: Pick<Cuenta, "codigo" | "nombre">): string =>
    c.nombre ? `${c.codigo} — ${c.nombre}` : c.codigo;

export const cuentaVacia = (): Cuenta => ({
    id: "",
    codigo: "",
    nombre: "",
    ejercicioId: "",
    codigoEpigrafe: null,
    nivel: 0,
    cuentaEspecialId: "",
    esIva: false,
});
