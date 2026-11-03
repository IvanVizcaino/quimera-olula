import { FactoryAuthOlula } from '#/auth/factory.ts';
import { FactoryRrhhOlula } from '#/rrhh/factory.ts';
import { FactoryRrhhEmpleadoOlula } from '#/rrhh_area_empleado/factory.ts';
import { FactoryTpvOlula } from '#/tpv/factory.ts';
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
    Auth = FactoryAuthOlula;
    TPV = FactoryTpvOlula;
    Almacen = FactoryAlmacenNad;
    Ventas = FactoryVentasNad;
    Rrhh = FactoryRrhhOlula;
    RrhhAreaEmpleado = FactoryRrhhEmpleadoOlula;
}

export default FactoryNadia;
