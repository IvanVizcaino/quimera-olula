import { PantallaConfig } from "#/comun/componentes/pantalla_config/PantallaConfig.tsx";
import { useConfig } from "#/comun/componentes/pantalla_config/useConfig.ts";
import { QCheckbox } from "@olula/componentes/atomos/qcheckbox.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QSelect } from "@olula/componentes/atomos/qselect.tsx";
import { SiNoPreguntar } from "../diseño.ts";
import { correoCopiasValido, opcionesSiNoPreguntar } from "../dominio.ts";
import { getConfigVentas, patchConfigVentas } from "../infraestructura.ts";

/**
 * Configuración de ventas: las opciones de ventas de los datos generales de
 * facturación del escritorio (`facturac_general`).
 */
export const ConfigVentas = () => {
    const { config, cambiar, cambiada, guardando, guardar } = useConfig(getConfigVentas, patchConfigVentas);

    if (!config) return null;

    const correoValido = correoCopiasValido(config.correoCopias);

    return (
        <PantallaConfig
            titulo="Configuración de ventas"
            descripcion="Datos generales de facturación que afectan a las ventas."
            onGuardar={guardar}
            cambiada={cambiada && correoValido}
            guardando={guardando}
        >
            <section className="grupo-config">
                <h3>Documentos de facturación</h3>
                <QCheckbox
                    label="Mostrar observaciones del cliente en documentos de facturación"
                    nombre="mostrar_observaciones_cliente"
                    valor={config.mostrarObservacionesCliente}
                    onChange={(valor) => cambiar("mostrarObservacionesCliente", valor === "true")}
                />
                <QSelect
                    label="Facturar albaranes como borrador"
                    nombre="facturar_albaranes_borrador"
                    opciones={opcionesSiNoPreguntar}
                    valor={config.facturarAlbaranesBorrador}
                    onChange={(opcion) =>
                        opcion && cambiar("facturarAlbaranesBorrador", opcion.valor as SiNoPreguntar)}
                />
                <QSelect
                    label="Crear facturas como borrador"
                    nombre="crear_facturas_borrador"
                    opciones={opcionesSiNoPreguntar}
                    valor={config.crearFacturasBorrador}
                    onChange={(opcion) =>
                        opcion && cambiar("crearFacturasBorrador", opcion.valor as SiNoPreguntar)}
                />
            </section>
            <section className="grupo-config">
                <h3>Correo</h3>
                <QInput
                    label="Dirección para la copia de correos"
                    nombre="correo_copias"
                    tipo="email"
                    opcional
                    valor={config.correoCopias}
                    erroneo={!correoValido}
                    textoValidacion={correoValido ? "" : "No parece una dirección de correo"}
                    onChange={(valor) => cambiar("correoCopias", valor)}
                />
            </section>
        </PantallaConfig>
    );
};
