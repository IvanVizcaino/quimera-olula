import { MaestroConDetalleClienteTenant } from "./clientes_tenant/maestro/MaestroConDetalleClienteTenant.js";
import { MaestroConDetalleUsuarioTenant } from "./usuarios_tenant/maestro/MaestroConDetalleUsuarioTenant.js";

export class RouterFactoryTenancy {
    static router = {
        "admin/clientes_tenant": MaestroConDetalleClienteTenant,
        "admin/usuarios_tenant": MaestroConDetalleUsuarioTenant,
    };
}
