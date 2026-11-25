/**
 * Datos maestros inventados que comparten las demos (empresa ficticia «Hortalizas del Sur»,
 * distribuidora de fruta y verdura). Nunca datos de clientes reales: correos en ejemplo.test,
 * NIF de relleno.
 */

const hoy = new Date();

/** Fecha ISO (YYYY-MM-DD) a `dias` de hoy. */
export const fecha = (dias: number): string => {
    const d = new Date(hoy);
    d.setDate(d.getDate() + dias);
    return d.toISOString().slice(0, 10);
};

/** Fecha y hora ISO a `dias` de hoy, a la hora indicada. */
export const fechaHora = (dias: number, hora = "10:00:00"): string => `${fecha(dias)}T${hora}`;

export const EMPRESA = { nombre: "Hortalizas del Sur S.L.", cif: "B00000000" };

export const CLIENTES = [
    { id: "c1", nombre: "Frutas Martín S.L.", cif: "B11111111", email: "compras@frutasmartin.ejemplo.test", telefono1: "950 000 001", poblacion: "Almería" },
    { id: "c2", nombre: "Supermercados La Huerta", cif: "B22222222", email: "pedidos@lahuerta.ejemplo.test", telefono1: "958 000 002", poblacion: "Granada" },
    { id: "c3", nombre: "Restaurante El Puerto", cif: "B33333333", email: "cocina@elpuerto.ejemplo.test", telefono1: "956 000 003", poblacion: "Cádiz" },
    { id: "c4", nombre: "Cooperativa Vega Baja", cif: "F44444444", email: "admin@vegabaja.ejemplo.test", telefono1: "966 000 004", poblacion: "Orihuela" },
    { id: "c5", nombre: "Cliente de contado", cif: "00000000T", email: null, telefono1: null, poblacion: null },
];

export const PROVEEDORES = [
    { id: "pv1", nombre: "Semillas del Levante S.A.", cif: "A55555555", email: "ventas@semillaslevante.ejemplo.test" },
    { id: "pv2", nombre: "Envases Andaluces S.L.", cif: "B66666666", email: "info@envasesandaluces.ejemplo.test" },
    { id: "pv3", nombre: "Transportes Rápidos del Sur", cif: "B77777777", email: "trafico@trs.ejemplo.test" },
];

/** Artículos: referencia, descripción, PVP sin IVA, coste, stock y código de barras. */
export const ARTICULOS = [
    { id: "TOM01", referencia: "TOM01", descripcion: "Tomate pera (kg)", pvp: 1.85, coste: 0.9, stock: 420, codbarras: "8400000000011", familia: "Hortalizas" },
    { id: "PIM01", referencia: "PIM01", descripcion: "Pimiento rojo (kg)", pvp: 2.4, coste: 1.1, stock: 260, codbarras: "8400000000028", familia: "Hortalizas" },
    { id: "PEP01", referencia: "PEP01", descripcion: "Pepino (kg)", pvp: 1.2, coste: 0.5, stock: 310, codbarras: "8400000000035", familia: "Hortalizas" },
    { id: "NAR01", referencia: "NAR01", descripcion: "Naranja de zumo (kg)", pvp: 1.1, coste: 0.45, stock: 800, codbarras: "8400000000042", familia: "Fruta" },
    { id: "LIM01", referencia: "LIM01", descripcion: "Limón (kg)", pvp: 1.6, coste: 0.7, stock: 150, codbarras: "8400000000059", familia: "Fruta" },
    { id: "AGU01", referencia: "AGU01", descripcion: "Aguacate Hass (ud)", pvp: 0.95, coste: 0.5, stock: 600, codbarras: "8400000000066", familia: "Fruta" },
    { id: "CAJ01", referencia: "CAJ01", descripcion: "Caja de madera 10 kg", pvp: 0.8, coste: 0.35, stock: 1200, codbarras: "8400000000073", familia: "Envases" },
];

export const AGENTES = [
    { id: "ag1", nombre: "Marta Sánchez" },
    { id: "ag2", nombre: "Pablo Ortega" },
];

export const ALMACENES = [
    { id: "ALM", nombre: "Almacén central" },
    { id: "TDA", nombre: "Tienda" },
];

export const FORMAS_PAGO = [
    { id: "CONT", descripcion: "Contado" },
    { id: "TRF30", descripcion: "Transferencia a 30 días" },
    { id: "REC60", descripcion: "Recibo domiciliado a 60 días" },
];
