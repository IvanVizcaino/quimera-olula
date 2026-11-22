import { avisoIvaDefecto, configAlmacenPorDefecto } from "#/almacen/config/dominio.ts";
import { getConfigAlmacen, patchConfigAlmacen } from "#/almacen/config/infraestructura.ts";
import { GrupoIvaNegocio } from "#/comun/componentes/grupo_iva_negocio.tsx";
import { Impuesto } from "#/comun/componentes/impuesto.tsx";
import { PantallaConfig } from "#/comun/componentes/pantalla_config/PantallaConfig.tsx";
import { useConfig } from "#/comun/componentes/pantalla_config/useConfig.ts";
import { QCheckbox } from "@olula/componentes/atomos/qcheckbox.tsx";
import { plugin, puede } from "@olula/lib/dominio.ts";
import { configEmpresaValida, grupoIvaNegocioVisible } from "../dominio.ts";
import { getConfigEmpresa, patchConfigEmpresa } from "../infraestructura.ts";

const REGLA_CONFIG_ALMACEN = "almacen.config";

/**
 * Configuración de empresa: el grupo de IVA de negocio de los datos generales de
 * facturación del escritorio (`facturac_general`) y el I.V.A. por defecto, que el
 * escritorio guarda en los datos generales de almacén (`factalma_general`) y antes
 * estaba en Almacén > Configuración.
 */
export const ConfigEmpresa = () => {
    const empresa = useConfig(getConfigEmpresa, patchConfigEmpresa);
    // Sin permiso de configuración de almacén no se lee ni se muestra el I.V.A. por defecto.
    const verIva = puede(REGLA_CONFIG_ALMACEN);
    const iva = useConfig(
        () => (verIva ? getConfigAlmacen() : Promise.resolve(configAlmacenPorDefecto)),
        patchConfigAlmacen,
    );

    if (!empresa.config || !iva.config) return null;

    const estadoIvaNav = plugin("iva_nav");
    const verGrupoIva = grupoIvaNegocioVisible(empresa.config, estadoIvaNav);
    const empresaCambiada = verGrupoIva && empresa.cambiada && configEmpresaValida(empresa.config, estadoIvaNav);
    const ivaCambiado = verIva && iva.cambiada;
    const aviso = avisoIvaDefecto(iva.config);

    const guardar = async () => {
        if (empresaCambiada) await empresa.guardar();
        if (ivaCambiado) await iva.guardar();
    };

    return (
        <PantallaConfig
            titulo="Configuración de empresa"
            descripcion="Datos generales de facturación de la empresa."
            onGuardar={guardar}
            cambiada={empresaCambiada || ivaCambiado}
            guardando={empresa.guardando || iva.guardando}
        >
            {verGrupoIva && (
                <section className="grupo-config">
                    <h3>Impuestos</h3>
                    <GrupoIvaNegocio
                        label="G.IVA Negocio"
                        nombre="grupo_iva_negocio_id"
                        valor={empresa.config.grupoIvaNegocioId}
                        onChange={(opcion) => empresa.cambiar("grupoIvaNegocioId", opcion?.valor ?? "")}
                    />
                </section>
            )}
            {!verGrupoIva && !verIva && (
                <p className="descripcion-config">No hay datos de empresa que configurar en esta instalación.</p>
            )}
            {verIva && (
                <section className="grupo-config">
                    <h3>Valores por defecto</h3>
                    <Impuesto
                        label="I.V.A. por defecto"
                        nombre="impuesto_id"
                        opcional
                        valor={iva.config.impuestoId}
                        onChange={(opcion) => iva.cambiar("impuestoId", opcion?.valor ?? "")}
                    />
                    <QCheckbox
                        label="Utilizar I.V.A. por defecto"
                        nombre="usar_iva_defecto"
                        valor={iva.config.usarIvaDefecto}
                        onChange={(valor) => iva.cambiar("usarIvaDefecto", valor === "true")}
                    />
                    <p className="descripcion-config">
                        Los artículos nuevos que se den de alta sin impuesto toman el I.V.A. por defecto.
                        Con «Utilizar I.V.A. por defecto», las líneas nuevas de presupuestos, pedidos, albaranes
                        y facturas de venta y de compra nacen con este impuesto; al elegir un artículo, la línea
                        toma el impuesto del artículo.
                    </p>
                    {aviso && <p className="descripcion-config">{aviso}</p>}
                </section>
            )}
        </PantallaConfig>
    );
};
