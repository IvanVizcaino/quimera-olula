import { MetaModelo, stringNoVacio } from "@olula/lib/dominio.js";
import { FuenteLead } from "../diseño.ts";

export const metaNuevaFuenteLead: MetaModelo<FuenteLead> = {
    campos: {
        id: {
            requerido: true,
            validacion: (fuente: FuenteLead) =>
                !stringNoVacio(fuente.id)
                    ? "El código es obligatorio"
                    : fuente.id.length > 20
                        ? "Máximo 20 caracteres"
                        : true,
        },
        descripcion: { requerido: true, validacion: (fuente: FuenteLead) => stringNoVacio(fuente.descripcion) },
    },
};

export const nuevaFuenteLeadVacia: FuenteLead = {
    id: '',
    descripcion: '',
    valorDefecto: false,
};