/**
 * Configuración de empresa: el grupo de IVA de negocio de los datos generales de
 * facturación del escritorio (`facturac_general.codgrupoivaneg`).
 */
export interface ConfigEmpresa {
    /** G.IVA Negocio: código de `gruposcontablesivaneg`. Obligatorio; vacío si no se ha configurado. */
    grupoIvaNegocioId: string;
}

export type GetConfigEmpresa = () => Promise<ConfigEmpresa>;

export type PatchConfigEmpresa = (config: ConfigEmpresa) => Promise<void>;
