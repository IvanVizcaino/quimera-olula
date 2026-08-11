import { FactoryAuthOlula } from '#/auth/factory.ts';
import { FactoryVentasNrj } from './contextos/ventas/factory.ts';


export class FactoryNrj {
    Ventas = FactoryVentasNrj;
    Auth = FactoryAuthOlula;
}

export default FactoryNrj;