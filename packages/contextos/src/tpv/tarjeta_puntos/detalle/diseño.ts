import { TarjetaPuntos } from "../diseño.ts";

export type EstadoTarjetaPuntos = "INICIAL" | "Editando";

export type ContextoTarjetaPuntos = {
    estado: EstadoTarjetaPuntos;
    tarjeta: TarjetaPuntos;
    tarjetaInicial: TarjetaPuntos;
};
