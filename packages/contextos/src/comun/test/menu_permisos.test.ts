import { aplanarMenu } from "@olula/componentes/menu/dominio.ts";
import { puedeAlguna } from "@olula/lib/dominio.ts";
import { crearMenu, ElementoMenu, MenuContextFactory } from "@olula/lib/menu.ts";
import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { menuAlmacen } from "../../almacen/menu.ts";
import { menuCompras } from "../../compras/menu.ts";
import { menuCrm } from "../../crm/menu.ts";
import { menuPredicciones } from "../../predicciones/menu.ts";
import { menuTesoreria } from "../../tesoreria/menu.ts";
import { menuVentas } from "../../ventas/menu.ts";

const menus = { menuAlmacen, menuCompras, menuCrm, menuPredicciones, menuTesoreria, menuVentas };
const menu = crearMenu(Object.fromEntries(
    Object.entries(menus).map(([k, m]) => [k, { menu: m } as unknown as MenuContextFactory]),
)) as ElementoMenu[];

/** Grupo como el del usuario «ventas»: General denegado y las líneas de Ventas permitidas. */
const grupoSoloVentas = [
    { id_regla: "general", valor: false },
    ...["ventas.cliente", "ventas.factura", "ventas.pedido", "ventas.albaran", "ventas.presupuesto", "ventas.agente"]
        .map((id_regla) => ({ id_regla, valor: true })),
];

const gruposVisibles = () => [...new Set(aplanarMenu(menu, puedeAlguna).map((p) => p.grupo))];

describe("menú según los permisos del grupo", () => {
    beforeEach(() => localStorage.setItem("whoami", JSON.stringify({ permisos: grupoSoloVentas, plugins: {} })));
    afterEach(() => localStorage.removeItem("whoami"));

    test("un grupo con sólo Ventas no ve los Resumen ni las opciones de otros módulos", () => {
        expect(gruposVisibles()).toEqual(["Ventas"]);
    });

    test("el Resumen de un módulo se ve si se puede alguna de sus opciones", () => {
        localStorage.setItem("whoami", JSON.stringify({
            permisos: [...grupoSoloVentas, { id_regla: "almacen.stock", valor: true }], plugins: {},
        }));
        const almacen = aplanarMenu(menu, puedeAlguna).filter((p) => p.grupo === "Almacén").map((p) => p.nombre);
        expect(almacen).toContain("Resumen");
        expect(almacen).toContain("Stock");
    });

    test("CRM > Agentes depende de los permisos de CRM", () => {
        localStorage.setItem("whoami", JSON.stringify({
            permisos: [...grupoSoloVentas, { id_regla: "crm.agente", valor: true }], plugins: {},
        }));
        const crm = aplanarMenu(menu, puedeAlguna).filter((p) => p.grupo === "CRM").map((p) => p.nombre);
        expect(crm).toEqual(["Resumen", "Agentes"]);
    });
});
