import { pluginActivo } from "@olula/lib/plugins.tsx";
import { ArticuloDeLinea, ArticuloDeLineaConTipo, TipoArticuloLinea } from "./diseño.ts";

/**
 * T2.4 — Precisión de decimales para precios de compra.
 * Con el plugin `precision_compra` activo (args=4 en Crema), usa 4 decimales.
 * Se llama en los metaModelo de líneas de compra para que el form muestre la precisión correcta.
 */
export const decimalesPrecioCompra = (): number =>
    pluginActivo("precision_compra") ? 4 : 2;

export const getTipoArticulo = (linea: ArticuloDeLinea): TipoArticuloLinea =>
    linea.referencia
        ? linea.descripcion === linea.descripcionArticulo
            ? "registrado"
            : "generico"
        : "libre";

export const articuloDeLineaValido = (linea: ArticuloDeLineaConTipo): boolean => {
    switch (linea.tipoArticulo) {
        case "registrado":
            return !!linea.referencia;
        case "generico":
            return !!linea.referencia && !!linea.descripcion;
        case "libre":
            return !!linea.descripcion;
    }
};
