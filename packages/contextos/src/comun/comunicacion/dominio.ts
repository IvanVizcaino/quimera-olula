import { Comunicacion, ESTADOS_COMUNICACION } from "./diseño.ts";

export const comunicacionVacia = (): Comunicacion => ({
    id: "",
    usuarioDestinoId: "",
    estado: ESTADOS_COMUNICACION.NO_LEIDA,
    asunto: "",
    cuerpo: "",
    fechaEnvio: new Date(),
    fechaLectura: null,
    fechaBorrado: null,
});
