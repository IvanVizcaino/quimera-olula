import { DEMOS } from "#/saas_suscripcion/demo/registro.ts";
import { instalarEntornoDemo } from "#/saas_suscripcion/demo/entorno_demo.ts";
import "./DemoModulo.css";

/**
 * Demo de un módulo («Módulos disponibles» › Probar): se abre en un iframe con
 * `demo.html?modulo=<id>`. Primero se aísla la ventana (localStorage en memoria y fetch
 * contra datos inventados, ver entorno_demo.ts) y solo después se cargan las pantallas:
 * por eso todo lo demás se importa dinámicamente.
 */
const moduloId = new URLSearchParams(location.search).get("modulo") ?? "";
const demo = DEMOS[moduloId];
const raiz = document.getElementById("root")!;

if (!demo) {
    raiz.innerHTML = '<p class="demo-sin-datos">Este módulo todavía no tiene demo.</p>';
} else {
    instalarEntornoDemo(demo, import.meta.env.VITE_API_URL || "http://localhost:5000");
    const { montarDemo } = await import("./DemoModulo.tsx");
    montarDemo(raiz, demo);
}
