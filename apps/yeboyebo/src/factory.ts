import { FactoryAuthOlula } from '#/auth/factory.ts';
import { FactoryRrhhOlula } from '#/rrhh/factory.ts';
import { FactoryRrhhEmpleadoOlula } from '#/rrhh_area_empleado/factory.ts';

export class FactoryYeboyebo {
    Inicio = { menu: { "Inicio": { url: "/", icono: "inicio" } } };
    Auth = FactoryAuthOlula;
    Rrhh = FactoryRrhhOlula;
    RrhhAreaEmpleado = FactoryRrhhEmpleadoOlula;
}

export default FactoryYeboyebo;
