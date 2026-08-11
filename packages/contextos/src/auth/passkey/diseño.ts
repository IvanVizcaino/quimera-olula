import { UsuarioLogin } from "../login/diseño.ts";

export type RespuestaIniciarAutenticacion = { session_id: string } & Record<string, unknown>;
export type IniciarRegistro = (email: string) => Promise<unknown>;
export type FinalizarRegistro = (usuario_id: string, credential: string, nombre?: string | null) => Promise<void>;
export type IniciarAutenticacion = () => Promise<RespuestaIniciarAutenticacion>;
export type FinalizarAutenticacion = (credential: string, session_id: string) => Promise<UsuarioLogin>;
export type SolicitarEnlaceMagico = (email: string) => Promise<void>;
export type VerificarEnlaceMagico = (token: string) => Promise<UsuarioLogin>;
