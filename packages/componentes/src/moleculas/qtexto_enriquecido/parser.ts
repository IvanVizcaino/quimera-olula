import type { Nodo, NodoReferencia } from "./types.ts";

const parsearCriterios = (raw: string): Record<string, string> | undefined => {
    const contenido = raw.trim();
    if (!contenido) return;

    // Compatibilidad hacia atrás con formato antiguo: "123" -> { id: "123" }
    if (!contenido.includes(",")) return { id: contenido };

    const criterios: Record<string, string> = {};
    const pares = contenido
        .split(/[;&]/)
        .map((par) => par.trim())
        .filter(Boolean);

    for (const par of pares) {
        const indiceComa = par.indexOf(",");
        if (indiceComa <= 0) return;

        const campo = par.slice(0, indiceComa).trim();
        const valor = par.slice(indiceComa + 1).trim();
        if (!campo || !valor) return;

        criterios[campo] = valor;
    }

    return Object.keys(criterios).length > 0 ? criterios : undefined;
};

const parsearReferencia = (token: string): NodoReferencia | undefined => {
    const indiceBarra = token.indexOf("|");
    if (indiceBarra <= 0) return;

    const indiceDosPuntos = token.indexOf(":");
    const etiqueta = token.slice(indiceBarra + 1).trim();
    if (!etiqueta) return;

    // Formato sin criterios: @x.y|Etiqueta
    if (indiceDosPuntos === -1 || indiceDosPuntos > indiceBarra) {
        const claveSinCriterios = token.slice(0, indiceBarra).trim();
        if (!claveSinCriterios) return;

        return {
            tipo: "referencia",
            clave: claveSinCriterios,
            criterios: {},
            etiqueta,
        };
    }

    const clave = token.slice(0, indiceDosPuntos).trim();
    const criteriosRaw = token.slice(indiceDosPuntos + 1, indiceBarra).trim();
    const criterios = parsearCriterios(criteriosRaw);
    if (!clave || !criterios) return;

    return {
        tipo: "referencia",
        clave,
        criterios,
        etiqueta,
    };
};

const buscarMarcaAbierta = (
    texto: string,
    indice: number,
    marcas: string[]
) => marcas.find((marca) => texto.startsWith(`[${marca}]`, indice));

const buscarMarcaSinCierre = (
    texto: string,
    indice: number,
    marcasSinCierre: string[]
) => marcasSinCierre.find((marca) => texto.startsWith(`[${marca}]`, indice));

const siguienteIndiceToken = (
    texto: string,
    indice: number,
    marcas: string[],
    marcasSinCierre: string[]
) => {
    const posiciones = [texto.indexOf("[@", indice)];

    for (const marca of marcas) {
        posiciones.push(texto.indexOf(`[${marca}]`, indice));
    }

    for (const marca of marcasSinCierre) {
        posiciones.push(texto.indexOf(`[${marca}]`, indice));
    }

    const candidatas = posiciones.filter((pos) => pos !== -1);
    return candidatas.length > 0 ? Math.min(...candidatas) : texto.length;
};

export const parsearNodos = (
    texto: string,
    marcas: string[],
    marcasSinCierre: string[] = []
): Nodo[] => {
    const nodos: Nodo[] = [];
    let indice = 0;

    while (indice < texto.length) {
        const marcaSinCierre = buscarMarcaSinCierre(texto, indice, marcasSinCierre);
        if (marcaSinCierre) {
            nodos.push({
                tipo: "marca",
                marca: marcaSinCierre,
                hijos: [],
            });
            indice += `[${marcaSinCierre}]`.length;
            continue;
        }

        const marcaAbierta = buscarMarcaAbierta(texto, indice, marcas);
        if (marcaAbierta) {
            const tokenApertura = `[${marcaAbierta}]`;
            const tokenCierre = `[/${marcaAbierta}]`;
            const cierre = texto.indexOf(tokenCierre, indice + tokenApertura.length);

            if (cierre !== -1) {
                const contenido = texto.slice(indice + tokenApertura.length, cierre);
                nodos.push({
                    tipo: "marca",
                    marca: marcaAbierta,
                    hijos: parsearNodos(contenido, marcas, marcasSinCierre),
                });
                indice = cierre + tokenCierre.length;
                continue;
            }
        }

        if (texto.startsWith("[@", indice)) {
            const cierre = texto.indexOf("]", indice + 2);
            if (cierre !== -1) {
                const token = texto.slice(indice + 2, cierre);
                const referencia = parsearReferencia(token);
                if (referencia) {
                    nodos.push(referencia);
                    indice = cierre + 1;
                    continue;
                }
            }
        }

        const siguienteToken = siguienteIndiceToken(
            texto,
            indice,
            marcas,
            marcasSinCierre
        );

        // Evita bucles infinitos cuando el texto actual parece token pero no parsea.
        if (siguienteToken === indice) {
            nodos.push({
                tipo: "texto",
                contenido: texto[indice],
            });
            indice += 1;
            continue;
        }

        nodos.push({
            tipo: "texto",
            contenido: texto.slice(indice, siguienteToken),
        });
        indice = siguienteToken;
    }

    return nodos;
};
