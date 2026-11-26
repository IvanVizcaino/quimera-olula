import { MetaModelo } from "@olula/lib/dominio.ts";
import { CambiosLineaInventario, LineaInventario } from "../diseño.ts";

/** Longitud de `lecturasinvetariocsv.localizacion`. */
export const LONGITUD_UBICACION = 18;

export const metaCambiosLineaInventario: MetaModelo<CambiosLineaInventario> = {
    campos: {
        cantidad: {
            tipo: "decimal",
            requerido: true,
            validacion: (m) => m.cantidad >= 0 || "La cantidad debe ser mayor o igual que cero",
        },
        motivo: { requerido: false },
        ubicacion: {
            requerido: false,
            validacion: (m) =>
                (m.ubicacion ?? "").trim().length <= LONGITUD_UBICACION ||
                `La ubicación no puede tener más de ${LONGITUD_UBICACION} caracteres`,
        },
    },
};

/** Valores iniciales del modal de cambio: cantidad contada, motivo y ubicación de la línea. */
export const lineaACambios = (linea: LineaInventario): CambiosLineaInventario => ({
    cantidad: linea.cantidadFinal,
    motivo: linea.motivo ?? "",
    ubicacion: linea.ubicacion ?? "",
});

/**
 * Aviso del modal para una línea cargada de fichero: sus lecturas se
 * conservan y, si la cantidad cambia, el servidor añade una de ajuste.
 */
export const avisoLecturas = (lecturas: number): string =>
    `La línea viene de ${lecturas === 1 ? "1 lectura" : `${lecturas} lecturas`} de fichero, que se ` +
    "conservan: si cambia la cantidad, se añade una lectura de ajuste por la diferencia. " +
    "La ubicación se aplica a todas sus lecturas.";
