import { MetaModelo, stringNoVacio } from "@olula/lib/dominio.ts";
import { NuevoInventario } from "../../diseño.ts";

export const metaNuevoInventario: MetaModelo<NuevoInventario> = {
    campos: {
        almacenId: { requerido: true, validacion: (m) => stringNoVacio(m.almacenId) },
        fecha: { tipo: "fecha", requerido: true },
        hora: { tipo: "hora", requerido: true },
        observaciones: { requerido: false },
    },
};

const horaActual = (): string => new Date().toTimeString().slice(0, 8);

export const nuevoInventarioInicial = (): NuevoInventario => ({
    almacenId: "",
    fecha: new Date(),
    hora: horaActual(),
    observaciones: "",
});
