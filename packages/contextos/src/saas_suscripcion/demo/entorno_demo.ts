import { crearApiDemo, Registro, RespuestaFija } from "./api_demo.ts";
import { DemoModulo } from "./diseño.ts";

/**
 * Prepara la ventana de la demo (el iframe de demo.html) ANTES de cargar ninguna pantalla:
 *
 * - localStorage en memoria: el iframe comparte origen con la app, así que su localStorage
 *   real es el de la sesión del usuario. La demo no debe leer su whoami (los módulos no
 *   contratados están bloqueados) ni escribir en él.
 * - fetch contra la API en memoria: nada llega al servidor.
 *
 * Solo afecta a esta ventana: la app que abre la demo sigue con su sesión y su fetch.
 */

/** whoami de la demo: todos los permisos y sin bloqueos del SaaS. */
const WHOAMI_DEMO = {
    usuario: "demo",
    nombre: "Usuario de demostración",
    permisos: [{ id_regla: "general", valor: true }],
    saas: null,
};

/**
 * Respuestas comunes a todas las demos (detrás de las propias de cada una): lo que piden
 * todas las pantallas y no es de ningún módulo.
 */
const FIJAS_COMUNES: RespuestaFija[] = [
    // Recursos para widgets automáticos de los maestros: en la demo, ninguno.
    { metodo: "GET", ruta: "comun/agregado", cuerpo: [] },
];

class AlmacenEnMemoria implements Storage {
    private datos = new Map<string, string>();
    get length() { return this.datos.size; }
    clear() { this.datos.clear(); }
    getItem(clave: string) { return this.datos.get(clave) ?? null; }
    key(i: number) { return [...this.datos.keys()][i] ?? null; }
    removeItem(clave: string) { this.datos.delete(clave); }
    setItem(clave: string, valor: string) { this.datos.set(clave, String(valor)); }
}

const leerCuerpo = (cuerpo: BodyInit | null | undefined): unknown => {
    if (typeof cuerpo !== "string") return {};
    try {
        return JSON.parse(cuerpo);
    } catch {
        return {};
    }
};

export const instalarEntornoDemo = (demo: DemoModulo, baseApi: string): void => {
    const almacen = new AlmacenEnMemoria();
    almacen.setItem("whoami", JSON.stringify({ ...WHOAMI_DEMO, plugins: demo.plugins ?? {} }));
    // Sesión de mentira: algunas pantallas (el asistente) no se pintan sin token de acceso.
    almacen.setItem("token", "demo");
    almacen.setItem("token-acceso", "demo");
    for (const [clave, valor] of Object.entries(demo.almacenamiento ?? {})) {
        almacen.setItem(clave, typeof valor === "string" ? valor : JSON.stringify(valor));
    }
    Object.defineProperty(window, "localStorage", { value: almacen, configurable: true });
    Object.defineProperty(window, "sessionStorage", { value: new AlmacenEnMemoria(), configurable: true });

    const api = crearApiDemo(demo.colecciones as Record<string, Registro[]>, [...(demo.fijas ?? []), ...FIJAS_COMUNES]);
    const fetchOriginal = window.fetch.bind(window);
    window.fetch = async (entrada: RequestInfo | URL, init?: RequestInit) => {
        const url = typeof entrada === "string" ? entrada : entrada instanceof URL ? entrada.href : entrada.url;
        // Solo la API: los recursos estáticos (iconos, fuentes…) siguen yendo al servidor de la app.
        if (!url.startsWith(baseApi)) return fetchOriginal(entrada, init);
        const r = api.responder(init?.method ?? "GET", url, leerCuerpo(init?.body), new URL(baseApi, location.href).pathname);
        if (r.sinDatos) console.info(`[demo] sin datos: ${init?.method ?? "GET"} ${url}`);
        const texto = typeof r.cuerpo === "string" ? r.cuerpo : JSON.stringify(r.cuerpo);
        return new Response(texto, {
            status: r.estado,
            headers: { "Content-Type": typeof r.cuerpo === "string" ? "text/plain" : "application/json" },
        });
    };
};
