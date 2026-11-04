import { MetaModelo, stringNoVacio } from "@olula/lib/dominio.ts";
import { NuevaLineaInventario } from "../../diseño.ts";

export const metaNuevaLineaInventario: MetaModelo<NuevaLineaInventario> = {
    campos: {
        articuloId: { requerido: true, validacion: (m) => stringNoVacio(m.articuloId) },
        cantidad: {
            tipo: "decimal",
            requerido: true,
            validacion: (m) => m.cantidad >= 0 || "La cantidad debe ser mayor o igual que cero",
        },
        motivo: { requerido: false },
    },
};

export const nuevaLineaInventarioVacia = (): NuevaLineaInventario => ({
    articuloId: "",
    cantidad: 0,
    motivo: "",
});
