import { ConfigEmpresa } from "./config/vistas/ConfigEmpresa.tsx";
import { MaestroConDetalleEmpresa } from "./empresa/maestro/MaestroConDetalleEmpresa.tsx";

export class RouterFactoryEmpresaOlula {
    static router = {
        "empresa/config": ConfigEmpresa,
        "empresa/empresa": MaestroConDetalleEmpresa,
    }
}
