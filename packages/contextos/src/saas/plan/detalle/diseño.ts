export type EstadoDetallePlan = 'ABIERTO' | 'BORRANDO' | 'DUPLICANDO';

export type ContextoDetallePlan = {
    estado: EstadoDetallePlan;
};
