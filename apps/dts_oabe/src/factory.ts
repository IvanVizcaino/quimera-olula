import { FactoryAuthOlula } from '#/auth/factory.ts';
import { FactoryCrmOlula } from '#/crm/factory.ts';

export class FactoryDtsOabe {
    Inicio = { menu: { "Inicio": { url: "/", icono: "inicio" } } };
    Auth = FactoryAuthOlula;
    Crm = FactoryCrmOlula;
}

export default FactoryDtsOabe;
