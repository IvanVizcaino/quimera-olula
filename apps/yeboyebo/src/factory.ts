import { FactoryAuthOlula } from '#/auth/factory.ts';
import { FactoryProyectosOlula } from '#/proyectos/factory.ts';
import { FactoryRrhhOlula } from '#/rrhh/factory.ts';
import { FactoryRrhhEmpleadoOlula } from '#/rrhh_area_empleado/factory.ts';
import { FactoryTesoreriaOlula } from '#/tesoreria/factory.ts';

export class FactoryYeboyebo {
    Inicio = { menu: { "Inicio": { url: "/", icono: "inicio" } } };
    Auth = FactoryAuthOlula;
    Rrhh = FactoryRrhhOlula;
    RrhhAreaEmpleado = FactoryRrhhEmpleadoOlula;
    Proyectos = FactoryProyectosOlula;
    Tesoreria = FactoryTesoreriaOlula;
}

export default FactoryYeboyebo;
