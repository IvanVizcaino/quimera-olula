/**
 * Dónde pintar cada provincia y comunidad autónoma en el mapa, por su código INE (el
 * que da el servidor en las dimensiones `provincia` y `comunidad`). Provincias: su
 * capital; comunidades: un punto central. [longitud, latitud], aproximadas.
 */
export type Lugar = { nombre: string; centro: [number, number] };

export const PROVINCIAS: Record<string, Lugar> = {
  "01": { nombre: "Araba/Álava", centro: [-2.6727, 42.8467] },
  "02": { nombre: "Albacete", centro: [-1.8585, 38.9943] },
  "03": { nombre: "Alicante/Alacant", centro: [-0.481, 38.3452] },
  "04": { nombre: "Almería", centro: [-2.4637, 36.834] },
  "05": { nombre: "Ávila", centro: [-4.6812, 40.6566] },
  "06": { nombre: "Badajoz", centro: [-6.9707, 38.8794] },
  "07": { nombre: "Illes Balears", centro: [2.6502, 39.5696] },
  "08": { nombre: "Barcelona", centro: [2.1734, 41.3851] },
  "09": { nombre: "Burgos", centro: [-3.6969, 42.3439] },
  "10": { nombre: "Cáceres", centro: [-6.3725, 39.4753] },
  "11": { nombre: "Cádiz", centro: [-6.2926, 36.5271] },
  "12": { nombre: "Castellón/Castelló", centro: [-0.0513, 39.9864] },
  "13": { nombre: "Ciudad Real", centro: [-3.9271, 38.9848] },
  "14": { nombre: "Córdoba", centro: [-4.7794, 37.8882] },
  "15": { nombre: "A Coruña", centro: [-8.4115, 43.3623] },
  "16": { nombre: "Cuenca", centro: [-2.1374, 40.0704] },
  "17": { nombre: "Girona", centro: [2.8214, 41.9794] },
  "18": { nombre: "Granada", centro: [-3.5986, 37.1773] },
  "19": { nombre: "Guadalajara", centro: [-3.1661, 40.6329] },
  "20": { nombre: "Gipuzkoa", centro: [-1.9812, 43.3183] },
  "21": { nombre: "Huelva", centro: [-6.9447, 37.2614] },
  "22": { nombre: "Huesca", centro: [-0.4087, 42.1361] },
  "23": { nombre: "Jaén", centro: [-3.7849, 37.7796] },
  "24": { nombre: "León", centro: [-5.5671, 42.5987] },
  "25": { nombre: "Lleida", centro: [0.62, 41.6176] },
  "26": { nombre: "La Rioja", centro: [-2.445, 42.4627] },
  "27": { nombre: "Lugo", centro: [-7.556, 43.0097] },
  "28": { nombre: "Madrid", centro: [-3.7038, 40.4168] },
  "29": { nombre: "Málaga", centro: [-4.4214, 36.7213] },
  "30": { nombre: "Murcia", centro: [-1.1307, 37.9922] },
  "31": { nombre: "Navarra", centro: [-1.644, 42.8125] },
  "32": { nombre: "Ourense", centro: [-7.8641, 42.3358] },
  "33": { nombre: "Asturias", centro: [-5.8494, 43.3614] },
  "34": { nombre: "Palencia", centro: [-4.5286, 42.0096] },
  "35": { nombre: "Las Palmas", centro: [-15.4134, 28.1235] },
  "36": { nombre: "Pontevedra", centro: [-8.6446, 42.431] },
  "37": { nombre: "Salamanca", centro: [-5.6635, 40.9701] },
  "38": { nombre: "Santa Cruz de Tenerife", centro: [-16.2518, 28.4636] },
  "39": { nombre: "Cantabria", centro: [-3.8044, 43.4623] },
  "40": { nombre: "Segovia", centro: [-4.1088, 40.9429] },
  "41": { nombre: "Sevilla", centro: [-5.9845, 37.3891] },
  "42": { nombre: "Soria", centro: [-2.4649, 41.7666] },
  "43": { nombre: "Tarragona", centro: [1.2445, 41.1189] },
  "44": { nombre: "Teruel", centro: [-1.1065, 40.3456] },
  "45": { nombre: "Toledo", centro: [-4.0273, 39.8628] },
  "46": { nombre: "Valencia/València", centro: [-0.3763, 39.4699] },
  "47": { nombre: "Valladolid", centro: [-4.7245, 41.6523] },
  "48": { nombre: "Bizkaia", centro: [-2.935, 43.263] },
  "49": { nombre: "Zamora", centro: [-5.7445, 41.5035] },
  "50": { nombre: "Zaragoza", centro: [-0.8891, 41.6488] },
  "51": { nombre: "Ceuta", centro: [-5.3162, 35.8894] },
  "52": { nombre: "Melilla", centro: [-2.9381, 35.2923] },
};

export const COMUNIDADES: Record<string, Lugar> = {
  "01": { nombre: "Andalucía", centro: [-4.58, 37.46] },
  "02": { nombre: "Aragón", centro: [-0.66, 41.52] },
  "03": { nombre: "Asturias", centro: [-5.99, 43.29] },
  "04": { nombre: "Illes Balears", centro: [2.9, 39.57] },
  "05": { nombre: "Canarias", centro: [-15.75, 28.29] },
  "06": { nombre: "Cantabria", centro: [-4.03, 43.2] },
  "07": { nombre: "Castilla y León", centro: [-4.78, 41.75] },
  "08": { nombre: "Castilla-La Mancha", centro: [-3.0, 39.58] },
  "09": { nombre: "Cataluña", centro: [1.53, 41.8] },
  "10": { nombre: "Comunitat Valenciana", centro: [-0.55, 39.4] },
  "11": { nombre: "Extremadura", centro: [-6.15, 39.19] },
  "12": { nombre: "Galicia", centro: [-7.91, 42.75] },
  "13": { nombre: "Comunidad de Madrid", centro: [-3.7, 40.42] },
  "14": { nombre: "Región de Murcia", centro: [-1.48, 38.0] },
  "15": { nombre: "Navarra", centro: [-1.65, 42.67] },
  "16": { nombre: "País Vasco", centro: [-2.62, 43.04] },
  "17": { nombre: "La Rioja", centro: [-2.52, 42.29] },
  "18": { nombre: "Ceuta", centro: [-5.32, 35.89] },
  "19": { nombre: "Melilla", centro: [-2.94, 35.29] },
};

/** España con Canarias, para encuadrar el mapa al abrirlo. */
export const LIMITES_ESPAÑA: [[number, number], [number, number]] = [
  [-18.5, 27.4],
  [4.6, 44.0],
];

/** Dimensiones geográficas que sabe pintar el mapa. */
export const DIMENSIONES_GEOGRAFICAS: Record<string, Record<string, Lugar>> = {
  provincia: PROVINCIAS,
  comunidad: COMUNIDADES,
};
