import { Tab, Tabs } from "@olula/componentes/detalle/tabs/Tabs.tsx";
import { puede } from "@olula/lib/dominio.ts";
import { MaestroConDetalleCuenta } from "../cuenta/maestro/MaestroConDetalleCuenta.tsx";
import { MaestroConDetalleCuentaEspecial } from "../cuenta_especial/maestro/MaestroConDetalleCuentaEspecial.tsx";
import { MaestroConDetalleEpigrafe } from "../epigrafe/maestro/MaestroConDetalleEpigrafe.tsx";
import { MaestroConDetalleGrupoEpigrafe } from "../grupo_epigrafe/maestro/MaestroConDetalleGrupoEpigrafe.tsx";
import { MaestroConDetalleSubcuenta } from "../subcuenta/maestro/MaestroConDetalleSubcuenta.tsx";

/**
 * Plan General Contable: una sola pantalla con las cinco vistas del plan.
 *
 * Carga perezosa: `Tabs` renderiza únicamente la pestaña activa
 * (`{tabs[indice]}`), así que el maestro de Cuentas no se monta —y por tanto
 * no pide datos— hasta que se pulsa su pestaña. No hace falta nada más.
 *
 * Contrapartida: al cambiar de pestaña la anterior se desmonta y pierde su
 * selección y sus filtros. Si algún día hay que conservarlos, la solución es
 * subir las listas a este contenedor, NO volver a los url-params: los dos
 * maestros comparten ruta y se pisarían el `id` y los filtros del query string.
 */
export const PantallaPgc = () => {
    // crearRouter no comprueba permisos, así que la pantalla se monta aunque
    // se llegue por URL: la guarda tiene que estar aquí.
    if (!puede("contabilidad.asiento")) {
        return <p>No tienes permiso para ver el plan general contable.</p>;
    }

    return (
        <div className="PantallaPgc">
            <Tabs children={[
                <Tab label="Subcuentas"
                    key="tab-subcuentas"
                    children={<MaestroConDetalleSubcuenta />}
                />,
                <Tab label="Cuentas"
                    key="tab-cuentas"
                    children={<MaestroConDetalleCuenta />}
                />,
                <Tab label="Cuentas especiales"
                    key="tab-cuentas-especiales"
                    children={<MaestroConDetalleCuentaEspecial />}
                />,
                <Tab label="Subgrupos"
                    key="tab-subgrupos"
                    children={<MaestroConDetalleEpigrafe />}
                />,
                <Tab label="Grupos"
                    key="tab-grupos"
                    children={<MaestroConDetalleGrupoEpigrafe />}
                />,
            ]} />
        </div>
    );
};
