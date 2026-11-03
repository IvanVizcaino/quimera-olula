import { MetaModelo } from "@olula/lib/dominio.js";
import { NuevoAgente } from "../diseño.js";

export const metaNuevoAgente: MetaModelo<NuevoAgente> = {
    campos: {
        nombre_pila: { requerido: true },
        apellidos: { requerido: true },
        id_fiscal: { requerido: true },
        por_comision: { requerido: true, tipo: "decimal", decimales: 2 },
        telefono: { requerido: false, tipo: "telefono" },
        email: { requerido: false, tipo: "email" },
        direccion: { requerido: false },
        ciudad: { requerido: false },
        codpostal: { requerido: false },
        provincia: { requerido: false },
    },
};

export const nuevoAgenteInicial = (): NuevoAgente => ({
    nombre_pila: "",
    apellidos: "",
    id_fiscal: "",
    por_comision: 0,
    telefono: null,
    email: null,
    direccion: null,
    ciudad: null,
    codpostal: null,
    provincia: null,
});
