import { Modelo } from "../diseño.js";
import { MetaModelo, modeloEsValido, modeloModificado, validacionCampoModelo } from "../dominio.js";

// ── Tipos de prueba ────────────────────────────────────────────────────────────

interface Direccion extends Modelo {
    ciudad: string;
    codigo_postal: string;
}

interface Pedido extends Modelo {
    clienteId: string;
    direccionEnvio: Direccion;
}

interface LineaPedido extends Modelo {
    sku: string;
    cantidad: number;
}

interface PedidoConLineas extends Modelo {
    clienteId: string;
    lineas: LineaPedido[];
}

// ── MetaModelos de prueba ──────────────────────────────────────────────────────

const metaDireccion: MetaModelo<Direccion> = {
    campos: {
        ciudad: { requerido: true },
        codigo_postal: {},
    },
};

const metaLineaPedido: MetaModelo<LineaPedido> = {
    campos: {
        sku: { requerido: true },
        cantidad: { tipo: "numero", positivo: true },
    },
};

const metaPedido: MetaModelo<Pedido> = {
    campos: {
        clienteId: { requerido: true },
        direccionEnvio: { meta: metaDireccion },
    },
};

const metaPedidoConLineas: MetaModelo<PedidoConLineas> = {
    campos: {
        clienteId: { requerido: true },
        lineas: { itemMeta: metaLineaPedido, minItems: 1 },
    },
};

// ── Fixtures ──────────────────────────────────────────────────────────────────

const direccionValida: Direccion = { ciudad: "Almería", codigo_postal: "04001" };
const direccionInvalida: Direccion = { ciudad: "", codigo_postal: "04001" };

const pedidoValido: Pedido = { clienteId: "CLI-1", direccionEnvio: direccionValida };
const pedidoConDireccionInvalida: Pedido = { clienteId: "CLI-1", direccionEnvio: direccionInvalida };

const lineaValida: LineaPedido = { sku: "SKU-001", cantidad: 3 };
const lineaInvalida: LineaPedido = { sku: "", cantidad: 3 };

// ── Tests: validacionCampoModelo con sub-objeto ────────────────────────────────

describe("validacionCampoModelo — campo con meta (sub-objeto)", () => {
    test("devuelve true cuando el sub-objeto es válido", () => {
        const resultado = validacionCampoModelo(metaPedido)(pedidoValido, "direccionEnvio");
        expect(resultado).toBe(true);
    });

    test("devuelve mensaje de error cuando el sub-objeto es inválido", () => {
        const resultado = validacionCampoModelo(metaPedido)(pedidoConDireccionInvalida, "direccionEnvio");
        expect(typeof resultado).toBe("string");
    });

    test("permite sub-objeto null si el campo no es requerido", () => {
        const pedidoSinDir = { clienteId: "CLI-1", direccionEnvio: null as unknown as Direccion };
        // null no es un objeto → la validación de sub-objeto no se activa
        const resultado = validacionCampoModelo(metaPedido)(pedidoSinDir, "direccionEnvio");
        expect(resultado).toBe(true);
    });
});

// ── Tests: modeloEsValido con sub-objeto ──────────────────────────────────────

describe("modeloEsValido — sub-objeto anidado", () => {
    test("válido cuando todos los campos del padre e hijo son correctos", () => {
        expect(modeloEsValido(metaPedido)(pedidoValido)).toBe(true);
    });

    test("inválido cuando el sub-objeto falla su propio meta", () => {
        expect(modeloEsValido(metaPedido)(pedidoConDireccionInvalida)).toBe(false);
    });

    test("inválido cuando el padre falla aunque el sub-objeto sea válido", () => {
        const pedidoSinCliente: Pedido = { clienteId: "", direccionEnvio: direccionValida };
        expect(modeloEsValido(metaPedido)(pedidoSinCliente)).toBe(false);
    });
});

// ── Tests: validacionCampoModelo con lista ────────────────────────────────────

describe("validacionCampoModelo — campo con itemMeta (lista)", () => {
    test("devuelve true cuando la lista tiene ítems válidos y cumple minItems", () => {
        const pedido: PedidoConLineas = { clienteId: "CLI-1", lineas: [lineaValida] };
        const resultado = validacionCampoModelo(metaPedidoConLineas)(pedido, "lineas");
        expect(resultado).toBe(true);
    });

    test("error cuando la lista está vacía y minItems es 1", () => {
        const pedido: PedidoConLineas = { clienteId: "CLI-1", lineas: [] };
        const resultado = validacionCampoModelo(metaPedidoConLineas)(pedido, "lineas");
        expect(typeof resultado).toBe("string");
    });

    test("error cuando algún ítem de la lista es inválido", () => {
        const pedido: PedidoConLineas = { clienteId: "CLI-1", lineas: [lineaValida, lineaInvalida] };
        const resultado = validacionCampoModelo(metaPedidoConLineas)(pedido, "lineas");
        expect(typeof resultado).toBe("string");
    });

    test("respeta maxItems", () => {
        const metaConMax: MetaModelo<PedidoConLineas> = {
            campos: { lineas: { itemMeta: metaLineaPedido, maxItems: 2 } },
        };
        const pedido: PedidoConLineas = {
            clienteId: "CLI-1",
            lineas: [lineaValida, lineaValida, lineaValida],
        };
        const resultado = validacionCampoModelo(metaConMax)(pedido, "lineas");
        expect(typeof resultado).toBe("string");
    });

    test("lista válida con múltiples ítems correctos", () => {
        const pedido: PedidoConLineas = {
            clienteId: "CLI-1",
            lineas: [lineaValida, { sku: "SKU-002", cantidad: 5 }],
        };
        const resultado = validacionCampoModelo(metaPedidoConLineas)(pedido, "lineas");
        expect(resultado).toBe(true);
    });
});

// ── Tests: modeloEsValido con lista ───────────────────────────────────────────

describe("modeloEsValido — lista de ítems", () => {
    test("válido con al menos un ítem válido", () => {
        const pedido: PedidoConLineas = { clienteId: "CLI-1", lineas: [lineaValida] };
        expect(modeloEsValido(metaPedidoConLineas)(pedido)).toBe(true);
    });

    test("inválido con lista vacía (minItems: 1)", () => {
        const pedido: PedidoConLineas = { clienteId: "CLI-1", lineas: [] };
        expect(modeloEsValido(metaPedidoConLineas)(pedido)).toBe(false);
    });

    test("inválido si algún ítem no pasa su propio meta", () => {
        const pedido: PedidoConLineas = { clienteId: "CLI-1", lineas: [lineaInvalida] };
        expect(modeloEsValido(metaPedidoConLineas)(pedido)).toBe(false);
    });
});

// ── Tests: modeloModificado con sub-objeto ────────────────────────────────────

describe("modeloModificado — comparación profunda de sub-objetos", () => {
    test("no modificado cuando el sub-objeto tiene los mismos valores (aunque sea objeto distinto)", () => {
        const pedidoA: Pedido = { clienteId: "CLI-1", direccionEnvio: { ciudad: "Almería", codigo_postal: "04001" } };
        const pedidoB: Pedido = { clienteId: "CLI-1", direccionEnvio: { ciudad: "Almería", codigo_postal: "04001" } };
        expect(modeloModificado(pedidoA, pedidoB, metaPedido)).toBe(false);
    });

    test("modificado cuando cambia un campo del sub-objeto", () => {
        const pedidoA: Pedido = { clienteId: "CLI-1", direccionEnvio: { ciudad: "Almería", codigo_postal: "04001" } };
        const pedidoB: Pedido = { clienteId: "CLI-1", direccionEnvio: { ciudad: "Madrid", codigo_postal: "04001" } };
        expect(modeloModificado(pedidoA, pedidoB, metaPedido)).toBe(true);
    });
});

// ── Tests: modeloModificado con lista ────────────────────────────────────────

describe("modeloModificado — comparación profunda de listas", () => {
    test("no modificado cuando la lista tiene los mismos ítems", () => {
        const pedidoA: PedidoConLineas = { clienteId: "CLI-1", lineas: [{ sku: "SKU-001", cantidad: 3 }] };
        const pedidoB: PedidoConLineas = { clienteId: "CLI-1", lineas: [{ sku: "SKU-001", cantidad: 3 }] };
        expect(modeloModificado(pedidoA, pedidoB, metaPedidoConLineas)).toBe(false);
    });

    test("modificado cuando cambia la cantidad de un ítem", () => {
        const pedidoA: PedidoConLineas = { clienteId: "CLI-1", lineas: [{ sku: "SKU-001", cantidad: 3 }] };
        const pedidoB: PedidoConLineas = { clienteId: "CLI-1", lineas: [{ sku: "SKU-001", cantidad: 5 }] };
        expect(modeloModificado(pedidoA, pedidoB, metaPedidoConLineas)).toBe(true);
    });

    test("modificado cuando se añade un ítem a la lista", () => {
        const pedidoA: PedidoConLineas = { clienteId: "CLI-1", lineas: [lineaValida] };
        const pedidoB: PedidoConLineas = { clienteId: "CLI-1", lineas: [lineaValida, lineaValida] };
        expect(modeloModificado(pedidoA, pedidoB, metaPedidoConLineas)).toBe(true);
    });

    test("sin meta sigue funcionando con comparación superficial", () => {
        const a = { x: 1 };
        const b = { x: 1 };
        // Sin meta, compara por referencia: x === x (mismo número) → no modificado
        expect(modeloModificado(a, b)).toBe(false);
    });
});
