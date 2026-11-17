import { PantallaConfig } from "#/comun/componentes/pantalla_config/PantallaConfig.tsx";
import { useConfig } from "#/comun/componentes/pantalla_config/useConfig.ts";
import { QSelect } from "@olula/componentes/atomos/qselect.tsx";
import { ActualizarArticulosProveedor } from "../diseño.ts";
import { explicacionActualizarArticulosProveedor, opcionesActualizarArticulosProveedor } from "../dominio.ts";
import { getConfigCompras, patchConfigCompras } from "../infraestructura.ts";

/**
 * Configuración de compras: las opciones de compras de los datos generales de
 * facturación del escritorio (`facturac_general`).
 */
export const ConfigCompras = () => {
    const { config, cambiar, cambiada, guardando, guardar } = useConfig(getConfigCompras, patchConfigCompras);

    if (!config) return null;

    return (
        <PantallaConfig
            titulo="Configuración de compras"
            descripcion="Datos generales de facturación que afectan a las compras."
            onGuardar={guardar}
            cambiada={cambiada}
            guardando={guardando}
        >
            <section className="grupo-config">
                <h3>Artículos de proveedor</h3>
                <QSelect
                    label="Actualizar artículos de proveedor automáticamente desde"
                    nombre="actualizar_articulos_proveedor"
                    opciones={opcionesActualizarArticulosProveedor}
                    valor={config.actualizarArticulosProveedor}
                    onChange={(opcion) => opcion && cambiar(
                        "actualizarArticulosProveedor", opcion.valor as ActualizarArticulosProveedor)}
                />
                <p className="descripcion-config">
                    {explicacionActualizarArticulosProveedor(config.actualizarArticulosProveedor)}
                </p>
            </section>
        </PantallaConfig>
    );
};
