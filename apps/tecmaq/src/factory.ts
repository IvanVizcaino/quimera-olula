import { FactoryAlmacenOlula } from '#/almacen/factory.ts';
import { FactoryAuthOlula } from '#/auth/factory.ts';
import { FactoryComprasOlula } from '#/compras/factory.ts';
import { FactoryComunOlula } from '#/comun/factory.ts';
import { SelectorEmpresaActual } from '#/empresa/empresa/componentes/SelectorEmpresaActual.tsx';
import { FactoryEmpresaOlula } from '#/empresa/factory.ts';
import { FactoryFiscalOlula } from '#/fiscal/factory.ts';
import { FactoryVentasOlula } from '#/ventas/factory.ts';
import { FactoryComponentesOlula } from '@olula/componentes/factory.ts';

// Componentes de olula con el selector de empresa en la cabecera (sin asistente IA).
class FactoryComponentesTecmaq extends FactoryComponentesOlula {
    static cabecera_acciones = SelectorEmpresaActual;
}

// De Comun, tecmaq usa «Tablas generales» y la credenciales de «Administración»:
// fuera «Asistente IA» y «Dashboards», que no están entre sus módulos.
const menuComunTecmaq = Object.fromEntries(
    Object.entries(FactoryComunOlula.menu).filter(
        ([ruta]) => !ruta.startsWith("Asistente IA") && !ruta.startsWith("Dashboards"),
    ),
) as typeof FactoryComunOlula.menu;
class FactoryComunTecmaq extends FactoryComunOlula {
    static menu = menuComunTecmaq;
}

/**
 * Tecmaq (Maquinaria Solitec SL) hereda de olula: Ventas, Compras, Almacén, Fiscalidad,
 * Empresa, Tablas generales (Comun) y Administración (Auth). Sin Contabilidad,
 * Tesorería, CRM, TPV, RR. HH., Proyectos, Predicciones ni Asistente IA: la
 * contabilidad y la tesorería las sigue llevando en Eneboo.
 */
export class FactoryTecmaq {
    Inicio = { menu: { "Inicio": { url: "/", icono: "inicio" } } };
    Componentes = FactoryComponentesTecmaq;
    Ventas = FactoryVentasOlula;
    Almacen = FactoryAlmacenOlula;
    Compras = FactoryComprasOlula;
    Fiscal = FactoryFiscalOlula;
    Empresa = FactoryEmpresaOlula;
    Comun = FactoryComunTecmaq;
    Auth = FactoryAuthOlula;
}

export default FactoryTecmaq;
