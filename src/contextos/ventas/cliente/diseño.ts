import { Entidad } from "../../comun/diseño.ts";

export type Cliente = Entidad & {
  id: string;
  nombre: string;
  id_fiscal: string;
};

export type ClienteConDirecciones = Cliente & {
  id: string;
  direcciones: DireccionCliente[];
};

export type Direccion = {
    nombre_via: string;
    tipo_via: string;
    numero: string;
    otros: string;
    cod_postal: string;
    ciudad: string;
    provincia_id: number;
    provincia: string;
    pais_id: string;
    apartado: string;
    telefono: string;
};

export type DireccionCliente = Entidad & {
  id: string;
  direccion: Direccion;
  dir_envio: boolean;
  dir_facturacion: boolean;
};
