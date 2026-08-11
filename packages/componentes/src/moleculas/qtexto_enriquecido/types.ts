export type NodoTexto = {
    tipo: "texto";
    contenido: string;
};

export type NodoMarca = {
    tipo: "marca";
    marca: string;
    hijos: Nodo[];
};

export type NodoReferencia = {
    tipo: "referencia";
    clave: string;
    criterios: Record<string, string>;
    etiqueta: string;
};

export type Nodo = NodoTexto | NodoMarca | NodoReferencia;

export type DatosReferencia = {
    clave: string;
    id: string;
    criterios: Record<string, string>;
    etiqueta: string;
};

export type ResolverReferencia = (
    referencia: DatosReferencia
) => string | undefined;

export type QTextoEnriquecidoProps = {
    texto: string;
    className?: string;
    resolvers?: Record<string, ResolverReferencia>;
};
