import { Colecciones, RespuestaFija } from "./api_demo.ts";

/** Una pantalla del módulo que se puede abrir en la demo (pestañas del marco de la demo). */
export interface PantallaDemo {
    nombre: string;
    /** Ruta de la app ("/crm/oportunidadventa"). */
    ruta: string;
}

/**
 * Demo de un módulo de «Módulos disponibles». Los datos son inventados (empresa ficticia
 * «Hortalizas del Sur», ver datos/comun.ts): nunca datos de clientes.
 */
export interface DemoModulo {
    /** La primera es la que se abre al entrar. */
    pantallas: PantallaDemo[];
    /** Qué se puede probar, para el encabezado de la demo. */
    guia: string;
    /** Colecciones REST en memoria (clave: ruta de la API sin barra inicial, "ventas/cliente"). */
    colecciones: Colecciones;
    /** Respuestas fijas para lo que no es una colección. */
    fijas?: RespuestaFija[];
    /** Claves de localStorage con las que arranca la demo (p. ej. el punto de venta del TPV). */
    almacenamiento?: Record<string, unknown>;
    /** Plugins activos en la demo (whoami.plugins), por si la pantalla depende de alguno. */
    plugins?: Record<string, string>;
}
