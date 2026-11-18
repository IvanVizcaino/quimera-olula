import { GrupoIvaNegocio } from "#/comun/componentes/grupo_iva_negocio.tsx";
import { PantallaConfig } from "#/comun/componentes/pantalla_config/PantallaConfig.tsx";
import { useConfig } from "#/comun/componentes/pantalla_config/useConfig.ts";
import { configEmpresaValida } from "../dominio.ts";
import { getConfigEmpresa, patchConfigEmpresa } from "../infraestructura.ts";

/**
 * Configuración de empresa: el grupo de IVA de negocio de los datos generales de
 * facturación del escritorio (`facturac_general`).
 */
export const ConfigEmpresa = () => {
    const { config, cambiar, cambiada, guardando, guardar } = useConfig(getConfigEmpresa, patchConfigEmpresa);

    if (!config) return null;

    return (
        <PantallaConfig
            titulo="Configuración de empresa"
            descripcion="Datos generales de facturación de la empresa."
            onGuardar={guardar}
            cambiada={cambiada && configEmpresaValida(config)}
            guardando={guardando}
        >
            <section className="grupo-config">
                <h3>Impuestos</h3>
                <GrupoIvaNegocio
                    label="G.IVA Negocio"
                    nombre="grupo_iva_negocio_id"
                    valor={config.grupoIvaNegocioId}
                    onChange={(opcion) => cambiar("grupoIvaNegocioId", opcion?.valor ?? "")}
                />
            </section>
        </PantallaConfig>
    );
};
