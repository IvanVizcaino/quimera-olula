import { Criteria } from "../diseño.js";

export type RespuestaGetItem<T> = {
  datos: T
}

export type RespuestaGetLista<T> = {
  datos: T[],
}

export type RespuestaGetQuery<T> = {
  datos: T[],
  total: number,
}

export type API = {
  get: <T>(url: string, msgError?: string, headers?: Record<string, string>) => Promise<T>;
  getQuery: <T, TAPI>(
    url: string,
    criteria: Criteria,
    conversor?: (t: TAPI) => T,
    msgError?: string,
  ) => Promise<RespuestaGetQuery<T>>;
  getLista: <T, TAPI>(
    url: string,
    conversor: (t: TAPI) => T,
    msgError?: string,
  ) => Promise<T[]>;
  getItem: <T, API>(
    url: string,
    conversor: (t: API) => T,
    msgError?: string
  ) => Promise<T>;
  query: <T, R>(url: string, body: T, msgError?: string) => Promise<R>;
  post: <T>(url: string, body: T, msgError?: string, headers?: Record<string, string>) => Promise<{ id: string }>;
  put: <T>(url: string, body: T, msgError?: string) => Promise<void>;
  patch: <T>(url: string, body: Partial<T>, msgError?: string, headers?: Record<string, string>) => Promise<void>;
  delete: (url: string, msgError?: string, headers?: Record<string, string>) => Promise<void>;
  blob: (url: string, msgError?: string) => Promise<Blob>;
  postBlob: <T>(url: string, body: T, msgError?: string) => Promise<Blob>;
};
