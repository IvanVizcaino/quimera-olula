import { FormRegenerarMovimientos, PeticionRegenerarMovimientos } from "./diseño.ts";

/** Textos literales de Eneboo (`articuloscomp_acRegeneraMovimientos`). */
export const MENSAJE_ALMACEN_NO_EXISTE = "El almacén no existe";
export const MENSAJE_SIN_FILTRO = "Debe indicar un filtro";

export const MENSAJE_CONFIRMAR_REGENERACION =
    "Se borrarán y volverán a generar los movimientos de stock de pedidos, albaranes y facturas de los artículos del filtro en el almacén indicado, y se revisarán sus stocks. El proceso puede tardar. ¿Desea continuar?";

export const formRegenerarVacio = (): FormRegenerarMovimientos => ({
    almacenId: "",
    articulos: [],
    familiaId: "",
});

/** Mismas validaciones y orden que Eneboo: primero almacén, luego filtro. */
export const validarRegeneracion = (form: FormRegenerarMovimientos): string | null => {
    if (!form.almacenId.trim()) return MENSAJE_ALMACEN_NO_EXISTE;
    if (form.articulos.length === 0 && !form.familiaId.trim()) return MENSAJE_SIN_FILTRO;
    return null;
};

export const peticionDesdeForm = (form: FormRegenerarMovimientos): PeticionRegenerarMovimientos => ({
    almacenId: form.almacenId.trim(),
    ...(form.articulos.length > 0 ? { articulos: form.articulos } : {}),
    ...(form.familiaId.trim() ? { familiaId: form.familiaId.trim() } : {}),
});

/** Añade una referencia al filtro sin duplicarla. */
export const anadirArticulo = (articulos: string[], referencia: string): string[] => {
    const ref = referencia.trim();
    return !ref || articulos.includes(ref) ? articulos : [...articulos, ref];
};
