/**
 * URLs de API para el módulo CRM
 * Patrón: clase con propiedades readonly
 */

class CRM_Urls {
    readonly INCIDENCIA = `/crm/incidencia`;
    readonly TAREA = `/crm/tarea`;
    readonly TAREA_INCIDENCIA = `/crm/tarea_de_incidencia`;
    readonly NOTA_INCIDENCIA = `/crm/notaincidencia`;
    readonly DOCUMENTO_INCIDENCIA = `/documental/documento`;
    readonly CATEGORIA_INCIDENCIA = `/crm/catincidencia`;
    readonly SUBCATEGORIA_INCIDENCIA = `/crm/subcatincidencia`;
}

export default CRM_Urls;
