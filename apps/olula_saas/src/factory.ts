import { FactoryAuthOlula } from "#/auth/factory.ts";
import { ENLACE_REGISTRO_LANDING } from "#/saas_registro/landing/dominio.ts";
import { BandaSuscripcion } from "#/saas_suscripcion/aviso/BandaSuscripcion.tsx";
import { FactorySaasSuscripcion } from "#/saas_suscripcion/factory.ts";
import { FactoryOlula } from "../../olula/src/factory.ts";

const ComponentesOlula = new FactoryOlula().Componentes;

// La banda de aviso de la suscripción solo existe en Olula SaaS: se añade como punto de
// extensión (Componentes.banda_aviso, ver Plantilla.tsx) sin tocar la clase base de apps/olula.
class ComponentesSaas extends ComponentesOlula {
    static banda_aviso = BandaSuscripcion;
}

// El login de Olula SaaS ofrece crear una empresa; las demás apps no definen este enlace.
class AuthSaas extends FactoryAuthOlula {
    static enlace_registro = {
        pregunta: "¿Aún no tienes cuenta?",
        texto: "Crea tu empresa",
        url: ENLACE_REGISTRO_LANDING,
    };
}

/** El ERP de apps/olula más lo propio del SaaS (suscripción de la empresa). */
export class FactoryOlulaSaas extends FactoryOlula {
    Auth = AuthSaas;
    Componentes = ComponentesSaas;
    SaasSuscripcion = FactorySaasSuscripcion;
}
