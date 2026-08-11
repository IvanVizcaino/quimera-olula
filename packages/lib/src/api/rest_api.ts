import { Criteria } from "../diseño.ts";
import { criteriaAQueryString } from "../infraestructura.ts";
import type { API, RespuestaGetItem, RespuestaGetLista, RespuestaGetQuery } from "./diseño.ts";
import { tokenAcceso } from "./token_acceso.ts";

const BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

const llamada = async <T>({ method, url, headers = {}, body, msgError }: {
  method: string,
  url: string,
  headers?: Record<string, string>,
  body?: T,
  msgError?: string
}): Promise<Response> => {
  const isFormData = body instanceof FormData;

  const response = await fetch(`${BASE}${url}`, {
    method,
    headers: {
      "Authorization": `Bearer ${tokenAcceso.obtener() ?? ""}`,
      ...headers,
    },
    body: isFormData ? body : (body ? JSON.stringify(body) : undefined),
  });

  // if ([401, 403].includes(response.status)) {
  //   window.location.href = "/login";
  //   return Promise.reject();
  // }

  if (!response.ok) {
    const errorText = await response.text();
    const error = {
      nombre: msgError || `Error ${response.status}`,
      descripcion: errorText,
    };
    return Promise.reject(error);
  }

  return response;
};

const consulta = async <T>(
  url: string,
  msgError?: string
): Promise<T> => {
  return llamada({ method: "GET", url, headers: { "Content-Type": "application/json" }, msgError })
    .then(r => r.json() as Promise<T>);
};

const comando = async <T, U>(
  method: string,
  url: string,
  msgError?: string,
  body?: Partial<T>
): Promise<U> => {
  const isFormData = body instanceof FormData;
  const headers: Record<string, string> = isFormData ? {} : { "Content-Type": "application/json" };

  return llamada({ method, url, headers, body, msgError })
    .then(r => {
      const contentType = r.headers.get('content-type');
      const textoPlano = contentType?.startsWith('text/plain');

      return (textoPlano ? r.text().then(t => ({ respuesta: t })) : r.json()) as Promise<U>;
    });
};

const obtenerBlob = async (
  url: string,
  msgError?: string
): Promise<Blob> => {
  return llamada({ method: "GET", url, msgError })
    .then(r => r.blob());
};

const enviarPostBlob = async <T>(
  url: string,
  body: T,
  msgError?: string
): Promise<Blob> => {
  const isFormData = body instanceof FormData;
  const headers: Record<string, string> = isFormData ? {} : { "Content-Type": "application/json" };

  return llamada({ method: "POST", url, headers, body, msgError })
    .then(r => r.blob());
};

export const getQuery = async <T, TAPI>(
  url: string,
  criteria: Criteria,
  conversor?: (t: TAPI) => T,
  msgError?: string,
): Promise<RespuestaGetQuery<T>> => {

  const q = criteriaAQueryString(criteria);
  const respuesta = await consulta<RespuestaGetQuery<TAPI>>(
    `${url}${q}`, msgError
  )
  return {
    datos: conversor
      ? respuesta.datos.map(conversor)
      : respuesta.datos as unknown as T[],
    total: respuesta.total,
  };
};

export const getLista = async <T, TAPI>(
  url: string,
  conversor: (t: TAPI) => T,
  msgError?: string,
): Promise<T[]> => {

  const respuesta = await consulta<RespuestaGetLista<TAPI>>(
    url, msgError
  )
  return respuesta.datos.map(conversor);
};

export const getItem = async <T, TAPI>(
  url: string,
  conversor: (t: TAPI) => T,
  msgError?: string,
): Promise<T> => {

  const respuesta = await consulta<RespuestaGetItem<TAPI>>(
    url, msgError
  )
  return conversor(respuesta.datos)

};

export const RestAPI: API = {
  get: <T>(url: string, msgError?: string) => consulta<T>(url, msgError),
  getLista: getLista,
  getQuery: getQuery,
  getItem: getItem,
  post: <T>(url: string, body: T, msgError?: string) => comando<T, { id: string }>("POST", url, msgError, body),
  put: <T>(url: string, body: T, msgError?: string) => comando<T, void>("PUT", url, msgError, body),
  patch: <T>(url: string, body: Partial<T>, msgError?: string) => comando<T, void>("PATCH", url, msgError, body),
  delete: (url: string, msgError?: string) => comando("DELETE", url, msgError),
  blob: (url: string, msgError?: string) => obtenerBlob(url, msgError),
  postBlob: <T>(url: string, body: T, msgError?: string) => enviarPostBlob(url, body, msgError),
}
