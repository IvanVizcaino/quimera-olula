import { ClausulaFiltro } from "@olula/lib/diseño.ts";
import { ListaActivaEntidades } from "@olula/lib/ListaActivaEntidades.js";
import {
    MovimientoBancario,
    ResumenConciliacionAutomatica,
    ResumenSincronizacionMovimientoBancario,
} from "../diseño.js";

/**
 * SINCRONIZANDO: mientras dura la llamada a `/movimiento_bancario/sincronizar`
 * (ver maestro/SincronizarMovimientoBancario.tsx, que muestra el spinner y
 * lanza la petición al montarse, igual que ConectarBancoConexionBancaria.tsx).
 */
export type EstadoMaestroConciliacion = 'INICIAL' | 'SINCRONIZANDO' | 'CONCILIANDO_AUTOMATICAMENTE';

export type ContextoMaestroConciliacion = {
    estado: EstadoMaestroConciliacion;
    movimientos: ListaActivaEntidades<MovimientoBancario>;
    /**
     * Cuenta bancaria de la empresa (`cuentasbanco.codcuenta`) de la URL
     * `/tesoreria/cuentas_bancarias/<cuenta_id>/conciliacion`: la lista se limita
     * siempre a sus movimientos, sea cual sea el filtro del usuario.
     */
    cuentaBancoId: string;
    /** Resumen a mostrar tras sincronizar (ver ResumenSincronizacionMovimientoBancario.tsx). */
    resumenSincronizacion: ResumenSincronizacionMovimientoBancario | null;
    /** Resumen a mostrar tras "Conciliar automáticamente" (ver ResumenConciliacionAutomatica.tsx). */
    resumenConciliacionAutomatica: ResumenConciliacionAutomatica | null;
    /**
     * Se incrementa cada vez que termina una sincronización o conciliación automática.
     * Sirve de trigger para recargar el PanelCuadreBancario.
     */
    versionCuadre: number;
    /**
     * Cláusulas de filtro impuestas por el panel de cuadre bancario (badge clickado).
     * No son editables por el usuario — se muestran como indicador dismissable y se
     * aplican siempre a la consulta junto con los filtros del usuario.
     * Lista vacía = modo libre (sin filtro de cuadre activo).
     */
    filtrosCuadre: ClausulaFiltro[];
    /**
     * Texto legible del filtro de cuadre activo (e.g. "sin conciliar").
     * null cuando no hay filtro de cuadre.
     */
    etiquetaCuadre: string | null;
};
