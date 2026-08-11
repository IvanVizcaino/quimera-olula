import { MaestroConDetalleCuentaBancaria } from "./cuentas_bancarias/maestro/MaestroConDetalleCuentaBancaria.tsx";
import { MaestroConDetalleEmpresa } from "./empresa/maestro/MaestroConDetalleEmpresa.tsx";

export class RouterFactoryEmpresaOlula {
    static router = {
        "empresa/empresa": MaestroConDetalleEmpresa,
        "empresa/empresa/:id": MaestroConDetalleEmpresa,
        "empresa/cuentas_bancarias": MaestroConDetalleCuentaBancaria,
        "empresa/cuentas_bancarias/:id": MaestroConDetalleCuentaBancaria,
    }
}
