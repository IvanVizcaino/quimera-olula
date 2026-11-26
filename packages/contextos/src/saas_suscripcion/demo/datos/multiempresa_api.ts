import { DemoModulo } from "../diseño.ts";
import { ALMACENES, EMPRESA, FORMAS_PAGO } from "./comun.ts";
import { ALTA_CLAVE_API, clave } from "./mcp.ts";

/**
 * Demo de Multiempresa y API: las sociedades del grupo (/empresa/empresa) y las claves de
 * API con las que otros programas se conectan al ERP (/auth/apikey, la misma pantalla que
 * usa el conector MCP, aquí con claves de integraciones).
 */

const sociedad = (id: string, nombre: string, cif: string, administrador: string, via: string, numero: string,
    codPostal: string, ciudad: string, provinciaId: string, provincia: string, email: string, almacen: string) => ({
    id,
    nombre,
    cif_nif: cif,
    administrador,
    direccion: {
        tipo_via: "Calle", nombre_via: via, numero, otros: "", cod_postal: codPostal, ciudad,
        provincia_id: provinciaId, provincia, pais_id: "ES", apartado: "", telefono: "950 000 100",
    },
    ejercicio_id: String(new Date().getFullYear()),
    telefono: "950 000 100",
    email,
    web: "https://hortalizasdelsur.ejemplo.test",
    serie_id: "A",
    forma_pago_id: "TRF30",
    divisa_id: "EUR",
    almacen_id: almacen,
});

export const demo: DemoModulo = {
    pantallas: [
        { nombre: "Sociedades", ruta: "/empresa/empresa" },
        { nombre: "Claves de API", ruta: "/auth/apikey" },
    ],
    guia: "Revisa las sociedades del grupo o da de alta otra, y crea claves de API para conectar otros programas.",
    colecciones: {
        "empresa/empresa": [
            sociedad("5", EMPRESA.nombre, EMPRESA.cif, "Ana Morales Gil", "Camino de la Lonja", "12", "04120",
                "La Cañada", "04", "Almería", "administracion@hortalizasdelsur.ejemplo.test", "ALM"),
            sociedad("4", "Hortalizas del Sur Distribución S.L.", "B00000001", "Ana Morales Gil", "Polígono La Redonda", "7",
                "04710", "El Ejido", "04", "Almería", "distribucion@hortalizasdelsur.ejemplo.test", "ALM"),
            sociedad("3", "Frutas Ecológicas Almanzora S.L.", "B00000002", "Luis Cano Pérez", "Avenida del Río", "45",
                "04600", "Huércal-Overa", "04", "Almería", "eco@almanzora.ejemplo.test", "TDA"),
            sociedad("2", "Envasados Poniente S.L.", "B00000003", "Rocío Navarro Díaz", "Calle Industria", "3",
                "18600", "Motril", "18", "Granada", "envasados@poniente.ejemplo.test", "ALM"),
            sociedad("1", "Huerta Levante Comercial S.L.", "B00000004", "Javier Ruiz Soler", "Calle Mayor", "88",
                "03300", "Orihuela", "03", "Alicante/Alacant", "comercial@huertalevante.ejemplo.test", "TDA"),
        ],
        "auth/apikey": [
            clave("1", "Tienda online · sincronización de pedidos", -60, 300),
            clave("2", "Integración contable de la gestoría", -40, 140),
            clave("3", "App de reparto de los conductores", -18, 72),
            clave("4", "Báscula del almacén central", -8, 352),
            clave("5", "Pruebas de la agencia web", -120, -30),
        ],
        "cache/comun/divisa": [
            { id: "EUR", descripcion: "Euro", tasa_conversion: 1 },
            { id: "USD", descripcion: "Dólar estadounidense", tasa_conversion: 0.92 },
        ],
        "cache/comun/formapago": FORMAS_PAGO,
        "almacen/almacen": ALMACENES,
        "comun/pais": [
            { id: "ES", nombre: "España" },
            { id: "PT", nombre: "Portugal" },
            { id: "FR", nombre: "Francia" },
        ],
    },
    // El maestro pide los recursos agregables para sus widgets: aquí no hay.
    fijas: [ALTA_CLAVE_API, { metodo: "GET", ruta: "comun/agregado", cuerpo: [] }],
};
