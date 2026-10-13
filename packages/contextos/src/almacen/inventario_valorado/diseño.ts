import { Criteria, Entidad } from "@olula/lib/diseño.ts";

export interface LineaInventarioValorado extends Entidad {
    almacenId: string;
    almacenNombre: string;
    referencia: string;
    descripcion: string;
    cantidad: number;
    precioUnitario: number;
    valor: number;
    tipoValoracion: string;
}

export interface TotalesInventarioValorado {
    totalGeneral: number;
    porAlmacen: Record<string, number>;
}

export interface InventarioValoradoLeido {
    lineas: LineaInventarioValorado[];
    totales: TotalesInventarioValorado;
    total: number;
}

export type GetInventarioValorado = (criteria: Criteria) => Promise<InventarioValoradoLeido>;
export type GetReportInventarioValorado = (criteria: Criteria) => Promise<Blob>;
