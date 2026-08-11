import { MetaModelo } from "@olula/lib/dominio.js";
import { NuevaDireccion } from "../diseño.ts";

export const metaNuevaDireccion: MetaModelo<NuevaDireccion> = {
    campos: {
        nombre_via: { requerido: true },
        ciudad: { requerido: true },
    }
};

export const nuevaDireccionVacia: NuevaDireccion = {
    nombre_via: '',
    tipo_via: '',
    numero: '',
    otros: '',
    cod_postal: '',
    ciudad: '',
    provincia: '',
    pais_id: '',
    apartado: '',
    telefono: '',
}
