import { PaginaModulos } from "./modulos/PaginaModulos.tsx";
import { PaginaSuscripcion } from "./pagina/PaginaSuscripcion.tsx";

export class RouterFactorySaasSuscripcion {
    static router = {
        "ajustes/suscripcion": PaginaSuscripcion,
        "ajustes/modulos": PaginaModulos,
    };
}
