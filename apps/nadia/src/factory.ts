import { FactoryAuthNadia } from './contextos/auth/factory.ts';
import { FactoryTpvNadia } from './contextos/tpv/factory.ts';
import { SelectorEmpresaActual } from '#/empresa/empresa/componentes/SelectorEmpresaActual.tsx';
import { OlulaWordmark } from '@olula/componentes/tema/Olula.jsx';
import { FactoryAlmacenNad } from './contextos/almacen/factory.ts';
import { FactoryVentasNad } from './contextos/ventas/factory.ts';

class FactoryComponentesNadia {
    static cabecera_logo = () => OlulaWordmark({ color: '#ffffff', bowlColor: '#ffffff', className: 'logo-app', style: {} });
    static cabecera_acciones = SelectorEmpresaActual;
}

export class FactoryNadia {
    Componentes = FactoryComponentesNadia;
    Auth = FactoryAuthNadia;
    TPV = FactoryTpvNadia;
    Almacen = FactoryAlmacenNad;
    Ventas = FactoryVentasNad;
}

export default FactoryNadia;
