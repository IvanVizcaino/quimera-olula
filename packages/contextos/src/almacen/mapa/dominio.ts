import { ClaseAbc } from "#/almacen/slotting/diseño.ts";
import { RecorridoOrden } from "#/almacen/orden/diseño.ts";
import {
    CapaMapa, CeldaModulo, EntradaLeyenda, GeometriaPasillo, Lado, MapaAlmacen, PasilloMapa,
    PuntoRecorrido, Tono, UbicacionMapa,
} from "./diseño.ts";

export const capasMapa: { valor: CapaMapa; descripcion: string }[] = [
    { valor: "OCUPACION", descripcion: "Ocupación" },
    { valor: "ABC_UBICACION", descripcion: "ABC de la ubicación" },
    { valor: "ABC_ARTICULO", descripcion: "ABC del artículo" },
    { valor: "SLOTTING", descripcion: "Slotting (artículo vs. ubicación)" },
    { valor: "CLASE_ALMACENAMIENTO", descripcion: "Clase de almacenamiento" },
    { valor: "PICKING", descripcion: "Picking fijo" },
    { valor: "BLOQUEO", descripcion: "Bloqueo" },
];

export const CAPA_POR_DEFECTO: CapaMapa = "OCUPACION";

export const capaMapa = (valor: string | null | undefined): CapaMapa =>
    capasMapa.find((c) => c.valor === valor)?.valor ?? CAPA_POR_DEFECTO;

// ─── Layout ───────────────────────────────────────────────────────────────

/** Impares a la izquierda, pares a la derecha (como una calle). */
export const ladoDeModulo = (modulo: number): Lado => (modulo % 2 === 1 ? "IZQUIERDA" : "DERECHA");

/** Posición a lo largo del pasillo (1..modulos): los módulos 2k-1 y 2k quedan enfrentados. */
export const posicionEnPasillo = (modulo: number): number => Math.floor((modulo + 1) / 2);

export const ladosDePasillo = (p: Pick<PasilloMapa, "caras">): Lado[] =>
    p.caras === "AMBAS" ? ["IZQUIERDA", "DERECHA"] : [p.caras];

/** Números de módulo de una cara, en el sentido de avance. */
export const modulosDeLado = (p: Pick<PasilloMapa, "modulos">, lado: Lado): number[] =>
    Array.from({ length: p.modulos }, (_, i) => (lado === "IZQUIERDA" ? 2 * i + 1 : 2 * i + 2));

export const MEDIDAS = {
    /** Largo de un módulo a lo largo del pasillo. */
    modulo: 22,
    /** Fondo de la estantería. */
    fondo: 20,
    /** Ancho del pasillo por el que se camina. */
    pasillo: 22,
    /** Separación entre dos pasillos. */
    separacion: 12,
    /** Margen superior: el transversal de cabecera por el que se entra a los pasillos. */
    cabecera: 26,
    margen: 8,
};

const anchoPasillo = MEDIDAS.fondo * 2 + MEDIDAS.pasillo;

export const geometriaPasillo = (p: PasilloMapa, indice: number): GeometriaPasillo => {
    const x = MEDIDAS.margen + indice * (anchoPasillo + MEDIDAS.separacion);
    const celdas: CeldaModulo[] = ladosDePasillo(p).flatMap((lado) =>
        modulosDeLado(p, lado).map((modulo) => ({
            modulo,
            lado,
            x: lado === "IZQUIERDA" ? x : x + MEDIDAS.fondo + MEDIDAS.pasillo,
            y: MEDIDAS.cabecera + (posicionEnPasillo(modulo) - 1) * MEDIDAS.modulo,
            ancho: MEDIDAS.fondo,
            alto: MEDIDAS.modulo,
        }))
    );
    return {
        pasilloId: p.pasilloId,
        xEje: x + MEDIDAS.fondo + MEDIDAS.pasillo / 2,
        x,
        ancho: anchoPasillo,
        alto: p.modulos * MEDIDAS.modulo,
        celdas,
    };
};

export const geometriaZona = (pasillos: PasilloMapa[]) => {
    const geometrias = pasillos.map(geometriaPasillo);
    const ancho = MEDIDAS.margen * 2 + Math.max(0, pasillos.length * (anchoPasillo + MEDIDAS.separacion) - MEDIDAS.separacion);
    const alto = MEDIDAS.cabecera + Math.max(0, ...geometrias.map((g) => g.alto)) + MEDIDAS.margen;
    return { geometrias, ancho, alto };
};

/** Centro de un módulo en la planta, sobre el eje del pasillo (donde para el operario). */
export const puntoDeModulo = (g: GeometriaPasillo, modulo: number): { x: number; y: number } => ({
    x: g.xEje,
    y: MEDIDAS.cabecera + (posicionEnPasillo(modulo) - 0.5) * MEDIDAS.modulo,
});

// ─── Agrupaciones ────────────────────────────────────────────────────────

/** Ubicaciones de un pasillo por módulo. */
export const ubicacionesPorModulo = (
    ubicaciones: UbicacionMapa[], pasilloId: string,
): Map<number, UbicacionMapa[]> => {
    const mapa = new Map<number, UbicacionMapa[]>();
    for (const u of ubicaciones) {
        if (u.pasilloId !== pasilloId || u.modulo === null) continue;
        mapa.set(u.modulo, [...(mapa.get(u.modulo) ?? []), u]);
    }
    return mapa;
};

/** Ubicaciones de una zona que no están en ningún pasillo (playas, muelles, migración). */
export const ubicacionesSueltas = (ubicaciones: UbicacionMapa[], zonaId: string): UbicacionMapa[] =>
    ubicaciones.filter((u) => u.zonaId === zonaId && u.pasilloId === null);

/** Huecos de un módulo en un nivel, por número de hueco. */
export const huecosDe = (ubicaciones: UbicacionMapa[], nivel: number): UbicacionMapa[] =>
    ubicaciones.filter((u) => u.nivel === nivel).sort((a, b) => (a.hueco ?? 0) - (b.hueco ?? 0));

// ─── Capas ───────────────────────────────────────────────────────────────

const RANGO: Record<ClaseAbc, number> = { A: 0, B: 1, C: 2 };
const TONOS_CLASE = 6;

/** Índice de color de cada código de clase de almacenamiento, en orden alfabético. */
export const paletaClases = (mapa: MapaAlmacen): Map<string, number> => {
    const codigos = [...new Set(mapa.ubicaciones.flatMap((u) => u.clasesAlmacenamiento))].sort();
    return new Map(codigos.map((c, i) => [c, i % TONOS_CLASE]));
};

export const ocupada = (u: UbicacionMapa): boolean => u.cantidad > 0;

export const bajoMinimo = (u: UbicacionMapa): boolean =>
    u.pickingFijo !== null && u.cantidad < u.pickingFijo.minimo;

const tonoClase = (c: ClaseAbc | null): Tono => (c ? c.toLowerCase() : "sin-dato");

/** Cruce de la rotación del artículo con la accesibilidad del hueco. */
export const tonoSlotting = (u: Pick<UbicacionMapa, "claseArticulo" | "claseUbicacion">): Tono => {
    if (!u.claseArticulo || !u.claseUbicacion) return "sin-dato";
    const diferencia = RANGO[u.claseUbicacion] - RANGO[u.claseArticulo];
    return diferencia === 0 ? "ok" : diferencia > 0 ? "rota-mas" : "rota-menos";
};

export const tonoUbicacion = (u: UbicacionMapa, capa: CapaMapa, paleta: Map<string, number>): Tono => {
    switch (capa) {
        case "OCUPACION":
            return ocupada(u) ? "lleno" : "vacio";
        case "ABC_UBICACION":
            return tonoClase(u.claseUbicacion);
        case "ABC_ARTICULO":
            return tonoClase(u.claseArticulo);
        case "SLOTTING":
            return tonoSlotting(u);
        case "CLASE_ALMACENAMIENTO":
            return tonoClasesAlmacenamiento(u.clasesAlmacenamiento, paleta);
        case "PICKING":
            return u.pickingFijo === null ? "sin-dato" : bajoMinimo(u) ? "bajo-minimo" : "picking";
        case "BLOQUEO":
            return u.bloqueada ? "bloqueada" : "activa";
    }
};

const tonoClasesAlmacenamiento = (codigos: string[], paleta: Map<string, number>): Tono => {
    const unicos = [...new Set(codigos)];
    if (unicos.length === 0) return "sin-dato";
    if (unicos.length > 1) return "mezcla";
    return `clase-${paleta.get(unicos[0]) ?? 0}`;
};

/** Color de un módulo (todos sus niveles y huecos) en la planta. */
export const tonoModulo = (us: UbicacionMapa[], capa: CapaMapa, paleta: Map<string, number>): Tono => {
    if (us.length === 0) return "sin-ubicaciones";
    switch (capa) {
        case "OCUPACION": {
            const llenas = us.filter(ocupada).length;
            return llenas === 0 ? "vacio" : llenas === us.length ? "lleno" : "parcial";
        }
        case "ABC_UBICACION":
            return tonoClase(mejorClase(us.map((u) => u.claseUbicacion)));
        case "ABC_ARTICULO":
            return tonoClase(mejorClase(us.map((u) => u.claseArticulo)));
        case "SLOTTING": {
            const tonos = us.map(tonoSlotting);
            return (["rota-mas", "rota-menos", "ok"] as Tono[]).find((t) => tonos.includes(t)) ?? "sin-dato";
        }
        case "CLASE_ALMACENAMIENTO":
            return tonoClasesAlmacenamiento(us.flatMap((u) => u.clasesAlmacenamiento), paleta);
        case "PICKING":
            return us.some(bajoMinimo) ? "bajo-minimo" : us.some((u) => u.pickingFijo) ? "picking" : "sin-dato";
        case "BLOQUEO": {
            const bloqueadas = us.filter((u) => u.bloqueada).length;
            return bloqueadas === 0 ? "activa" : bloqueadas === us.length ? "bloqueada" : "parcial-bloqueada";
        }
    }
};

/** Letra ABC que se escribe en el hueco (para no depender solo del color); null fuera de esas capas. */
export const letraUbicacion = (u: UbicacionMapa, capa: CapaMapa): ClaseAbc | null => {
    switch (capa) {
        case "ABC_UBICACION":
            return u.claseUbicacion;
        case "ABC_ARTICULO":
        case "SLOTTING":
            return u.claseArticulo;
        default:
            return null;
    }
};

/** Letra de un módulo de la planta: la mejor de sus huecos. */
export const letraModulo = (us: UbicacionMapa[], capa: CapaMapa): ClaseAbc | null =>
    mejorClase(us.map((u) => letraUbicacion(u, capa)));

export const mejorClase = (clases: (ClaseAbc | null)[]): ClaseAbc | null =>
    clases.filter((c): c is ClaseAbc => c !== null).sort((a, b) => RANGO[a] - RANGO[b])[0] ?? null;

export const leyenda = (capa: CapaMapa, paleta: Map<string, number>): EntradaLeyenda[] => {
    switch (capa) {
        case "OCUPACION":
            return [
                { tono: "vacio", texto: "Vacío" },
                { tono: "parcial", texto: "Parcial (módulo)" },
                { tono: "lleno", texto: "Con stock" },
            ];
        case "ABC_UBICACION":
            return [
                { tono: "a", texto: "A: más accesible" },
                { tono: "b", texto: "B" },
                { tono: "c", texto: "C: menos accesible" },
                { tono: "sin-dato", texto: "Sin pasillo" },
            ];
        case "ABC_ARTICULO":
            return [
                { tono: "a", texto: "Artículo A" },
                { tono: "b", texto: "Artículo B" },
                { tono: "c", texto: "Artículo C" },
                { tono: "sin-dato", texto: "Vacía" },
            ];
        case "SLOTTING":
            return [
                { tono: "ok", texto: "Rotación acorde al hueco" },
                { tono: "rota-mas", texto: "Rota más que su hueco (moverlo a uno mejor)" },
                { tono: "rota-menos", texto: "Rota menos que su hueco (ocupa uno bueno)" },
                { tono: "sin-dato", texto: "Vacía o sin pasillo" },
            ];
        case "CLASE_ALMACENAMIENTO":
            return [
                ...[...paleta.entries()].map(([codigo, i]) => ({ tono: `clase-${i}`, texto: codigo })),
                { tono: "mezcla", texto: "Varias clases" },
                { tono: "sin-dato", texto: "Vacía o sin clase" },
            ];
        case "PICKING":
            return [
                { tono: "picking", texto: "Picking fijo" },
                { tono: "bajo-minimo", texto: "Bajo mínimo" },
                { tono: "sin-dato", texto: "Sin picking fijo" },
            ];
        case "BLOQUEO":
            return [
                { tono: "activa", texto: "Activa" },
                { tono: "parcial-bloqueada", texto: "Alguna bloqueada (módulo)" },
                { tono: "bloqueada", texto: "Bloqueada" },
            ];
    }
};

const fmt = (n: number) => n.toLocaleString("es-ES");

const MAX_EN_LISTA = 5;

/** Los primeros códigos y cuántos más hay (una ubicación de migración puede tener cientos). */
export const listaCorta = (codigos: string[]): string =>
    codigos.slice(0, MAX_EN_LISTA).join(", ") +
    (codigos.length > MAX_EN_LISTA ? ` y ${codigos.length - MAX_EN_LISTA} más` : "");

/** Texto del tooltip de una ubicación. */
export const resumenUbicacion = (u: UbicacionMapa): string => {
    const partes = [u.ubicacion + (u.bloqueada ? " (bloqueada)" : "")];
    partes.push(u.articulos.length ? `${listaCorta(u.articulos)}: ${fmt(u.cantidad)}` : "Vacía");
    if (u.pickingFijo) {
        partes.push(`Picking fijo ${u.pickingFijo.articuloId} (mín. ${fmt(u.pickingFijo.minimo)}, máx. ${fmt(u.pickingFijo.maximo)})`);
    }
    if (u.claseUbicacion) partes.push(`Hueco ${u.claseUbicacion}`);
    if (u.claseArticulo) partes.push(`Artículo ${u.claseArticulo}`);
    if (u.clasesAlmacenamiento.length) partes.push(`Clase ${u.clasesAlmacenamiento.join(", ")}`);
    return partes.join("\n");
};

/** Texto del tooltip de un módulo de la planta. */
export const resumenModulo = (pasillo: string, modulo: number, us: UbicacionMapa[]): string => {
    const llenas = us.filter(ocupada).length;
    const bloqueadas = us.filter((u) => u.bloqueada).length;
    const articulos = [...new Set(us.flatMap((u) => u.articulos))];
    return [
        `Pasillo ${pasillo}, módulo ${modulo}`,
        `${us.length} huecos, ${llenas} con stock${bloqueadas ? `, ${bloqueadas} bloqueados` : ""}`,
        ...(articulos.length ? [listaCorta(articulos)] : []),
    ].join("\n");
};

// ─── Recorrido ───────────────────────────────────────────────────────────

/** Paradas del recorrido que caen en un pasillo del mapa. */
export const puntosRecorrido = (recorrido: RecorridoOrden, mapa: MapaAlmacen): PuntoRecorrido[] => {
    const porId = new Map(mapa.ubicaciones.map((u) => [u.ubicacionId, u]));
    return recorrido.paradas.flatMap((p) => {
        const u = porId.get(p.ubicacionId);
        return u?.pasilloId && u.modulo !== null
            ? [{
                secuencia: p.secuencia, ubicacionId: u.ubicacionId, ubicacion: u.ubicacion,
                pasilloId: u.pasilloId, modulo: u.modulo, accion: p.accion,
            }]
            : [];
    });
};

/** Paradas sin posición en el mapa (sin pasillo o de otro almacén). */
export const paradasSinPasillo = (recorrido: RecorridoOrden, mapa: MapaAlmacen) => {
    const conPunto = new Set(puntosRecorrido(recorrido, mapa).map((p) => p.secuencia));
    return recorrido.paradas.filter((p) => !conPunto.has(p.secuencia));
};

/**
 * Trazo del recorrido en una zona: se entra y se sale de cada pasillo por la cabecera
 * (S con retorno); dentro de un pasillo se va de parada en parada.
 */
export const trazoRecorrido = (
    puntos: PuntoRecorrido[], geometrias: GeometriaPasillo[],
): { x: number; y: number }[] => {
    const porPasillo = new Map(geometrias.map((g) => [g.pasilloId, g]));
    const yCabecera = MEDIDAS.cabecera / 2;
    const trazo: { x: number; y: number }[] = [];
    let pasilloActual: string | null = null;
    for (const p of puntos) {
        const g = porPasillo.get(p.pasilloId);
        if (!g) continue;
        if (p.pasilloId !== pasilloActual) {
            if (pasilloActual !== null) {
                const anterior = porPasillo.get(pasilloActual)!;
                trazo.push({ x: anterior.xEje, y: yCabecera });
            }
            trazo.push({ x: g.xEje, y: yCabecera });
            pasilloActual = p.pasilloId;
        }
        trazo.push(puntoDeModulo(g, p.modulo));
    }
    if (pasilloActual !== null) trazo.push({ x: porPasillo.get(pasilloActual)!.xEje, y: yCabecera });
    return trazo;
};
