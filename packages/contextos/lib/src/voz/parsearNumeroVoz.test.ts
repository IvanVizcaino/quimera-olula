import { parsearNumeroVoz } from "./parsearNumeroVoz";

describe("parsearNumeroVoz", () => {
    test("devuelve null para texto vacío", () => {
        expect(parsearNumeroVoz("")).toBeNull();
        expect(parsearNumeroVoz("  ")).toBeNull();
    });

    test("parsea dígitos directos", () => {
        expect(parsearNumeroVoz("0")).toBe(0);
        expect(parsearNumeroVoz("12")).toBe(12);
        expect(parsearNumeroVoz("999")).toBe(999);
        expect(parsearNumeroVoz("3.5")).toBe(3.5);
        expect(parsearNumeroVoz("3,5")).toBe(3.5);
    });

    test("parsea unidades (0-15)", () => {
        expect(parsearNumeroVoz("cero")).toBe(0);
        expect(parsearNumeroVoz("uno")).toBe(1);
        expect(parsearNumeroVoz("una")).toBe(1);
        expect(parsearNumeroVoz("cinco")).toBe(5);
        expect(parsearNumeroVoz("diez")).toBe(10);
        expect(parsearNumeroVoz("quince")).toBe(15);
    });

    test("parsea 16-29", () => {
        expect(parsearNumeroVoz("dieciséis")).toBe(16);
        expect(parsearNumeroVoz("dieciseis")).toBe(16);
        expect(parsearNumeroVoz("veinte")).toBe(20);
        expect(parsearNumeroVoz("veintiuno")).toBe(21);
        expect(parsearNumeroVoz("veintidós")).toBe(22);
        expect(parsearNumeroVoz("veintinueve")).toBe(29);
    });

    test("parsea decenas compuestas (30-99)", () => {
        expect(parsearNumeroVoz("treinta")).toBe(30);
        expect(parsearNumeroVoz("treinta y cinco")).toBe(35);
        expect(parsearNumeroVoz("cuarenta y dos")).toBe(42);
        expect(parsearNumeroVoz("noventa y nueve")).toBe(99);
    });

    test("parsea centenas (100-999)", () => {
        expect(parsearNumeroVoz("cien")).toBe(100);
        expect(parsearNumeroVoz("ciento uno")).toBe(101);
        expect(parsearNumeroVoz("ciento veintitrés")).toBe(123);
        expect(parsearNumeroVoz("doscientos")).toBe(200);
        expect(parsearNumeroVoz("doscientas")).toBe(200);
        expect(parsearNumeroVoz("quinientos treinta y cinco")).toBe(535);
        expect(parsearNumeroVoz("novecientos noventa y nueve")).toBe(999);
    });

    test("parsea miles (1000-9999)", () => {
        expect(parsearNumeroVoz("mil")).toBe(1000);
        expect(parsearNumeroVoz("mil uno")).toBe(1001);
        expect(parsearNumeroVoz("mil doscientos")).toBe(1200);
        expect(parsearNumeroVoz("dos mil")).toBe(2000);
        expect(parsearNumeroVoz("dos mil trescientos")).toBe(2300);
        expect(parsearNumeroVoz("tres mil quinientos cuarenta y dos")).toBe(3542);
    });

    test("parsea decimales con 'coma' o 'punto'", () => {
        expect(parsearNumeroVoz("tres coma cinco")).toBe(3.5);
        expect(parsearNumeroVoz("doce punto cinco")).toBe(12.5);
        expect(parsearNumeroVoz("cero coma cinco")).toBe(0.5);
    });

    test("es case-insensitive", () => {
        expect(parsearNumeroVoz("Doce")).toBe(12);
        expect(parsearNumeroVoz("TREINTA Y CINCO")).toBe(35);
    });

    test("devuelve null para texto no numérico", () => {
        expect(parsearNumeroVoz("hola")).toBeNull();
        expect(parsearNumeroVoz("siguiente")).toBeNull();
        expect(parsearNumeroVoz("abc")).toBeNull();
    });
});
