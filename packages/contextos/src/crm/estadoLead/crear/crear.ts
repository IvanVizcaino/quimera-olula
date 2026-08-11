import { MetaModelo, stringNoVacio } from "@olula/lib/dominio.js";
import { EstadoLead } from "../diseño.ts";

export const metaNuevoEstadoLead: MetaModelo<EstadoLead> = {
    campos: {
        id: {
            requerido: true,
            validacion: (estado: EstadoLead) =>
                !stringNoVacio(estado.id)
                    ? "El código es obligatorio"
                    : estado.id.length > 10
                        ? "Máximo 10 caracteres"
                        : true,
        },
        descripcion: { requerido: true, validacion: (estado: EstadoLead) => stringNoVacio(estado.descripcion) },
    },
};

export const nuevoEstadoLeadVacio: EstadoLead = {
    id: '',
    descripcion: '',
    valorDefecto: false,
};