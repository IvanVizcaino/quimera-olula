import { ElementoRejilla } from "@olula/componentes/rejilla/dominio.ts";

export type TipoComponente =
  | "tarjeta"
  | "objetivo"
  | "temporal"
  | "barras"
  | "circular"
  | "ranking"
  | "tabla"
  | "tabla_resumen"
  | "embudo"
  | "mapa"
  | "avisos"
  | "pregunta_ia"
  | "accesos"
  | "texto";

export type Granularidad = "dia" | "semana" | "mes" | "trimestre" | "año";

export type RangoPeriodo =
  | "hoy"
  | "ayer"
  | "esta_semana"
  | "semana_anterior"
  | "este_mes"
  | "mes_anterior"
  | "este_trimestre"
  | "trimestre_anterior"
  | "este_año"
  | "año_anterior"
  | "ultimos_7_dias"
  | "ultimos_30_dias"
  | "ultimos_90_dias"
  | "ultimos_12_meses";

export type Comparacion = "periodo_anterior" | "año_anterior";

export type OperacionMetrica =
  | "suma"
  | "conteo"
  | "conteo_distinto"
  | "promedio"
  | "minimo"
  | "maximo";

export type FiltroConsulta = {
  campo: string;
  operador: string;
  valor?: unknown;
};

/**
 * Consulta de un componente: los mismos parámetros que GET /comun/agregado/<recurso>
 * (strings tal cual viajan en la query) más el recurso. Así se guarda en el servidor.
 */
export type ConsultaComponente = {
  recurso: string;
  /** `suma:total,conteo` (totales) — o `columnas` para un listado de filas. */
  metricas?: string;
  columnas?: string;
  /** `fecha:mes` o `cliente`. */
  agrupar?: string;
  /** `suma_total:desc`. */
  orden?: string;
  limite?: number;
  filtros?: FiltroConsulta[];
  /** `fecha:ultimos_12_meses`. */
  periodo?: string;
  comparar?: Comparacion;
  /** Filtro de lista (formato de la API de lista). */
  q?: string;
};

export type FormatoValor = "moneda" | "numero";

/** Opciones visuales: libres por tipo de componente (el servidor solo acota el tamaño). */
export type OpcionesComponente = {
  formato?: FormatoValor;
  /** Objetivo: valor de la meta. */
  meta?: number;
  /** Texto: contenido. */
  texto?: string;
  /** Embudo: circuito de documentos (ventas, compras). */
  circuito?: string;
  /** Creado preguntando a la IA: la pregunta (la consulta guardada es lo que cuenta). */
  pregunta?: string;
};

/** Lo que propone el servidor (POST /comun/dashboard/proponer). */
export type PropuestaComponente = {
  tipo: TipoComponente;
  titulo: string;
  consulta: ConsultaComponente;
  explicacion: string;
};

/** Dashboard entero propuesto por la IA: los componentes ya validados por el servidor. */
export type PropuestaDashboard = {
  nombre: string;
  componentes: PropuestaComponente[];
};

export type ComponenteDashboard = ElementoRejilla & {
  tipo: TipoComponente;
  titulo: string;
  consultas: ConsultaComponente[];
  opciones: OpcionesComponente;
};

export type ResumenDashboard = {
  id: string;
  nombre: string;
  clave: string | null;
  compartido: boolean;
  propietario: string;
  esPropio: boolean;
  actualizadoEn: string;
};

export type Dashboard = ResumenDashboard & {
  componentes: ComponenteDashboard[];
  /** Componentes del propietario que no puede ver (sin permiso sobre sus datos). */
  componentesOcultos: number;
};

export type DimensionRecurso = {
  id: string;
  descripcion: string;
  tipo: "texto" | "numero" | "fecha" | "booleano";
};

/** Recurso agregable que el usuario puede ver (GET /comun/agregado). */
export type RecursoAgregable = {
  id: string;
  descripcion: string;
  ruta: string;
  medidas: { id: string; descripcion: string }[];
  dimensiones: DimensionRecurso[];
};

export type GrupoAgregado = Record<string, string | number | boolean | null>;

export type RespuestaAgregado = {
  recurso: string;
  grupos: GrupoAgregado[];
  total_grupos: number;
  truncado: boolean;
  totales: Record<string, number | null>;
  periodo?: { desde: string; hasta: string };
  comparacion?: RespuestaAgregado;
};

/** Entrada del catálogo «Añadir componente». */
export type DefinicionTipoComponente = {
  tipo: TipoComponente;
  nombre: string;
  descripcion: string;
  grupo: "Indicadores" | "Gráficos" | "Datos" | "Otros";
  /** Tamaño al añadirlo (columnas × filas). */
  w: number;
  h: number;
  /** Disponible en esta versión (el resto se anuncia pero no se ofrece). */
  disponible: boolean;
};

export type EstadoDashboard =
  | "CARGANDO"
  | "VIENDO"
  | "EDITANDO"
  | "CONFIGURANDO"
  | "BORRANDO"
  | "NO_ENCONTRADO";

export type ContextoDashboard = {
  estado: EstadoDashboard;
  dashboard: Dashboard | null;
  /** Nombre y componentes en edición (se guardan al pulsar Guardar). */
  nombre: string;
  borrador: ComponenteDashboard[];
  /** Componente que se está configurando (nuevo o existente). */
  configurando: ComponenteDashboard | null;
};
