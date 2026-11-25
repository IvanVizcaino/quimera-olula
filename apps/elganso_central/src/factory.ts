import { SelectorEmpresaActual } from '#/empresa/empresa/componentes/SelectorEmpresaActual.tsx';
import { OlulaWordmark } from '@olula/componentes/tema/Olula.jsx';
import { FactoryAlmacenCentral } from './contextos/almacen/factory.ts';
import { FactoryAuthCentral } from './contextos/auth/factory.ts';

class FactoryComponentesCentral {
    static cabecera_logo = () => OlulaWordmark({ color: '#ffffff', bowlColor: '#ffffff', className: 'logo-app', style: {} });
    static cabecera_acciones = SelectorEmpresaActual;
}

export class FactoryElGansoCentral {
    Componentes = FactoryComponentesCentral;
    Auth = FactoryAuthCentral;
    Almacen = FactoryAlmacenCentral;
}

export default FactoryElGansoCentral;
