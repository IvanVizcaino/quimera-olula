import { AccionesCabeceraMonterelax } from "./componentes/AccionesCabeceraMonterelax.tsx";
import { FactoryVentasLegacy } from "./contextos/ventas/factory.ts";

class FactoryComponentesMonterelax {
    static cabecera_acciones = AccionesCabeceraMonterelax;
    static menu_lateral_plegado = "oculto";
}

class FactoryAuthMonterelax {
    static formato_login = "email";
}

export class FactoryLegacy {
    Auth = FactoryAuthMonterelax;
    Componentes = FactoryComponentesMonterelax;
    Ventas = FactoryVentasLegacy;
}

export default FactoryLegacy;
