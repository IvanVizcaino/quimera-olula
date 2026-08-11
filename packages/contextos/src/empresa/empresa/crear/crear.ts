import { MetaModelo } from "@olula/lib/dominio.js";
import { NuevaEmpresa } from "../diseño.js";

export const metaNuevaEmpresa: MetaModelo<NuevaEmpresa> = {
    campos: {
        nombre: { requerido: true, minimo: 2 },
        cifNif: { requerido: true },
        administrador: { requerido: true },
        ejercicioId: { requerido: true },
    },
};

export const nuevaEmpresaInicial = (): NuevaEmpresa => ({
    nombre: "",
    cifNif: "",
    administrador: "",
    ejercicioId: "",
    telefono: "",
    email: "",
    web: "",
    serieId: "",
    formaPagoId: "",
    divisaId: "",
    almacenId: "",

    tipoVia: "",
    nombreVia: "",
    numero: "",
    otros: "",
    codPostal: "",
    ciudad: "",
    provinciaId: 0,
    provincia: "",
    paisId: "",
    apartado: "",
    telefonoDireccion: "",
});
