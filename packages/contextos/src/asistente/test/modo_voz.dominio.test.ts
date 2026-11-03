import { describe, expect, test, vi } from "vitest";
import {
    confirmacionPendiente, detectarActivacion, esComandoCancelar, esComandoDesactivar, esEcoDeVoz,
    esErrorHiloNoEncontrado, fraseParaVoz, hiloDeVoz, parsearConfirmacionVoz, preguntaConfirmacionVoz,
    requiereInteraccion, siguienteEstadoModoVoz, textoAvisoComunicacion, textoParaVoz,
} from "#/asistente/dominio.ts";
import { consultaAApi } from "#/asistente/infraestructura.ts";
import type { HiloIa } from "#/asistente/diseño.ts";

vi.mock("@olula/lib/dominio.ts", () => ({ puede: () => true }));
vi.mock("#/valores/empresaActual.ts", () => ({ empresaActual: () => "emp-1" }));

describe("[asistente-voz-01] detectarActivacion reconoce «Oye Olula» y extrae la orden", () => {
    test.each([
        ["Oye Olula, ¿cuántos pedidos tengo pendientes?", "¿cuántos pedidos tengo pendientes?"],
        ["oye olula cuántos pedidos tengo", "cuántos pedidos tengo"],
        ["Olula: abre los clientes", "abre los clientes"],
        ["eh oye Olula abre los clientes", "abre los clientes"],
        ["Oye Olula", ""],
    ])("«%s» → «%s»", (texto, orden) => {
        expect(detectarActivacion(texto)).toEqual({ activado: true, orden });
    });

    test.each([
        ["hoy olula qué tal las ventas", "qué tal las ventas"],
        ["oye lula qué tal las ventas", "qué tal las ventas"],
        ["oye o lula qué tal las ventas", "qué tal las ventas"],
        ["hola lula qué tal las ventas", "qué tal las ventas"],
        ["oye olura qué tal las ventas", "qué tal las ventas"],
        ["oye Olulá qué tal las ventas", "qué tal las ventas"],
    ])("tolera variantes de transcripción: «%s»", (texto, orden) => {
        expect(detectarActivacion(texto)).toEqual({ activado: true, orden });
    });

    test.each([
        "vamos a revisar los pedidos de hoy",
        "lula está de vacaciones",
        "la ola de calor",
        "",
    ])("no se activa con «%s»", texto => {
        expect(detectarActivacion(texto).activado).toBe(false);
    });
});

describe("[asistente-voz-02] comandos de cancelar y desactivar", () => {
    test.each(["para", "Para.", "cancela", "Cállate", "silencio", "déjalo", "da igual"])(
        "«%s» cancela", texto => expect(esComandoCancelar(texto)).toBe(true));

    test.each(["para el pedido de Juan", "cancela la factura 12", "oye"])(
        "«%s» no es una cancelación (es una orden)", texto => expect(esComandoCancelar(texto)).toBe(false));

    test.each(["Deja de escuchar", "desactívate", "desactiva el modo voz por favor"])(
        "«%s» desactiva el modo voz", texto => expect(esComandoDesactivar(texto)).toBe(true));

    test("una orden normal no desactiva", () => {
        expect(esComandoDesactivar("desactiva el cliente Acme")).toBe(false);
    });
});

describe("[asistente-voz-03] textoParaVoz prepara la respuesta para leerla en voz alta", () => {
    test("quita markdown, enlaces y URLs", () => {
        expect(textoParaVoz("Tienes **12 pedidos** pendientes. Mira [el listado](/ventas/pedido) o https://x.es/a", []))
            .toBe("Tienes 12 pedidos pendientes. Mira el listado o");
    });

    test("quita viñetas y listas numeradas", () => {
        expect(textoParaVoz("Clientes:\n- Acme\n- Beta\n1. Gamma", [])).toBe("Clientes: Acme Beta Gamma");
    });

    test("avisa de que hay contenido en pantalla si llega A2UI", () => {
        const a2ui = [{ updateComponents: { components: [{ component: "Tabla" }] } }];
        expect(textoParaVoz("Estos son tus pedidos.", a2ui)).toBe("Estos son tus pedidos. Te lo muestro en el chat.");
    });

    test("pide completar en el chat si el A2UI requiere interacción", () => {
        const a2ui = [{ updateComponents: { components: [{ component: "TarjetaConfirmacion" }] } }];
        expect(requiereInteraccion(a2ui)).toBe(true);
        expect(textoParaVoz("Voy a crear el pedido.", a2ui))
            .toBe("Voy a crear el pedido. Necesito que lo completes en el chat.");
    });

    test("recorta respuestas largas en un final de frase y remite al chat", () => {
        const frase = "Esta es una frase de relleno bastante larga para la prueba. ";
        const texto = textoParaVoz(frase.repeat(20), []);
        expect(texto.length).toBeLessThan(450);
        expect(texto.endsWith("prueba. Tienes el resto en el chat.")).toBe(true);
    });

    test("nunca devuelve un texto vacío", () => {
        expect(textoParaVoz("", [])).toBe("Hecho.");
    });
});

describe("[asistente-voz-04] máquina de estados del modo voz", () => {
    test("ciclo completo: espera → orden → procesando → respuesta → seguimiento → espera", () => {
        let estado = siguienteEstadoModoVoz("inactivo", "activar");
        expect(estado).toBe("en_espera");
        estado = siguienteEstadoModoVoz(estado, "frase_activacion");
        expect(estado).toBe("escuchando_orden");
        estado = siguienteEstadoModoVoz(estado, "orden");
        expect(estado).toBe("procesando");
        estado = siguienteEstadoModoVoz(estado, "respuesta");
        expect(estado).toBe("respondiendo");
        estado = siguienteEstadoModoVoz(estado, "fin_respuesta");
        expect(estado).toBe("escuchando_orden");
        expect(siguienteEstadoModoVoz(estado, "silencio")).toBe("en_espera");
    });

    test("frase de activación y orden en una sola frase: de espera a procesando", () => {
        expect(siguienteEstadoModoVoz("en_espera", "orden")).toBe("procesando");
    });

    test("eventos no válidos en un estado no cambian nada", () => {
        expect(siguienteEstadoModoVoz("inactivo", "orden")).toBe("inactivo");
        expect(siguienteEstadoModoVoz("procesando", "frase_activacion")).toBe("procesando");
        expect(siguienteEstadoModoVoz("en_espera", "silencio")).toBe("en_espera");
    });

    test("respuesta que pide confirmar: respondiendo → confirmando → procesando", () => {
        expect(siguienteEstadoModoVoz("respondiendo", "pedir_confirmacion")).toBe("confirmando");
        expect(siguienteEstadoModoVoz("confirmando", "confirmacion")).toBe("procesando");
        expect(siguienteEstadoModoVoz("confirmando", "silencio")).toBe("en_espera");
        expect(siguienteEstadoModoVoz("confirmando", "cancelar")).toBe("en_espera");
    });

    test("desactivar vale desde cualquier estado; fallo lleva a error salvo si está inactivo", () => {
        expect(siguienteEstadoModoVoz("respondiendo", "desactivar")).toBe("inactivo");
        expect(siguienteEstadoModoVoz("escuchando_orden", "fallo")).toBe("error");
        expect(siguienteEstadoModoVoz("inactivo", "fallo")).toBe("inactivo");
        expect(siguienteEstadoModoVoz("error", "reintentar")).toBe("en_espera");
    });
});

describe("[asistente-voz-05] hilo de voz y canal", () => {
    const hilo = (threadId: string, canal: HiloIa["canal"]): HiloIa =>
        ({ threadId, titulo: threadId, actualizadoEn: "", canal });

    test("hiloDeVoz devuelve el primer hilo de canal voz (el más reciente)", () => {
        expect(hiloDeVoz([hilo("a", "web"), hilo("b", "voz"), hilo("c", "voz")])?.threadId).toBe("b");
        expect(hiloDeVoz([hilo("a", "web")])).toBeNull();
    });

    test("consultaAApi envía el canal solo si se informa", () => {
        expect(consultaAApi({ pregunta: "hola", threadId: null, canal: "voz" })).toMatchObject({ canal: "voz" });
        expect(consultaAApi({ pregunta: "hola", threadId: null })).not.toHaveProperty("canal");
    });

    test("esErrorHiloNoEncontrado reconoce el 404 del hilo", () => {
        expect(esErrorHiloNoEncontrado({ nombre: "Error", descripcion: "comun.ia.hilo: abc" })).toBe(true);
        expect(esErrorHiloNoEncontrado({ nombre: "Error", descripcion: "Internal Server Error" })).toBe(false);
        expect(esErrorHiloNoEncontrado(new Error("x"))).toBe(false);
    });
});

describe("[asistente-voz-06] confirmaciones por voz", () => {
    test.each([
        ["sí", true], ["Sí, adelante", true], ["vale", true], ["venga, hazlo", true], ["ok", true],
        ["no", false], ["No, cancela", false], ["sí, pero no", false], ["espera", false],
        ["casi", null], ["el de ayer", null], ["", null],
    ])("«%s» → %s", (texto, esperado) => {
        expect(parsearConfirmacionVoz(texto)).toBe(esperado);
    });

    const tarjeta = {
        version: "v0.9",
        updateComponents: {
            surfaceId: "conf-1",
            components: [{
                id: "root", component: "TarjetaConfirmacion", titulo: "¿Confirmar la acción \"Crear pedido\"?",
                detalles: [
                    { etiqueta: "Cliente", valor: "Acme" }, { etiqueta: "Total", valor: "120 €" },
                    { etiqueta: "A", valor: "1" }, { etiqueta: "B", valor: "2" }, { etiqueta: "C", valor: "3" },
                ],
            }],
        },
    };

    test("confirmacionPendiente encuentra la tarjeta entre los mensajes A2UI", () => {
        expect(confirmacionPendiente([{ createSurface: { surfaceId: "conf-1" } }, tarjeta])).toMatchObject({
            surfaceId: "conf-1", titulo: "¿Confirmar la acción \"Crear pedido\"?",
        });
        expect(confirmacionPendiente([{ updateComponents: { surfaceId: "s", components: [{ component: "Tabla" }] } }]))
            .toBeNull();
        expect(confirmacionPendiente([])).toBeNull();
    });

    test("preguntaConfirmacionVoz: acción, hasta 4 datos y «¿Lo confirmo?»", () => {
        expect(preguntaConfirmacionVoz(confirmacionPendiente([tarjeta])!)).toBe(
            "Confirmar la acción \"Crear pedido\". Cliente: Acme. Total: 120 euros. A: 1. B: 2. ¿Lo confirmo?");
    });
});

describe("[asistente-voz-07] eco y frases sueltas", () => {
    const leido = "Para ver los pedidos pendientes abre la pantalla de pedidos.";

    test("lo que coincide con lo que se está leyendo es eco", () => {
        expect(esEcoDeVoz("para ver los pedidos pendientes", leido)).toBe(true);
        expect(esEcoDeVoz("abre la pantalla", leido)).toBe(true);
    });

    test("frases cortas o distintas no son eco (se puede contestar e interrumpir)", () => {
        expect(esEcoDeVoz("para", leido)).toBe(false);
        expect(esEcoDeVoz("sí", leido)).toBe(false);
        expect(esEcoDeVoz("olula y los clientes de Madrid", leido)).toBe(false);
    });

    test("fraseParaVoz limpia markdown y descarta JSON o bloques internos", () => {
        expect(fraseParaVoz("Tienes **3** pedidos.")).toBe("Tienes 3 pedidos.");
        expect(fraseParaVoz("{\"total\": 3}")).toBe("");
        expect(fraseParaVoz("<a2ui>")).toBe("");
        expect(fraseParaVoz("[Resultado de buscar_factura: x]")).toBe("");
    });
});

describe("[asistente-voz-08] avisos de comunicaciones", () => {
    test.each([
        ["Tu consulta ya está lista", "Ya tengo la respuesta a tu consulta. La tienes en el chat."],
        ["Tu consulta requiere confirmación: crear pedido", "Tu consulta necesita que confirmes una acción en el chat."],
        ["Tu consulta ha fallado", "Tu consulta al asistente ha fallado."],
        ["Factura FAC-0045 vencida", "Tienes un aviso nuevo: Factura FAC 45 vencida."],
        ["", "Tienes un aviso nuevo."],
    ])("«%s»", (asunto, esperado) => expect(textoAvisoComunicacion(asunto)).toBe(esperado));

    test("acorta asuntos muy largos", () => {
        expect(textoAvisoComunicacion("a".repeat(300)).length).toBeLessThan(160);
    });
});
