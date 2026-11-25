import { describe, expect, it } from "vitest";
import { ComponenteTerminal, LineaConsumo, TareaTerminal, TramoTerminal } from "../diseño.ts";
import {
    accionTerminal,
    anadirLoteLeido,
    atajoOperario,
    atajoTarea,
    cantidadPendienteTarea,
    cantidadPropuestaLote,
    cantidadPropuestaTramo,
    consumoLinea,
    cuerpoDeclarar,
    cuerpoEditarTramo,
    estadoTerminalInicial,
    EstadoTerminal,
    filtroListaTerminal,
    formatearCodigoTarea,
    lineaBajoMinimo,
    lineasDeTramo,
    lineasIniciales,
    motivoCantidadTramo,
    motivoOperarioNoValido,
    previstoTramo,
    textoError,
    transicionTerminal,
    validarConsumos,
} from "../dominio.ts";

const componente = (c: Partial<ComponenteTerminal> = {}): ComponenteTerminal => ({
    componenteId: "11", articuloId: "HILO", descripcion: "Hilo", cantidadUnidad: 2, previsto: 200, consumido: 0,
    pendiente: 200, porLotes: true, minimo: 80, puedeCerrar: true, lotes: [], ...c,
});
const tela = componente({ componenteId: "12", articuloId: "TINTE", descripcion: "Tinte", cantidadUnidad: 0.1, previsto: 10, pendiente: 10, porLotes: false });

const tarea = (t: Partial<TareaTerminal> = {}): TareaTerminal => ({
    id: "TA000001", procesoId: "1", ordenId: "OP1", estado: "PTE", codigo: "T1", descripcion: "Tejer", tareaProcesoId: "1",
    tipoTareaId: "TEJER", tipoProcesoId: "P", orden: 1, inicial: true, final: false, terminaEnUnPaso: false, centroId: "C1",
    realizadaPor: "", trabajador: "", diaInicio: "", tiempoInicio: "", diaFin: "", tiempoFin: "", intervalo: null,
    tiempoInvertido: null, estadoProceso: "PTE", estadoOrden: "PTE", loteId: "L1", articuloId: "TELA", articulo: "Tela",
    cantidad: 100, cantidadHecha: 0, unidad: "Horas", ...t,
});

const config = { decimales: 2, maximoTramo: null as number | null, usarTramos: true };

describe("terminal: códigos y atajos", () => {
    it("formatea el código de tarea con ceros hasta 6 dígitos", () => {
        expect(formatearCodigoTarea("ta12")).toBe("TA000012");
        expect(formatearCodigoTarea(" TA000012 ")).toBe("TA000012");
        expect(formatearCodigoTarea("12")).toBe("TA000012");
        expect(formatearCodigoTarea("TB1")).toBe("TB000001");
        expect(formatearCodigoTarea("")).toBe("");
        expect(formatearCodigoTarea("XYZ")).toBe("XYZ");
    });

    it("atajos de la tarea: / limpia, * escribe TA, . rellena con ceros", () => {
        expect(atajoTarea("TA12", "/")).toEqual({ tipo: "limpiar" });
        expect(atajoTarea("algo", "*")).toEqual({ tipo: "valor", valor: "TA" });
        expect(atajoTarea("TA12", ".")).toEqual({ tipo: "valor", valor: "TA000012" });
        expect(atajoTarea("TA12", "3")).toEqual({ tipo: "ninguno" });
        expect(atajoOperario("/")).toEqual({ tipo: "limpiar" });
        expect(atajoOperario("*")).toEqual({ tipo: "ninguno" });
    });

    it("rechaza el operario que no existe o está de baja", () => {
        expect(motivoOperarioNoValido({ codigo: "X", existe: false, nombre: "", deBaja: false })).toBe("El operario X no existe");
        expect(motivoOperarioNoValido({ codigo: "T1", existe: true, nombre: "Ana", deBaja: true })).toBe("El operario T1 (Ana) está de baja");
        expect(motivoOperarioNoValido({ codigo: "T1", existe: true, nombre: "Ana", deBaja: false })).toBeNull();
    });
});

describe("terminal: acción según el estado y la configuración", () => {
    it("PTE y EN PAUSA se inician (de un paso, inicia y termina)", () => {
        expect(accionTerminal(tarea(), config)).toEqual({ tipo: "iniciar", texto: "Iniciar" });
        expect(accionTerminal(tarea({ estado: "EN PAUSA" }), config)).toEqual({ tipo: "iniciar", texto: "Reanudar" });
        expect(accionTerminal(tarea({ terminaEnUnPaso: true }), config)).toEqual({ tipo: "iniciar", texto: "Iniciar y terminar" });
    });

    it("EN CURSO abre los consumos (con o sin tramos); OFF y TERMINADA, nada", () => {
        expect(accionTerminal(tarea({ estado: "EN CURSO" }), config)).toEqual({ tipo: "consumos", texto: "Declarar producción" });
        expect(accionTerminal(tarea({ estado: "EN CURSO" }), { usarTramos: false })).toEqual({ tipo: "consumos", texto: "Declarar y terminar" });
        expect(accionTerminal(tarea({ estado: "TERMINADA" }), config)).toMatchObject({ tipo: "ninguna", motivo: "La tarea TA000001 ya está terminada" });
        expect(accionTerminal(tarea({ estado: "OFF" }), config)).toMatchObject({ tipo: "ninguna", motivo: "La tarea TA000001 no está activa" });
    });

    it("pendiente de la tarea", () => {
        expect(cantidadPendienteTarea({ cantidad: 100, cantidadHecha: 30.5 })).toBe(69.5);
        expect(cantidadPendienteTarea({ cantidad: 10, cantidadHecha: 12 })).toBe(0);
        expect(cantidadPendienteTarea({ cantidad: null, cantidadHecha: 0 })).toBe(0);
    });
});

describe("terminal: máquina de pasos", () => {
    const conOperario = (mantener = false): EstadoTerminal =>
        transicionTerminal(estadoTerminalInicial(mantener), { tipo: "operario_leido", codigo: "T1", nombre: "Ana" });

    it("operario → tarea → consumos", () => {
        const e0 = estadoTerminalInicial();
        expect(e0.paso).toBe("operario");
        const sinOperario = transicionTerminal(e0, { tipo: "tarea_leida", tarea: tarea() });
        expect(sinOperario.tarea).toBeNull();
        expect(sinOperario.mensaje?.tipo).toBe("error");
        const e1 = conOperario();
        expect(e1).toMatchObject({ paso: "tarea", operario: { codigo: "T1", nombre: "Ana" } });
        const e2 = transicionTerminal(e1, { tipo: "tarea_leida", tarea: tarea({ estado: "EN CURSO" }) });
        expect(e2.tarea?.id).toBe("TA000001");
        const e3 = transicionTerminal(e2, { tipo: "abrir_consumos", modo: { tipo: "declarar" } });
        expect(e3).toMatchObject({ paso: "consumos", modo: { tipo: "declarar" } });
        const e4 = transicionTerminal(e3, { tipo: "cerrar_consumos" });
        expect(e4).toMatchObject({ paso: "tarea", modo: null });
        expect(e4.tarea?.id).toBe("TA000001");
    });

    it("tras procesar limpia la tarea y el operario, salvo «Mantener operario»", () => {
        const leida = (e: EstadoTerminal) => transicionTerminal(e, { tipo: "tarea_leida", tarea: tarea() });
        const procesada = { tipo: "procesada" as const, tarea: { id: "TA000001", descripcion: "Tejer" }, texto: "Tarea TA000001 iniciada" };
        const a = transicionTerminal(leida(conOperario()), procesada);
        expect(a).toMatchObject({ paso: "operario", operario: null, tarea: null, ultima: { id: "TA000001" }, mensaje: { tipo: "exito" } });
        const b = transicionTerminal(leida(conOperario(true)), procesada);
        expect(b).toMatchObject({ paso: "tarea", operario: { codigo: "T1" }, tarea: null });
        const c = transicionTerminal(b, { tipo: "deshecha", texto: "Tarea TA000001 deshecha" });
        expect(c.ultima).toBeNull();
    });

    it("un error deja el paso; un éxito de tramo deja la tarea; / limpia todo", () => {
        const e = transicionTerminal(transicionTerminal(conOperario(), { tipo: "tarea_leida", tarea: tarea() }),
            { tipo: "abrir_consumos", modo: { tipo: "declarar" } });
        const conError = transicionTerminal(e, { tipo: "error", texto: "No válido" });
        expect(conError).toMatchObject({ paso: "consumos", mensaje: { tipo: "error", texto: "No válido" } });
        const exito = transicionTerminal(e, { tipo: "exito", texto: "Tramo cambiado" });
        expect(exito).toMatchObject({ paso: "tarea", modo: null, mensaje: { tipo: "exito" } });
        expect(exito.tarea?.id).toBe("TA000001");
        expect(transicionTerminal(exito, { tipo: "limpiar" })).toMatchObject({ paso: "operario", operario: null, tarea: null });
    });

    it("recargar la tarea solo si es la leída", () => {
        const e = transicionTerminal(conOperario(), { tipo: "tarea_leida", tarea: tarea() });
        expect(transicionTerminal(e, { tipo: "tarea_recargada", tarea: tarea({ estado: "EN CURSO" }) }).tarea?.estado).toBe("EN CURSO");
        expect(transicionTerminal(e, { tipo: "tarea_recargada", tarea: tarea({ id: "TA000002" }) }).tarea?.id).toBe("TA000001");
    });
});

describe("terminal: pantalla de consumos", () => {
    const lineas = (): LineaConsumo[] => lineasIniciales([componente(), tela]);

    it("previsto del tramo = cantidad × cantidad por unidad", () => {
        expect(previstoTramo(12.5, componente())).toBe(25);
        expect(previstoTramo(3, tela)).toBe(0.3);
        expect(previstoTramo(null, tela)).toBe(0);
    });

    it("consumo de la línea: lotes leídos, o lo previsto si no se ha tocado", () => {
        const [hilo, tinte] = lineas();
        expect(consumoLinea({ ...hilo, lotes: [{ loteId: "A", cantidad: "10,5" }, { loteId: "B", cantidad: "3" }] }, 10)).toBe(13.5);
        expect(consumoLinea(tinte, 10)).toBe(1);
        expect(consumoLinea({ ...tinte, cantidad: "0,7" }, 10)).toBe(0.7);
    });

    it("al leer un lote lo añade a su componente con lo que falta, sin pasar de lo disponible", () => {
        const r1 = anadirLoteLeido(lineas(), { id: "LA", articuloId: "HILO", componenteId: "11", disponible: 15 }, 10);
        expect(r1.ok && r1.lineas[0].lotes).toEqual([{ loteId: "LA", cantidad: "15" }]);
        if (!r1.ok) return;
        const r2 = anadirLoteLeido(r1.lineas, { id: "LB", articuloId: "HILO", componenteId: "11", disponible: 100 }, 10);
        expect(r2.ok && r2.lineas[0].lotes[1]).toEqual({ loteId: "LB", cantidad: "5" });
        expect(anadirLoteLeido(r1.lineas, { id: "LA", articuloId: "HILO", componenteId: "11", disponible: 1 }, 10))
            .toEqual({ ok: false, motivo: "El lote LA ya está leído" });
        expect(anadirLoteLeido(r1.lineas, { id: "LX", articuloId: "OTRO", componenteId: "", disponible: 1 }, 10))
            .toEqual({ ok: false, motivo: "El lote LX (OTRO) no es de ningún componente de esta tarea" });
        expect(anadirLoteLeido(r1.lineas, { id: "LT", articuloId: "TINTE", componenteId: "12", disponible: 1 }, 10))
            .toEqual({ ok: false, motivo: "El componente TINTE no se consume por lotes" });
        expect(cantidadPropuestaLote(0, 0)).toBe(0);
        expect(cantidadPropuestaLote(5, 0)).toBe(5);
        expect(cantidadPropuestaLote(0, 7)).toBe(0);
    });

    it("cantidad a fabricar: decimales y máximo de la configuración", () => {
        expect(motivoCantidadTramo("", config)).toBe("Indique la cantidad a fabricar");
        expect(motivoCantidadTramo("abc", config)).toBe("La cantidad a fabricar ha de ser un número");
        expect(motivoCantidadTramo("0", config)).toBe("La cantidad a fabricar ha de ser mayor que cero");
        expect(motivoCantidadTramo("1,234", config)).toBe("La cantidad a fabricar admite como máximo 2 decimales");
        expect(motivoCantidadTramo("1,5", { decimales: 0, maximoTramo: null })).toBe("La cantidad a fabricar no admite decimales");
        expect(motivoCantidadTramo("100", { decimales: 3, maximoTramo: 99.99 })).toBe("La cantidad a fabricar no puede pasar de 99,99");
        expect(motivoCantidadTramo("99,99", { decimales: 2, maximoTramo: 99.99 })).toBeNull();
        expect(motivoCantidadTramo("0,1", config)).toBeNull();
    });

    it("cantidad propuesta: lo pendiente sin pasar del máximo", () => {
        expect(cantidadPropuestaTramo(150, { maximoTramo: 99.99 })).toBe("99,99");
        expect(cantidadPropuestaTramo(12.5, { maximoTramo: null })).toBe("12,5");
        expect(cantidadPropuestaTramo(0, { maximoTramo: null })).toBe("");
    });

    it("mínimo del 80 % salvo cerrado; errores de cantidades", () => {
        const [hilo, tinte] = lineas();
        const pocos = { ...hilo, lotes: [{ loteId: "LA", cantidad: "15" }] };
        expect(lineaBajoMinimo(pocos, 10)).toBe(true);
        expect(lineaBajoMinimo({ ...pocos, cerrado: true }, 10)).toBe(false);
        expect(lineaBajoMinimo({ ...hilo, lotes: [{ loteId: "LA", cantidad: "16" }] }, 10)).toBe(false);
        const v = validarConsumos("10", [pocos, tinte], config);
        expect(v.errores).toEqual([]);
        expect(v.bajoMinimo).toEqual(["HILO: 15 de 20 previstos (mínimo 80 %)"]);
        const mal = validarConsumos("10", [{ ...hilo, lotes: [{ loteId: "LA", cantidad: "0" }] }, { ...tinte, cantidad: "-1" }], config);
        expect(mal.errores).toEqual([
            "HILO: la cantidad del lote LA ha de ser mayor que cero",
            "TINTE: la cantidad consumida ha de ser un número no negativo",
        ]);
        expect(validarConsumos("", [hilo], config).errores).toEqual(["Indique la cantidad a fabricar"]);
    });

    it("cuerpo de declarar y de editar tramo", () => {
        const [hilo, tinte] = lineas();
        const ls: LineaConsumo[] = [{ ...hilo, lotes: [{ loteId: "LA", cantidad: "12" }, { loteId: "LB", cantidad: "8,5" }] }, { ...tinte, cerrado: true, cantidad: "0,5" }];
        expect(cuerpoDeclarar("10", ls, "T1", false)).toEqual({
            cantidad: 10, trabajador_id: "T1", terminar: false,
            consumos: [
                { componente_id: "11", lotes: [{ lote_id: "LA", cantidad: 12 }, { lote_id: "LB", cantidad: 8.5 }] },
                { componente_id: "12", cantidad: 0.5, cerrado: true },
            ],
        });
        expect(cuerpoDeclarar("2,5", [hilo, tinte], null, true)).toEqual({
            cantidad: 2.5, terminar: true,
            consumos: [{ componente_id: "11", lotes: [] }, { componente_id: "12", cantidad: 0.25 }],
        });
        expect(cuerpoEditarTramo("10", [tinte], "T1")).toEqual({ cantidad: 10, trabajador_id: "T1", consumos: [{ componente_id: "12", cantidad: 1 }] });
    });

    it("precarga las líneas con los movimientos del tramo", () => {
        const tramo: TramoTerminal = {
            id: "5", tareaId: "TA000001", trabajadorId: "T1", trabajador: "Ana", cantidad: 10, diaInicio: "", tiempoInicio: "",
            diaFin: "", tiempoFin: "",
            movimientos: [
                { componenteId: "11", articuloId: "HILO", loteId: "LA", cantidad: -12 },
                { componenteId: "11", articuloId: "HILO", loteId: "LB", cantidad: -2 },
                { componenteId: "12", articuloId: "TINTE", loteId: "", cantidad: -0.9 },
                { componenteId: "", articuloId: "TELA", loteId: "L1", cantidad: 10 },
            ],
        };
        const [hilo, tinte] = lineasDeTramo([componente(), tela], tramo);
        expect(hilo.lotes).toEqual([{ loteId: "LA", cantidad: "12" }, { loteId: "LB", cantidad: "2" }]);
        expect(hilo.cerrado).toBe(true); // 14 de 20: se aceptó cerrada
        expect(tinte).toMatchObject({ cantidad: "0,9", cerrado: false });
        const sinPermiso = lineasDeTramo([componente({ puedeCerrar: false })], tramo);
        expect(sinPermiso[0].cerrado).toBe(false);
    });
});

describe("terminal: mensajes y lista", () => {
    it("texto del error con el motivo del servidor", () => {
        expect(textoError({ estado: 400, descripcion: "Lo declarado no vale: HILO por debajo del 80 %" }))
            .toBe("No válido: Lo declarado no vale: HILO por debajo del 80 %");
        expect(textoError({ estado: 409, descripcion: "\"La tarea no se puede declarar\"" })).toBe("No se puede: La tarea no se puede declarar");
        expect(textoError({ estado: 403, descripcion: JSON.stringify({ detail: "No puede cerrar" }) })).toBe("Sin permiso: No puede cerrar");
        expect(textoError({ estado: 422, descripcion: JSON.stringify({ detail: [{ loc: ["body", "cantidad"], msg: "Field required" }] }) }))
            .toBe("Faltan datos: cantidad: Field required");
        expect(textoError(new Error("Failed to fetch"))).toBe("Failed to fetch");
    });

    it("filtro de la lista lateral por estados y centro", () => {
        expect(filtroListaTerminal(null)).toEqual([["estado", "in", ["PTE", "EN CURSO", "EN PAUSA"]]]);
        expect(filtroListaTerminal("C1")).toEqual([["estado", "in", ["PTE", "EN CURSO", "EN PAUSA"]], ["centro_id", "=", "C1"]]);
    });
});
