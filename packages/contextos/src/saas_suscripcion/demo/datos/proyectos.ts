import { DemoModulo } from "../diseño.ts";
import { CLIENTES, fecha } from "./comun.ts";

const proyecto = (id: string, nombre: string, estado: string, inicio: number, fin: number | null) => ({
    id, nombre, nombre_completo: `${id.toUpperCase()} · ${nombre}`, estado, fecha_inicio: fecha(inicio),
    fecha_fin: fin === null ? null : fecha(fin),
});

export const demo: DemoModulo = {
    pantallas: [{ nombre: "Proyectos", ruta: "/proyectos/proyecto" }],
    guia: "Abre un proyecto, cambia su fecha de fin o crea uno nuevo.",
    colecciones: {
        "proyectos/proyecto": [
            proyecto("p001", "Nueva nave de envasado", "EN_CURSO", -40, 60),
            proyecto("p002", "Certificación ecológica", "ABIERTO", -10, 90),
            proyecto("p003", "Web y tienda online", "EN_CURSO", -25, 20),
            proyecto("p004", "Renovación de flota", "SUSPENDIDO", -90, null),
            proyecto("p005", "Campaña de verano", "CERRADO", -200, -100),
        ],
        "ventas/cliente": CLIENTES,
    },
};
