/**
 * Colores corporativos de bancos españoles para las tarjetas de saldo.
 * La coincidencia es por subcadena sobre el nombre de institución del proveedor
 * (p.ej. Plaid: "Abanca - Empresas", "Banco Santander"...).
 */
export type PaletaBanco = {
    tono: string;
    acento: string;
    /** Tarjeta clara (texto oscuro); p.ej. Abanca blanco/azul. */
    clara?: boolean;
};

type BancoEspana = {
    claves: string[];
    paleta: PaletaBanco;
};

export const BANCOS_ESPANA: BancoEspana[] = [
    {
        claves: ["santander"],
        paleta: { tono: "#ec0000", acento: "#cc0000" }, // rojo Santander
    },
    {
        claves: ["bbva"],
        paleta: { tono: "#004481", acento: "#1464a5" }, // azul BBVA
    },
    {
        claves: ["abanca"],
        paleta: { tono: "#f4f7fb", acento: "#0033a0", clara: true }, // blanco y azul Abanca
    },
    {
        claves: ["caixabank", "caixa bank", "la caixa", "caixa"],
        paleta: { tono: "#007eae", acento: "#00a0d2" }, // azul CaixaBank
    },
    {
        claves: ["sabadell"],
        paleta: { tono: "#007e3a", acento: "#00a651" }, // verde Sabadell
    },
    {
        claves: ["bankinter"],
        paleta: { tono: "#ff6200", acento: "#ff8533" }, // naranja Bankinter
    },
    {
        claves: ["unicaja"],
        paleta: { tono: "#006633", acento: "#00994d" }, // verde Unicaja
    },
    {
        claves: ["ing"],
        paleta: { tono: "#ff6200", acento: "#ff8a3d" }, // naranja ING
    },
    {
        claves: ["openbank"],
        paleta: { tono: "#000000", acento: "#333333" }, // negro Openbank
    },
    {
        claves: ["evo banco", "evobanco"],
        paleta: { tono: "#5b2d8e", acento: "#7b45b5" }, // morado EVO
    },
    {
        claves: ["n26"],
        paleta: { tono: "#1a1a1a", acento: "#36a18b" }, // negro + verde N26
    },
    {
        claves: ["revolut"],
        paleta: { tono: "#0b0b0f", acento: "#2c2c34" }, // negro Revolut
    },
    {
        claves: ["deutsche bank", "deutsche"],
        paleta: { tono: "#0018a8", acento: "#0018a8" }, // azul Deutsche Bank
    },
    {
        claves: ["cajamar"],
        paleta: { tono: "#00843d", acento: "#00a34d" }, // verde Cajamar
    },
    {
        claves: ["laboral kutxa", "laboral"],
        paleta: { tono: "#e30613", acento: "#c10510" }, // rojo Laboral Kutxa
    },
    {
        claves: ["kutxabank", "kutxa"],
        paleta: { tono: "#e30613", acento: "#c10510" }, // rojo Kutxabank
    },
    {
        claves: ["ibercaja"],
        paleta: { tono: "#003da5", acento: "#0050d4" }, // azul Ibercaja
    },
    {
        claves: ["cajasur"],
        paleta: { tono: "#e30613", acento: "#c10510" }, // rojo Cajasur (grupo Kutxabank)
    },
    {
        claves: ["banco mediolanum", "mediolanum"],
        paleta: { tono: "#ff6600", acento: "#ff8533" }, // naranja Mediolanum
    },
    {
        claves: ["triodos"],
        paleta: { tono: "#4a7c59", acento: "#6a9e78" }, // verde Triodos
    },
    {
        claves: ["pichincha"],
        paleta: { tono: "#ffd100", acento: "#c9a000", clara: true }, // amarillo Pichincha
    },
    {
        claves: ["self bank", "selfbank"],
        paleta: { tono: "#00a3e0", acento: "#33b5e6" }, // azul Self Bank
    },
    {
        claves: ["imagin"],
        paleta: { tono: "#ff6b35", acento: "#ff8a5c" }, // naranja imaginBank
    },
    {
        claves: ["orange bank", "orangebank"],
        paleta: { tono: "#ff7900", acento: "#ff9a3d" }, // naranja Orange Bank
    },
    {
        claves: ["banco cooperativas", "cajaviva", "caja rural"],
        paleta: { tono: "#006341", acento: "#008556" }, // verde cooperativas / rural
    },
];

/** Fallback cuando no hay coincidencia con un banco conocido. */
export const PALETA_BANCO_DEFECTO: PaletaBanco = {
    tono: "#0b3d91",
    acento: "#1a5bb8",
};

const normalizar = (texto: string): string =>
    texto
        .normalize("NFD")
        .replace(/\p{M}/gu, "")
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, " ")
        .replace(/\s+/g, " ")
        .trim();

export const paletaBancoEspana = (institucion: string | null | undefined): PaletaBanco => {
    const nombre = normalizar(institucion ?? "");
    if (!nombre) return PALETA_BANCO_DEFECTO;

    // Gana la clave más larga (p.ej. "laboral kutxa" antes que "kutxa").
    let mejor: { longitud: number; paleta: PaletaBanco } | null = null;
    for (const banco of BANCOS_ESPANA) {
        for (const clave of banco.claves) {
            if (nombre.includes(clave) && (!mejor || clave.length > mejor.longitud)) {
                mejor = { longitud: clave.length, paleta: banco.paleta };
            }
        }
    }

    return mejor?.paleta ?? PALETA_BANCO_DEFECTO;
};
