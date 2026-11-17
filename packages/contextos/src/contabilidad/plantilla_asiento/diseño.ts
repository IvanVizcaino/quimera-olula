import { Criteria, Entidad, Modelo, RespuestaLista } from "@olula/lib/diseño.ts";

/**
 * Plantillas de asiento (asientos predefinidos) de Eneboo: `co_planasientos`
 * y sus partidas predefinidas `co_planpartidas`. Los campos `tipo*` guardan
 * los literales de Eneboo, que son los que viajan por la API.
 */
export type TipoSubcuentaPlantilla = "Establecer" | "Pedir" | "Definida";
export type DebeHaberPlantilla = "Debe" | "Haber";
export type TipoImportePlantilla = "Pedir" | "Calcular" | "Cuadrar";
export type TipoConceptoPlantilla = "Establecer" | "Pedir" | "Último" | "Definido";
export type TipoDocumentoPlantilla = "Establecer" | "Pedir" | "Último";
export type TipoDocumentoOrigen = "" | "Recibo" | "Factura de cliente" | "Factura de proveedor";
export type TipoFacturaPlantilla = "Pedir" | "No pedir" | "Auto";
export type TipoBaseImponiblePlantilla = "Pedir" | "Calcular";

export interface CamposPartidaPlantilla extends Modelo {
    numeroOrden: number;
    tipoSubcuenta: TipoSubcuentaPlantilla;
    codigoSubcuenta: string;
    variableSubcuenta: string;
    debeHaber: DebeHaberPlantilla;
    saltarSiCero: boolean;
    tipoImporte: TipoImportePlantilla;
    importe: string;
    variableImporte: string;
    tipoConcepto: TipoConceptoPlantilla;
    concepto: string;
    variableConcepto: string;
    tipoDocumento: TipoDocumentoPlantilla;
    documento: string;
    tipoDocumentoOrigen: TipoDocumentoOrigen;
    tipoFactura: TipoFacturaPlantilla;
    serieId: string;
    tipoBaseImponible: TipoBaseImponiblePlantilla;
    baseImponible: string;
    variableBaseImponible: string;
    tipoContrapartida: TipoSubcuentaPlantilla;
    codigoContrapartida: string;
    variableContrapartida: string;
}

export interface PartidaPlantilla extends Entidad, CamposPartidaPlantilla {
    id: string;
}

export type NuevaPartidaPlantilla = CamposPartidaPlantilla;
export type CambiosPartidaPlantilla = Partial<CamposPartidaPlantilla>;

export interface ItemPlantillaAsiento extends Entidad {
    id: string;
    descripcion: string;
    concatenar: string;
}

export interface PlantillaAsiento extends ItemPlantillaAsiento {
    partidas: PartidaPlantilla[];
}

export interface NuevaPlantillaAsiento extends Modelo {
    codigo: string;
    descripcion: string;
    concatenar: string;
}

export type CambiosPlantillaAsiento = Partial<Pick<PlantillaAsiento, "descripcion" | "concatenar">>;

/** Lo que el usuario introduce para una partida al generar el asiento. */
export interface ValoresPartidaPlantilla {
    codigoSubcuenta?: string;
    importe?: number;
    concepto?: string;
    documento?: string;
    codigoContrapartida?: string;
    baseImponible?: number;
    numeroFactura?: string;
}

/** Por id de partida de la plantilla. */
export type ValoresPlantilla = Record<string, ValoresPartidaPlantilla>;

export interface PartidaCalculada {
    partidaPlantillaId: string;
    numeroOrden: number;
    codigoSubcuenta: string;
    debe: number;
    haber: number;
    concepto: string;
    documento: string;
    tipoDocumento: string;
    codigoContrapartida: string;
    esIva: boolean;
    baseImponible: number | null;
    serieId: string;
    numeroFactura: string;
    omitida: boolean;
}

export interface ResultadoCalculoPlantilla {
    plantillaId: string;
    partidas: PartidaCalculada[];
    descuadre: number;
    variables: Record<string, string>;
    siguientePlantillaId: string;
    avisos: string[];
}

export interface PeticionAsientoDesdePlantilla {
    plantillaId: string;
    ejercicioId: string;
    fecha?: Date;
    concepto?: string;
    valores: ValoresPlantilla;
    variables: Record<string, string>;
}

export type GetPlantillaAsiento = (id: string) => Promise<PlantillaAsiento>;
export type GetPlantillasAsiento = (criteria: Criteria) => RespuestaLista<ItemPlantillaAsiento>;
export type PostPlantillaAsiento = (nueva: NuevaPlantillaAsiento) => Promise<string>;
export type PatchPlantillaAsiento = (id: string, cambios: CambiosPlantillaAsiento) => Promise<void>;
export type DeletePlantillaAsiento = (id: string) => Promise<void>;
export type PostPartidaPlantilla = (id: string, nueva: NuevaPartidaPlantilla) => Promise<string>;
export type PatchPartidaPlantilla = (id: string, partidaId: string, cambios: CambiosPartidaPlantilla) => Promise<void>;
export type DeletePartidaPlantilla = (id: string, partidaId: string) => Promise<void>;
export type CalcularAsientoDesdePlantilla = (peticion: PeticionAsientoDesdePlantilla) => Promise<ResultadoCalculoPlantilla>;
export type PostAsientoDesdePlantilla = (peticion: PeticionAsientoDesdePlantilla) => Promise<{ id: string; numero: number }>;
