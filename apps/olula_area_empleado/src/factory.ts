import { FactoryAuthOlula } from '#/auth/factory.ts';
import { FactoryRrhhEmpleadoOlula } from '#/rrhh_area_empleado/factory.ts';

export class FactoryAreaEmpleados {
    Auth = FactoryAuthOlula;
    Rrhh = FactoryRrhhEmpleadoOlula;
}
