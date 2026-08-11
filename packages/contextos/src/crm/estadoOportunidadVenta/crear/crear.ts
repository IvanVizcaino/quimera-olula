import { MetaModelo, stringNoVacio } from "@olula/lib/dominio.js";
import { NuevoEstadoOportunidad } from "./diseño.ts";

export const metaNuevoEstadoOportunidad: MetaModelo<NuevoEstadoOportunidad> = {
    campos: {
        id: {
            requerido: true,
            validacion: (estado: NuevoEstadoOportunidad) =>
                !stringNoVacio(estado.id)
                    ? "El código es obligatorio"
                    : estado.id.length > 10
                        ? "Máximo 10 caracteres"
                        : true,
        },
        descripcion: { requerido: true, validacion: (estado: NuevoEstadoOportunidad) => stringNoVacio(estado.descripcion) },
        probabilidad: { requerido: true, tipo: "numero" },
    },
};

export const nuevoEstadoOportunidadVacio: NuevoEstadoOportunidad = {
    id: '',
    descripcion: '',
    probabilidad: 0,
    valorDefecto: false,
};