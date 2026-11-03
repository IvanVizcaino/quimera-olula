import { OlulaWordmark } from '@olula/componentes/tema/Olula.jsx';
import { FactoryRrhhEmpleadoOlula } from '#/rrhh_area_empleado/factory.ts';

class FactoryComponentesJornadas {
    static cabecera_logo = () => OlulaWordmark({ color: '#ffffff', bowlColor: '#ffffff', className: 'logo-app', style: {} });
}

class FactoryAuthJornadas {
    static formato_login = "email";
}

export class FactoryJornadas {
    Componentes = FactoryComponentesJornadas;
    Auth = FactoryAuthJornadas;
    Rrhh = FactoryRrhhEmpleadoOlula;
}

export default FactoryJornadas;
