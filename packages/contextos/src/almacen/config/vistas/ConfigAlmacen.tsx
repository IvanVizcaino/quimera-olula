import { Impuesto } from "#/comun/componentes/impuesto.tsx";
import { PantallaConfig } from "#/comun/componentes/pantalla_config/PantallaConfig.tsx";
import { useConfig } from "#/comun/componentes/pantalla_config/useConfig.ts";
import { QCheckbox } from "@olula/componentes/atomos/qcheckbox.tsx";
import { avisoIvaDefecto } from "../dominio.ts";
import { getConfigAlmacen, patchConfigAlmacen } from "../infraestructura.ts";

/**
 * Configuración de almacén: los datos generales de almacén del escritorio
 * (`factalma_general`), valores por defecto de las líneas de los documentos.
 */
export const ConfigAlmacen = () => {
    const { config, cambiar, cambiada, guardando, guardar } = useConfig(getConfigAlmacen, patchConfigAlmacen);

    if (!config) return null;

    const aviso = avisoIvaDefecto(config);

    return (
        <PantallaConfig
            titulo="Configuración de almacén"
            descripcion="Datos generales de almacén."
            onGuardar={guardar}
            cambiada={cambiada}
            guardando={guardando}
        >
            <section className="grupo-config">
                <h3>Valores por defecto</h3>
                <Impuesto
                    label="I.V.A. por defecto"
                    nombre="impuesto_id"
                    opcional
                    valor={config.impuestoId}
                    onChange={(opcion) => cambiar("impuestoId", opcion?.valor ?? "")}
                />
                <QCheckbox
                    label="Utilizar I.V.A. por defecto"
                    nombre="usar_iva_defecto"
                    valor={config.usarIvaDefecto}
                    onChange={(valor) => cambiar("usarIvaDefecto", valor === "true")}
                />
                <p className="descripcion-config">
                    Los artículos nuevos que se den de alta sin impuesto toman el I.V.A. por defecto.
                    Con «Utilizar I.V.A. por defecto», las líneas nuevas de presupuestos, pedidos, albaranes
                    y facturas de venta y de compra nacen con este impuesto; al elegir un artículo, la línea
                    toma el impuesto del artículo.
                </p>
                {aviso && <p className="descripcion-config">{aviso}</p>}
            </section>
        </PantallaConfig>
    );
};
