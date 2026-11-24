import { PantallaConfig } from "#/comun/componentes/pantalla_config/PantallaConfig.tsx";
import { useConfig } from "#/comun/componentes/pantalla_config/useConfig.ts";
import { QCheckbox } from "@olula/componentes/atomos/qcheckbox.tsx";
import { ConfigProduccion as Config } from "../diseño.ts";
import { getConfigProduccion, patchConfigProduccion } from "../infraestructura.ts";

const opciones: { campo: keyof Config; nombre: string; label: string }[][] = [
    [
        { campo: "pedidoCompleto", nombre: "pedido_completo", label: "Fabricar el pedido completo (el asistente de órdenes propone todo lo pendiente del pedido, no solo lo que falta)" },
    ],
    [
        { campo: "usarTramos", nombre: "usar_tramos", label: "Declarar la producción por tramos (cantidad y lotes consumidos)" },
        { campo: "mostrarFormulario", nombre: "mostrar_formulario", label: "Mostrar el formulario de la tarea" },
        { campo: "controlTiempo", nombre: "control_tiempo", label: "Controlar el tiempo de los trabajadores en las tareas" },
    ],
];

/**
 * Producción > Configuración (`prodppal_general` y `pr_config`). Se guarda con el botón, como
 * las demás pantallas de configuración (los checkboxes llegan como "true"/"false").
 */
export const ConfigProduccion = () => {
    const { config, cambiar, cambiada, guardando, guardar } = useConfig(getConfigProduccion, patchConfigProduccion);

    if (!config) return null;

    const grupo = (titulo: string, campos: (typeof opciones)[number]) => (
        <section className="grupo-config">
            <h3>{titulo}</h3>
            {campos.map(({ campo, nombre, label }) => (
                <QCheckbox
                    key={nombre}
                    label={label}
                    nombre={nombre}
                    valor={config[campo]}
                    onChange={(valor) => cambiar(campo, valor === "true")}
                />
            ))}
        </section>
    );

    return (
        <PantallaConfig
            titulo="Configuración de producción"
            descripcion="Opciones generales de la producción y del Terminal de planta."
            onGuardar={guardar}
            cambiada={cambiada}
            guardando={guardando}
        >
            {grupo("Órdenes de producción", opciones[0])}
            {grupo("Terminal de planta", opciones[1])}
        </PantallaConfig>
    );
};
