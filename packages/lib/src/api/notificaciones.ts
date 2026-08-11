import { criteriaQuery } from "../infraestructura.ts";
import { RestAPI } from "./rest_api.ts";

const COMUNICACIONES_URL = "/comun/comunicacion";
const ESTADO_COMUNICACION_NO_LEIDA = "No leida";

export const getTotalComunicacionesNoLeidas = async (): Promise<number> => {
  const query = criteriaQuery(
    [["estado", "=", ESTADO_COMUNICACION_NO_LEIDA]],
    [],
    { pagina: 1, limite: 1 }
  );

  const respuesta = await RestAPI.get<{ total?: number }>(
    `${COMUNICACIONES_URL}${query}`
  );

  return typeof respuesta.total === "number" ? respuesta.total : 0;
};
