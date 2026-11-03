import { FactoryAuthOlula } from '#/auth/factory.ts';
import { FactoryTenancy } from '#/tenancy/factory.ts';
import { OlulaWordmark } from '@olula/componentes/tema/Olula.jsx';

class FactoryComponentesJornadasAdmin {
    static cabecera_logo = () => OlulaWordmark({ color: '#ffffff', bowlColor: '#ffffff', className: 'logo-app', style: {} });
}

export class FactoryJornadasAdmin {
    Componentes = FactoryComponentesJornadasAdmin;
    Auth = FactoryAuthOlula;
    Tenancy = FactoryTenancy;
}

export default FactoryJornadasAdmin;
