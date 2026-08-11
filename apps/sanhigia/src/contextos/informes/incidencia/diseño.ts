export type FiltroInformeIncidencias = {
    agenteId: string;
    fechaDesde: string;
    fechaHasta: string;
    estado?: string;
    prioridad?: string;
    tipoIncidencia?: string;
    categoriaId?: string;
    subcategoriaId?: string;
    clienteId?: string;
    codigoCausante?: string;
    articuloId?: string;
};

export type GetInformeIncidencias = (filtro: FiltroInformeIncidencias) => Promise<Blob>;
