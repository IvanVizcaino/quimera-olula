import { FactoryAlmacenOlula } from '#/almacen/factory.ts';
import { FactoryAuthOlula } from '#/auth/factory.ts';
import { FactoryComprasOlula } from '#/compras/factory.ts';
import { FactoryComunOlula } from '#/comun/factory.ts';
import { FactoryContabilidadOlula } from '#/contabilidad/factory.ts';
import { SelectorEmpresaActual } from '#/empresa/empresa/componentes/SelectorEmpresaActual.tsx';
import { FactoryEmpresaOlula } from '#/empresa/factory.ts';
import { FactoryFiscalOlula } from '#/fiscal/factory.ts';
import { FactoryTesoreriaOlula } from '#/tesoreria/factory.ts';
import { FactoryVentasOlula } from '#/ventas/factory.ts';
import { FactoryComponentesOlula } from '@olula/componentes/factory.ts';
import { AsistenteLateralAlmafiber } from './AsistenteLateral.tsx';

// Componentes de olula con el asistente lateral y el selector de empresa en la
// cabecera, como la app de olula.
class FactoryComponentesAlmafiber extends FactoryComponentesOlula {
    static panel_asistente = AsistenteLateralAlmafiber;
    static cabecera_acciones = SelectorEmpresaActual;
}

// De Comun, almafiber usa «Tablas generales» y «Asistente IA»: fuera el menú
// «Dashboards» (los cuadros de mando personales), que no está entre sus módulos.
const { Dashboards: _dashboards, ...menuComunAlmafiber } = FactoryComunOlula.menu;
class FactoryComunAlmafiber extends FactoryComunOlula {
    static menu = menuComunAlmafiber as typeof FactoryComunOlula.menu;
}

/**
 * Almafiber hereda de olula: Ventas, Almacén, Compras, Contabilidad, Fiscalidad,
 * Tesorería, Empresa, Tablas generales y Asistente IA (Comun) y Administración
 * (Auth). Sin CRM, TPV, RR. HH., Proyectos ni Predicciones.
 */
export class FactoryAlmafiber {
    Inicio = { menu: { "Inicio": { url: "/", icono: "inicio" } } };
    Componentes = FactoryComponentesAlmafiber;
    Ventas = FactoryVentasOlula;
    Almacen = FactoryAlmacenOlula;
    Compras = FactoryComprasOlula;
    Contabilidad = FactoryContabilidadOlula;
    Fiscal = FactoryFiscalOlula;
    Tesoreria = FactoryTesoreriaOlula;
    Empresa = FactoryEmpresaOlula;
    Comun = FactoryComunAlmafiber;
    Auth = FactoryAuthOlula;
}

export default FactoryAlmafiber;
