import { FactoryAuthOlula } from '#/auth/factory.ts';
import { OlulaWordmark } from '@olula/componentes/tema/Olula.jsx';
import { FactoryTpvDulceBebe } from './contextos/tpv/factory.ts';

class FactoryComponentesDulceBebe {
    static cabecera_logo = () => OlulaWordmark({ color: '#ffffff', bowlColor: '#ffffff', className: 'logo-app', style: {} });
}

export class FactoryDulceBebe {
    Auth = FactoryAuthOlula;
    Componentes = FactoryComponentesDulceBebe;
    TPV = FactoryTpvDulceBebe;
}

export default FactoryDulceBebe;
