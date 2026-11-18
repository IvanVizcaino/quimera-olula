import { ConfigVentas, SiNoPreguntar } from "./diseño.ts";

/** Los valores por defecto del escritorio (facturac_general.mtd). */
export const configVentasPorDefecto: ConfigVentas = {
    mostrarObservacionesCliente: false,
    facturarAlbaranesBorrador: "Si",
    crearFacturasBorrador: "Si",
    correoCopias: "",
};

export const opcionesSiNoPreguntar: { valor: SiNoPreguntar; descripcion: string }[] = [
    { valor: "Si", descripcion: "Sí" },
    { valor: "No", descripcion: "No" },
    { valor: "Preguntar", descripcion: "Preguntar" },
];

/** Vacía vale (no se envía copia); si hay algo, tiene que parecer un correo. */
export const correoCopiasValido = (correo: string): boolean =>
    !correo.trim() || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo.trim());
