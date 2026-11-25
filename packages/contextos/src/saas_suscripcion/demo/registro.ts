import { demo as almacen } from "./datos/almacen.ts";
import { demo as analisis } from "./datos/analisis.ts";
import { demo as compras } from "./datos/compras.ts";
import { demo as contabilidad } from "./datos/contabilidad.ts";
import { demo as crm } from "./datos/crm.ts";
import { demo as documental } from "./datos/documental.ts";
import { demo as ia } from "./datos/ia.ts";
import { demo as mcp } from "./datos/mcp.ts";
import { demo as multiempresa_api } from "./datos/multiempresa_api.ts";
import { demo as predicciones } from "./datos/predicciones.ts";
import { demo as proyectos } from "./datos/proyectos.ts";
import { demo as rrhh } from "./datos/rrhh.ts";
import { demo as tesoreria } from "./datos/tesoreria.ts";
import { demo as tienda_online } from "./datos/tienda_online.ts";
import { demo as tpv } from "./datos/tpv.ts";
import { demo as ventas } from "./datos/ventas.ts";
import { DemoModulo } from "./diseño.ts";

export type { DemoModulo, PantallaDemo } from "./diseño.ts";

/**
 * Demos de «Módulos disponibles»: una por módulo a la venta, con sus datos en datos/<módulo>.ts.
 * Las que aún no existen (null) muestran la ficha sin el botón «Probar».
 */
const TODAS: Record<string, DemoModulo | null> = {
    ventas, compras, almacen, tesoreria, contabilidad, crm, tpv, rrhh, documental, proyectos, analisis,
    tienda_online, ia, predicciones, mcp, multiempresa_api,
};

export const DEMOS: Record<string, DemoModulo> = Object.fromEntries(
    Object.entries(TODAS).filter((e): e is [string, DemoModulo] => e[1] !== null));

/** Lo manda demo.html a la ventana que la abre cuando su primera pantalla está montada. */
export const MENSAJE_DEMO_LISTA = "olula-demo-lista";

export const tieneDemo = (moduloId: string): boolean => moduloId in DEMOS;

/** Página de la demo (entrada demo.html de la app), para el iframe de la ficha del módulo. */
export const urlDemo = (moduloId: string): string => `/demo.html?modulo=${encodeURIComponent(moduloId)}`;
