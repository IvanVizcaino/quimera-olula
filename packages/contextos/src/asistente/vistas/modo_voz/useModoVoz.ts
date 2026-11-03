import { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import {
    describirPantalla, ejecutarAccionPantalla, type AccionPantalla, type ResultadoAccionPantalla,
} from "@olula/lib/controles_pantalla.ts";
import { FactoryCtx } from "@olula/lib/factory_ctx.tsx";
import type { DetectorActivacion } from "@olula/lib/voz/detector_activacion.ts";
import { grabarFrase, type AudioGrabado } from "@olula/lib/voz/grabar_frase.ts";
import { normalizarImportesDictados } from "@olula/lib/voz/importes_dictados.ts";
import { crearLectorFrases, separarFrases, type LectorFrases } from "@olula/lib/voz/lector_frases.ts";
import { modoCapturaVoz, useModoVozActivo, type ModoCapturaVoz } from "@olula/lib/voz/modo_voz.ts";
import { reproducirTono } from "@olula/lib/voz/tonos.ts";
import { useEscuchaContinua, type ResultadoEscucha } from "@olula/lib/voz/useEscuchaContinua.ts";
import { useSintesisVoz } from "@olula/lib/voz/useSintesisVoz.ts";
import { useVozOcupada } from "@olula/lib/voz/voz_ocupada.ts";
import {
    LIMITE_CARACTERES_VOZ_STREAMING, accionNavegacionConNombreCorto, avisoContenidoEnPantalla,
    confirmacionPendiente, construirCapacidades, construirContextoPantalla, detectarActivacion,
    esComandoCancelar, esComandoDesactivar, interpretarOrdenPantalla,
    esEcoDeVoz, esErrorHiloNoEncontrado, fraseParaVoz, hiloDeVoz, parsearConfirmacionVoz,
    preguntaConfirmacionVoz, siguienteEstadoModoVoz,
} from "#/asistente/dominio.ts";
import { consultarIa, consultarIaStream, enviarAccionA2ui, listarHilos } from "#/asistente/infraestructura.ts";
import { useAvisosHablados } from "#/asistente/vistas/modo_voz/useAvisosHablados.ts";
import type {
    AccionNavegacion, AdjuntoIa, ConfirmacionVoz, ConsultaIa, EstadoModoVoz, EventoModoVoz, RespuestaIa,
} from "#/asistente/diseño.ts";

/** Tras oír "Oye Olula" sin nada más, cuánto se espera a que llegue la orden. */
const ESPERA_ORDEN_MS = 8_000;
/** Tras responder, cuánto se sigue escuchando sin exigir la frase de activación. */
const ESPERA_SEGUIMIENTO_MS = 6_000;
/** Cuánto se espera el "sí"/"no" de una confirmación antes de dejarla en el chat. */
const ESPERA_CONFIRMACION_MS = 10_000;
/** En modo audio la confirmación se da con los botones: algo más de margen. */
const ESPERA_CONFIRMACION_AUDIO_MS = 30_000;

/** Tras terminar de hablar, margen antes de volver a escuchar: el audio puede seguir
 * saliendo un instante por los altavoces y el reconocedor entrega lo oído con retraso.
 * Al acabar se reinicia el reconocimiento, que descarta ese eco pendiente. */
const PAUSA_TRAS_HABLAR_MS = 400;
/** Micro abierto mientras habla, para poder interrumpirle con «Olula, para». En
 * equipos donde su propia voz se cuele igualmente por el micro (altavoces altos, sin
 * cancelación de eco), VITE_ASISTENTE_VOZ_INTERRUMPIR=false lo cierra mientras habla. */
const INTERRUMPIR_MIENTRAS_HABLA = import.meta.env.VITE_ASISTENTE_VOZ_INTERRUMPIR !== "false";

/** Durante este tiempo tras hablar, lo que se parezca a lo dicho se trata como eco. */
const VENTANA_ECO_MS = 8_000;

/** Si en este tiempo no ha empezado a responder, avisa de que sigue en ello. */
const ESPERA_AVISO_TRABAJANDO_MS = 3_000;
/** Sin usarlo este tiempo, el modo voz se apaga solo (que nadie se deje el micro
 * abierto al irse). VITE_ASISTENTE_VOZ_INACTIVIDAD_MIN para cambiarlo. */
const INACTIVIDAD_MS = (Number(import.meta.env.VITE_ASISTENTE_VOZ_INACTIVIDAD_MIN) || 30) * 60_000;

/** Respuesta leída según llega (streaming) — VITE_ASISTENTE_VOZ_STREAMING=false para
 * esperar a la respuesta completa, como el chat en modo estándar. */
const VOZ_STREAMING = import.meta.env.VITE_ASISTENTE_VOZ_STREAMING !== "false";

const ESTADOS_SIN_ESCUCHA: EstadoModoVoz[] = ["inactivo", "error"];
const ESTADOS_OCUPADO: EstadoModoVoz[] = ["procesando", "respondiendo", "confirmando"];

export interface OpcionesModoVoz {
    /** El asistente ha propuesto ir a una pantalla — en modo voz se navega sin
     * pedir confirmación (no hay manos para pulsar el botón). */
    onNavegar?: (accion: AccionNavegacion) => void;
    /** La respuesta trae contenido que solo se ve en pantalla (tablas, tarjetas,
     * confirmaciones): abrir el chat en el hilo de voz. */
    onMostrarHilo?: (threadId: string) => void;
    /** Nivel del micro (RMS 0..1) mientras se graba una orden en modo audio. */
    onNivel?: (nivel: number) => void;
    /** Detector local de la frase de activación para el modo audio (ver
     * DetectorActivacion). Sin él, en modo audio se habla pulsando. */
    detector?: DetectorActivacion | null;
}

export interface ModoVoz {
    estado: EstadoModoVoz;
    /** null si el navegador no puede (ni reconocer ni grabar). */
    modoCaptura: ModoCapturaVoz | null;
    /** Otra pantalla está usando la voz (p. ej. lectura por voz de almacén): el modo
     * voz no escucha ni habla hasta que la libere. */
    pausado: boolean;
    /** Lo que se está dictando ahora mismo (transcripción provisional). */
    textoEnVivo: string | null;
    /** Última orden enviada al asistente. */
    orden: string | null;
    /** Aviso de progreso mientras piensa ("Buscando el cliente…"). */
    progreso: string | null;
    /** Texto de la respuesta en curso (lo que se va leyendo). */
    respuesta: string | null;
    error: string | null;
    soportado: boolean;
    /** Hilo de voz del usuario, en cuanto se conoce (null si aún no existe). */
    threadId: string | null;
    cancelar: () => void;
    /** Empezar a escuchar una orden ya, sin frase de activación (botón/atajo). Si
     * estaba pensando o hablando, lo interrumpe. */
    hablarAhora: () => void;
    /** Responder a una confirmación pendiente (estado "confirmando") sin hablar. */
    confirmar: (valor: boolean) => void;
    reintentar: () => void;
    desactivar: () => void;
}

interface ResultadoTurno {
    threadId: string | null;
    a2uiMessages: unknown[];
    accionNavegacion: AccionNavegacion | null;
    accionesPantalla: AccionPantalla[];
}

const resultadoDeRespuesta = (respuestaIa: RespuestaIa, threadIdPorDefecto: string | null): ResultadoTurno => ({
    threadId: respuestaIa.threadId || threadIdPorDefecto,
    a2uiMessages: respuestaIa.a2uiMessages,
    accionNavegacion: respuestaIa.accionNavegacion,
    accionesPantalla: respuestaIa.accionesPantalla,
});

/** Va leyendo el texto de una respuesta según llega: lo trocea en frases, se salta lo
 * que no es legible (JSON, marcadores) y deja de leer al pasar del límite. */
interface Narrador {
    /** Trozo de texto de la respuesta (delta del stream, o la respuesta entera). */
    añadir: (trozo: string) => void;
    /** El backend retira lo que llevaba (evento "estado"): se descarta lo aún no leído. */
    descartar: () => void;
    /** Fin de la respuesta: se lee lo que quedara a medias. */
    cerrar: () => void;
    /** Frase propia (avisos, preguntas): se lee siempre, sin límite. */
    decir: (texto: string) => void;
    algoLeido: () => boolean;
    recortado: () => boolean;
}

const crearNarrador = (lector: LectorFrases, mostrar: (texto: string) => void): Narrador => {
    let pendiente = "";
    let mostrado = "";
    let caracteresLeidos = 0;
    let algoLeido = false;
    let recortado = false;

    const leer = (frase: string) => {
        const legible = fraseParaVoz(frase);
        if (!legible) return;
        if (recortado || caracteresLeidos + legible.length > LIMITE_CARACTERES_VOZ_STREAMING) {
            recortado = true;
            return;
        }
        caracteresLeidos += legible.length;
        algoLeido = true;
        lector.añadir(legible);
    };

    return {
        añadir: trozo => {
            pendiente += trozo;
            mostrado += trozo;
            mostrar(mostrado.trim());
            const { frases, resto } = separarFrases(pendiente);
            pendiente = resto;
            frases.forEach(leer);
        },
        descartar: () => {
            pendiente = "";
            mostrado = "";
        },
        cerrar: () => {
            if (pendiente.trim()) leer(pendiente);
            pendiente = "";
        },
        decir: texto => {
            mostrado = mostrado.trim() ? `${mostrado.trim()} ${texto}` : texto;
            mostrar(mostrado);
            algoLeido = true;
            lector.añadir(texto);
        },
        algoLeido: () => algoLeido,
        recortado: () => recortado,
    };
};

/**
 * Modo voz del asistente: escucha continua, frase de activación ("Oye Olula"),
 * envío de la orden al hilo de voz del usuario (canal "voz"), respuesta hablada
 * según llega, confirmaciones por voz e interrupción mientras habla.
 *
 * Funciona sin el chat abierto — no pasa por AsistenteRuntimeProvider (que guarda el
 * hilo activo del panel y lo pisaría): llama directamente a la API.
 *
 * Las transiciones están en maquinaModoVoz (dominio.ts). No se usa useMaquina porque
 * los eventos llegan desde callbacks del reconocedor y del TTS: el estado se lee de
 * una ref para no actuar sobre un estado obsoleto.
 */
const extensionAudio = (tipoMime: string): string =>
    tipoMime.includes("ogg") ? "ogg" : tipoMime.includes("mp4") ? "m4a" : tipoMime.includes("wav") ? "wav" : "webm";

const adjuntoDeAudio = (audio: AudioGrabado): AdjuntoIa => ({
    nombre: `orden-voz.${extensionAudio(audio.tipoMime)}`,
    tipoMime: audio.tipoMime,
    datosBase64: audio.datosBase64,
});

export function useModoVoz({ onNavegar, onMostrarHilo, onNivel, detector }: OpcionesModoVoz = {}): ModoVoz {
    const [activo, setActivo] = useModoVozActivo();
    const [modoCaptura] = useState(modoCapturaVoz);
    const pausado = useVozOcupada();
    const { menu } = useContext(FactoryCtx);
    const capacidades = useMemo(() => construirCapacidades(menu), [menu]);
    const { hablar, detener: detenerVoz, soportado: ttsSoportado } = useSintesisVoz();

    const [estado, setEstado] = useState<EstadoModoVoz>("inactivo");
    const estadoRef = useRef<EstadoModoVoz>("inactivo");
    const [textoEnVivo, setTextoEnVivo] = useState<string | null>(null);
    const [orden, setOrden] = useState<string | null>(null);
    const [progreso, setProgresoEstado] = useState<string | null>(null);
    const progresoRef = useRef<string | null>(null);
    const setProgreso = useCallback((texto: string | null) => {
        progresoRef.current = texto;
        setProgresoEstado(texto);
    }, []);
    const [respuesta, setRespuesta] = useState<string | null>(null);
    const [threadId, setThreadId] = useState<string | null>(null);
    const [errorGrabacion, setErrorGrabacion] = useState<string | null>(null);

    // undefined = aún no se ha buscado el hilo de voz; null = el usuario no tiene.
    const threadIdRef = useRef<string | null | undefined>(undefined);
    // Mismo protocolo que el chat: el hash lo calcula el servidor y solo se reenvía.
    const capacidadesHashRef = useRef<string | null>(null);
    // Cada turno (orden, confirmación) incrementa el contador; interrumpir también. Lo
    // que llegue de un turno ya superado se descarta.
    const turnoRef = useRef(0);
    const abortRef = useRef<AbortController | null>(null);
    // Lector del turno en curso — también sirve para reconocer el eco de lo que se lee.
    const lectorRef = useRef<LectorFrases | null>(null);
    const confirmacionRef = useRef<(ConfirmacionVoz & { threadId: string; intentos: number }) | null>(null);
    const temporizadorRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
    // Eco: lo último que ha dicho y cuándo terminó, y la sesión del reconocedor (se
    // renueva tras hablar para descartar lo que hubiera oído de sí mismo).
    const ultimoDichoRef = useRef<{ texto: string; fin: number }>({ texto: "", fin: 0 });
    const [sesionEscucha, setSesionEscucha] = useState(0);
    // Hablando fuera de una respuesta (avisos, repreguntar una confirmación): mientras
    // tanto no se acepta nada — su propio "¿lo confirmo?" no puede confirmar nada.
    const hablandoSueltoRef = useRef(false);
    // Modo audio: grabación de la orden en curso, y cuánto esperar a que se empiece a
    // hablar en la siguiente (más tras la frase de activación que en el seguimiento).
    const grabacionRef = useRef<AbortController | null>(null);
    const esperaGrabacionRef = useRef(ESPERA_ORDEN_MS);

    /** Al terminar de hablar: margen, y reconocimiento nuevo (sin el eco pendiente). */
    const trasHablar = useCallback(async (dicho: string) => {
        await new Promise(resolver => setTimeout(resolver, PAUSA_TRAS_HABLAR_MS));
        ultimoDichoRef.current = { texto: dicho, fin: Date.now() };
        setSesionEscucha(n => n + 1);
    }, []);

    const callbacksRef = useRef({ onNavegar, onMostrarHilo, onNivel });
    useEffect(() => {
        callbacksRef.current = { onNavegar, onMostrarHilo, onNivel };
    });

    const emitir = useCallback((evento: EventoModoVoz): boolean => {
        const siguiente = siguienteEstadoModoVoz(estadoRef.current, evento);
        if (siguiente === estadoRef.current) return false;
        estadoRef.current = siguiente;
        setEstado(siguiente);
        return true;
    }, []);

    const limpiarTemporizador = useCallback(() => clearTimeout(temporizadorRef.current), []);

    const esperarSilencio = useCallback((ms: number) => {
        clearTimeout(temporizadorRef.current);
        temporizadorRef.current = setTimeout(() => {
            if (emitir("silencio")) setTextoEnVivo(null);
        }, ms);
    }, [emitir]);

    const fijarHilo = useCallback((id: string | null) => {
        if (!id) return;
        threadIdRef.current = id;
        setThreadId(id);
    }, []);

    const resolverHilo = useCallback(async (): Promise<string | null> => {
        if (threadIdRef.current !== undefined) return threadIdRef.current;
        try {
            threadIdRef.current = hiloDeVoz(await listarHilos())?.threadId ?? null;
        } catch {
            // Sin listado no se sabe si existe: este turno abre hilo nuevo, pero no se
            // cachea para volver a buscarlo en el siguiente.
            return null;
        }
        setThreadId(threadIdRef.current);
        return threadIdRef.current;
    }, []);

    // Lo que el usuario tiene delante viaja en cada turno: "este pedido", "filtra por…".
    const consultaVoz = useCallback((pregunta: string, hilo: string | null, adjuntos?: AdjuntoIa[]): ConsultaIa => ({
        pregunta, threadId: hilo, canal: "voz", capacidades,
        contextoApp: {
            rutaActual: window.location.pathname,
            pantalla: construirContextoPantalla(
                window.location.pathname, window.location.search, describirPantalla(), capacidades),
        },
        ...(adjuntos?.length ? { adjuntos } : {}),
    }), [capacidades]);

    /** Respuesta completa (sin streaming) — también es el plan B si el stream falla. */
    const consultar = useCallback(async (pregunta: string, adjuntos?: AdjuntoIa[]): Promise<RespuestaIa> => {
        const hilo = await resolverHilo();
        const hash = capacidadesHashRef.current;
        let respuestaIa: RespuestaIa;
        try {
            const { capacidades: _, ...sinCapacidades } = consultaVoz(pregunta, hilo, adjuntos);
            respuestaIa = await consultarIa(
                hilo && hash ? { ...sinCapacidades, capacidadesHash: hash } : consultaVoz(pregunta, hilo, adjuntos)
            );
        } catch (e) {
            if (!hilo || !esErrorHiloNoEncontrado(e)) throw e;
            // Hilo de voz borrado desde el historial: se empieza otro.
            capacidadesHashRef.current = null;
            respuestaIa = await consultarIa(consultaVoz(pregunta, null, adjuntos));
        }
        if (respuestaIa.necesitaCapacidades) {
            respuestaIa = await consultarIa(consultaVoz(pregunta, respuestaIa.threadId || hilo, adjuntos));
        }
        fijarHilo(respuestaIa.threadId);
        capacidadesHashRef.current = respuestaIa.capacidadesHash;
        return respuestaIa;
    }, [resolverHilo, consultaVoz, fijarHilo]);

    /** Respuesta por streaming, leída según llega. null = el stream ha fallado antes de
     * leer nada: hay que pedir la respuesta completa. (El evento "fin" no trae el hash
     * de capacidades, así que aquí siempre se mandan completas, igual que el chat.) */
    const consultarEnStreaming = useCallback(async (
        pregunta: string, adjuntos: AdjuntoIa[] | undefined,
        narrador: Narrador, signal: AbortSignal, esVigente: () => boolean,
    ): Promise<ResultadoTurno | null> => {
        const hilo = await resolverHilo();
        const resultado: ResultadoTurno = { threadId: hilo, a2uiMessages: [], accionNavegacion: null, accionesPantalla: [] };
        let fallo = false;
        try {
            for await (const evento of consultarIaStream(consultaVoz(pregunta, hilo, adjuntos), signal)) {
                if (!esVigente()) return resultado;
                switch (evento.tipo) {
                    case "delta":
                        setProgreso(null);
                        narrador.añadir(evento.contenido);
                        break;
                    case "estado":
                        narrador.descartar();
                        setProgreso(evento.contenido);
                        break;
                    case "a2ui":
                        resultado.a2uiMessages.push(evento.a2uiMessage);
                        break;
                    case "accion_navegacion":
                        resultado.accionNavegacion = evento.accionNavegacion;
                        break;
                    case "accion_pantalla":
                        resultado.accionesPantalla.push(evento.accionPantalla);
                        break;
                    case "fin":
                        if (evento.necesitaCapacidades) fallo = true;
                        else resultado.threadId = evento.threadId || hilo;
                        break;
                    case "encolado":
                        resultado.threadId = evento.threadId || hilo;
                        narrador.añadir(`${evento.contenido}\n`);
                        break;
                    case "error":
                        fallo = true;
                        break;
                }
            }
        } catch (e) {
            if ((e as Error).name === "AbortError") return resultado;
            fallo = true;
        }
        if (fallo && !narrador.algoLeido()) {
            narrador.descartar();
            return null;
        }
        narrador.cerrar();
        fijarHilo(resultado.threadId);
        return resultado;
    }, [resolverHilo, consultaVoz, fijarHilo, setProgreso]);

    /** Deja de hacer lo que estuviera haciendo (pedir, leer, esperar confirmación) y
     * vuelve a la espera. */
    const interrumpir = useCallback((): boolean => {
        turnoRef.current++;
        abortRef.current?.abort();
        grabacionRef.current?.abort();
        lectorRef.current?.cancelar();
        confirmacionRef.current = null;
        limpiarTemporizador();
        detenerVoz();
        setProgreso(null);
        return emitir("cancelar");
    }, [limpiarTemporizador, detenerVoz, emitir, setProgreso]);

    const cancelar = useCallback(() => {
        if (interrumpir()) reproducirTono("cancelacion");
        setTextoEnVivo(null);
    }, [interrumpir]);

    /** Un turno completo: obtener la respuesta (leyéndola según llega), avisar de lo que
     * hay en pantalla, y quedar escuchando — o esperando el sí/no si pide confirmar. */
    const responder = useCallback(async (
        obtener: (narrador: Narrador, signal: AbortSignal, esVigente: () => boolean) => Promise<ResultadoTurno>,
    ) => {
        const turno = ++turnoRef.current;
        const esVigente = () => turno === turnoRef.current;
        const controller = new AbortController();
        abortRef.current = controller;
        // Si tarda, se dice (una vez) en qué está — o un "un momento". Va directo al TTS,
        // fuera del lector: la primera frase real lo corta, y no cuenta como respuesta.
        let empezado = false;
        const avisoTrabajando = setTimeout(() => {
            if (esVigente() && !empezado && estadoRef.current === "procesando") {
                void hablar(progresoRef.current ?? "Un momento…").catch(() => undefined);
            }
        }, ESPERA_AVISO_TRABAJANDO_MS);
        const marcarEmpezado = () => {
            empezado = true;
            clearTimeout(avisoTrabajando);
        };

        const lector = crearLectorFrases(hablar, () => {
            marcarEmpezado();
            if (esVigente()) emitir("respuesta");
        });
        lectorRef.current = lector;
        const narrador = crearNarrador(lector, texto => {
            if (esVigente()) setRespuesta(texto);
        });
        setRespuesta(null);
        setProgreso(null);

        let resultado: ResultadoTurno | null = null;
        try {
            resultado = await obtener(narrador, controller.signal, esVigente);
        } catch {
            if (!esVigente()) return;
            narrador.decir("No he podido consultar al asistente. Inténtalo de nuevo.");
        } finally {
            marcarEmpezado();
        }
        if (!esVigente()) return;
        setProgreso(null);

        let confirmacion: ConfirmacionVoz | null = null;
        if (resultado) {
            const { onNavegar: navegar, onMostrarHilo: mostrarHilo } = callbacksRef.current;
            if (resultado.accionNavegacion) {
                navegar?.(accionNavegacionConNombreCorto(resultado.accionNavegacion, capacidades));
            } else if (resultado.accionesPantalla.length) {
                // (Si además navega, la pantalla a la que se referían ya no estará.)
                const resultados = resultado.accionesPantalla.map(ejecutarAccionPantalla);
                const fallo = resultados.find(r => !r.ok);
                if (fallo) narrador.decir(fallo.mensaje ?? "No he podido hacerlo en la pantalla.");
                else if (!narrador.algoLeido()) narrador.decir(resultados.map(r => r.mensaje).filter(Boolean).join(" "));
            }
            if (resultado.a2uiMessages.length && resultado.threadId) mostrarHilo?.(resultado.threadId);
            confirmacion = resultado.threadId ? confirmacionPendiente(resultado.a2uiMessages) : null;
            if (confirmacion) {
                const pregunta = preguntaConfirmacionVoz(confirmacion);
                // En modo audio no se entiende un "sí" dicho (no hay transcripción).
                narrador.decir(modoCaptura === "audio" ? `${pregunta} Pulsa sí o no en pantalla.` : pregunta);
            } else {
                const aviso = avisoContenidoEnPantalla(resultado.a2uiMessages, narrador.recortado());
                if (aviso) narrador.decir(aviso);
            }
        }
        if (!narrador.algoLeido()) narrador.decir("Hecho.");

        await lector.terminar();
        if (!esVigente()) return;
        await trasHablar(lector.texto());
        if (!esVigente()) return;
        if (confirmacion && resultado?.threadId) {
            confirmacionRef.current = { ...confirmacion, threadId: resultado.threadId, intentos: 0 };
            if (emitir("pedir_confirmacion")) {
                esperarSilencio(modoCaptura === "audio" ? ESPERA_CONFIRMACION_AUDIO_MS : ESPERA_CONFIRMACION_MS);
            }
        } else {
            esperaGrabacionRef.current = ESPERA_SEGUIMIENTO_MS;
            // En modo audio el fin del seguimiento lo decide la grabación (si no se
            // habla, no hay frase), no un temporizador.
            if (emitir("fin_respuesta") && modoCaptura === "texto") esperarSilencio(ESPERA_SEGUIMIENTO_MS);
        }
    }, [hablar, emitir, capacidades, esperarSilencio, modoCaptura, setProgreso, trasHablar]);

    /** Orden dictada (texto) o grabada (audio, modo sin reconocimiento: la interpreta
     * el asistente directamente). */
    const enviarOrden = useCallback(async (dictado: string, audio?: AudioGrabado) => {
        limpiarTemporizador();
        setTextoEnVivo(null);
        // "12 con 50", "doce euros cincuenta", "12.50"… → "12,50": sin ambigüedad para el asistente.
        const texto = normalizarImportesDictados(dictado);
        if (!audio && esComandoDesactivar(texto)) {
            reproducirTono("cancelacion");
            setActivo(false);
            return;
        }
        if (!audio && esComandoCancelar(texto)) {
            cancelar();
            return;
        }
        // Una orden nueva mientras se atendía otra la sustituye.
        if (ESTADOS_OCUPADO.includes(estadoRef.current)) interrumpir();

        // Órdenes de pantalla cerradas ("siguiente página", "abre el tercero"…): al
        // momento, sin preguntar al asistente.
        const accionLocal = audio ? null : interpretarOrdenPantalla(texto, describirPantalla());
        if (accionLocal) {
            if (!emitir("orden")) return;
            setOrden(texto);
            await responder(async narrador => {
                const r: ResultadoAccionPantalla = ejecutarAccionPantalla(accionLocal);
                narrador.decir(r.mensaje ?? (r.ok ? "Hecho." : "No he podido hacerlo."));
                return {
                    threadId: threadIdRef.current ?? null, a2uiMessages: [], accionNavegacion: null, accionesPantalla: [],
                };
            });
            return;
        }

        if (!emitir("orden")) return;
        setOrden(audio ? "Nota de voz" : texto);
        const adjuntos = audio ? [adjuntoDeAudio(audio)] : undefined;

        await responder(async (narrador, signal, esVigente) => {
            if (VOZ_STREAMING) {
                const enStreaming = await consultarEnStreaming(texto, adjuntos, narrador, signal, esVigente);
                if (enStreaming) return enStreaming;
            }
            const respuestaIa = await consultar(texto, adjuntos);
            narrador.añadir(`${respuestaIa.respuesta}\n`);
            narrador.cerrar();
            return resultadoDeRespuesta(respuestaIa, null);
        });
    }, [limpiarTemporizador, setActivo, cancelar, interrumpir, emitir, responder, consultarEnStreaming, consultar]);

    const confirmar = useCallback(async (valor: boolean) => {
        const pendiente = confirmacionRef.current;
        if (!pendiente || estadoRef.current !== "confirmando") return;
        confirmacionRef.current = null;
        limpiarTemporizador();
        if (!emitir("confirmacion")) return;
        reproducirTono(valor ? "activacion" : "cancelacion");
        setOrden(valor ? "Sí, confírmalo" : "No, cancélalo");

        await responder(async narrador => {
            const respuestaIa = await enviarAccionA2ui({
                name: "confirm",
                surfaceId: pendiente.surfaceId,
                sourceComponentId: "root",
                timestamp: new Date().toISOString(),
                context: { value: valor },
            }, pendiente.threadId);
            // El chat (si está abierto) aún muestra la tarjeta con sus botones: se
            // recarga el hilo para que refleje la decisión.
            callbacksRef.current.onMostrarHilo?.(pendiente.threadId);
            narrador.añadir(`${respuestaIa.respuesta}\n`);
            narrador.cerrar();
            return resultadoDeRespuesta(respuestaIa, pendiente.threadId);
        });
    }, [limpiarTemporizador, emitir, responder]);

    /** Frase suelta fuera de un turno (p. ej. al no entender el sí/no). */
    const decirSuelto = useCallback(async (texto: string) => {
        const lector = crearLectorFrases(hablar);
        lectorRef.current = lector;
        setRespuesta(texto);
        hablandoSueltoRef.current = true;
        try {
            lector.añadir(texto);
            await lector.terminar();
            await trasHablar(texto);
        } finally {
            hablandoSueltoRef.current = false;
        }
    }, [hablar, trasHablar]);

    const repreguntarConfirmacion = useCallback(async () => {
        const pendiente = confirmacionRef.current;
        if (!pendiente) return;
        limpiarTemporizador();
        if (pendiente.intentos >= 1) {
            confirmacionRef.current = null;
            await decirSuelto("Lo dejo pendiente en el chat.");
            emitir("silencio");
            return;
        }
        pendiente.intentos++;
        await decirSuelto("Perdona, no te he entendido. ¿Lo confirmo?");
        if (estadoRef.current === "confirmando") esperarSilencio(ESPERA_CONFIRMACION_MS);
    }, [limpiarTemporizador, decirSuelto, emitir, esperarSilencio]);

    /** Modo audio: graba la orden (para sola con el silencio) y la envía. */
    const grabarOrden = useCallback(async () => {
        grabacionRef.current?.abort();
        const controller = new AbortController();
        grabacionRef.current = controller;
        let audio: AudioGrabado | null;
        try {
            audio = await grabarFrase({
                signal: controller.signal,
                esperaInicioMs: esperaGrabacionRef.current,
                onNivel: nivel => callbacksRef.current.onNivel?.(nivel),
            });
        } catch {
            if (controller.signal.aborted) return;
            setErrorGrabacion("No se ha podido abrir el micrófono");
            emitir("fallo");
            return;
        }
        if (controller.signal.aborted || estadoRef.current !== "escuchando_orden") return;
        if (audio) void enviarOrden("", audio);
        else emitir("silencio");
    }, [emitir, enviarOrden]);

    // En modo audio, estar "escuchando la orden" ES estar grabando: se graba al entrar
    // en ese estado (tras pulsar, o tras responder) y se corta al salir de él.
    const grabarOrdenRef = useRef(grabarOrden);
    useEffect(() => {
        grabarOrdenRef.current = grabarOrden;
    });
    useEffect(() => {
        if (modoCaptura !== "audio" || estado !== "escuchando_orden" || pausado) return;
        void grabarOrdenRef.current();
        return () => grabacionRef.current?.abort();
    }, [modoCaptura, estado, pausado]);

    const hablarAhora = useCallback(() => {
        if (pausado) return;
        if (ESTADOS_OCUPADO.includes(estadoRef.current)) interrumpir();
        esperaGrabacionRef.current = ESPERA_ORDEN_MS;
        if (emitir("frase_activacion")) reproducirTono("activacion");
        if (estadoRef.current === "escuchando_orden" && modoCaptura === "texto") esperarSilencio(ESPERA_ORDEN_MS);
    }, [pausado, interrumpir, emitir, modoCaptura, esperarSilencio]);

    // Modo audio con detector local: mientras se espera, el detector escucha la frase.
    const hablarAhoraRef = useRef(hablarAhora);
    useEffect(() => {
        hablarAhoraRef.current = hablarAhora;
    });
    useEffect(() => {
        if (!detector || modoCaptura !== "audio" || estado !== "en_espera" || pausado) return;
        let cancelado = false;
        let parar: (() => void) | null = null;
        detector.escuchar(() => hablarAhoraRef.current())
            .then(fn => {
                if (cancelado) fn();
                else parar = fn;
            })
            // Sin detector se puede seguir hablando pulsando.
            .catch(() => undefined);
        return () => {
            cancelado = true;
            parar?.();
        };
    }, [detector, modoCaptura, estado, pausado]);

    const alResultado = useCallback(({ texto, final }: ResultadoEscucha) => {
        const estadoActual = estadoRef.current;
        if (hablandoSueltoRef.current && estadoActual !== "en_espera") return;

        if (estadoActual === "en_espera") {
            const { activado, orden: resto } = detectarActivacion(texto);
            if (!activado) return;
            if (final && resto) {
                reproducirTono("activacion");
                void enviarOrden(resto);
                return;
            }
            // Se reacciona ya con la transcripción provisional: el aviso de "te
            // escucho" llega mientras el usuario sigue hablando.
            if (emitir("frase_activacion")) reproducirTono("activacion");
            setTextoEnVivo(resto || null);
            esperarSilencio(ESPERA_ORDEN_MS);
            return;
        }

        if (estadoActual === "escuchando_orden") {
            // Justo después de hablar, lo que se parezca a lo que acaba de decir es su
            // propio eco, no una orden.
            const dicho = ultimoDichoRef.current;
            if (Date.now() - dicho.fin < VENTANA_ECO_MS && esEcoDeVoz(texto, dicho.texto)) return;
            // La frase de activación puede seguir en el texto (es la misma frase
            // que se detectó en provisional y ahora llega completa).
            const { activado, orden: resto } = detectarActivacion(texto);
            const contenido = activado ? resto : texto;
            esperarSilencio(ESPERA_ORDEN_MS);
            if (!final) {
                setTextoEnVivo(contenido || null);
                return;
            }
            if (contenido) void enviarOrden(contenido);
            return;
        }

        if (!ESTADOS_OCUPADO.includes(estadoActual)) return;

        // Mientras piensa, habla o espera confirmación: el micro sigue abierto para
        // poder interrumpirle, así que lo primero es no reaccionar a su propia voz.
        const leido = lectorRef.current?.texto() ?? "";
        if (esEcoDeVoz(texto, leido)) return;

        const { activado, orden: resto } = detectarActivacion(texto);
        // Si lo que está leyendo contiene el nombre, ese "Olula" puede ser su eco.
        if (activado && !detectarActivacion(leido).activado) {
            if (final && resto) {
                void enviarOrden(resto);
                return;
            }
            interrumpir();
            if (emitir("frase_activacion")) reproducirTono("activacion");
            setTextoEnVivo(resto || null);
            esperarSilencio(ESPERA_ORDEN_MS);
            return;
        }
        if (!final) return;

        if (estadoActual === "confirmando") {
            const valor = parsearConfirmacionVoz(texto);
            if (valor !== null) void confirmar(valor);
            else if (esComandoCancelar(texto)) cancelar();
            else void repreguntarConfirmacion();
            return;
        }
        if (esComandoCancelar(texto)) cancelar();
    }, [emitir, enviarOrden, esperarSilencio, interrumpir, confirmar, cancelar, repreguntarConfirmacion]);

    const escucha = useEscuchaContinua({
        activa: activo && modoCaptura === "texto" && !pausado && !ESTADOS_SIN_ESCUCHA.includes(estado)
            && (INTERRUMPIR_MIENTRAS_HABLA || estado !== "respondiendo"),
        onResultado: alResultado,
        sesion: sesionEscucha,
    });

    const soportado = modoCaptura !== null && ttsSoportado;

    useEffect(() => {
        if (activo && soportado) {
            emitir("activar");
            return;
        }
        turnoRef.current++;
        abortRef.current?.abort();
        grabacionRef.current?.abort();
        lectorRef.current?.cancelar();
        confirmacionRef.current = null;
        limpiarTemporizador();
        detenerVoz();
        emitir("desactivar");
        setTextoEnVivo(null);
        setOrden(null);
        setProgreso(null);
        setRespuesta(null);
    }, [activo, soportado, emitir, limpiarTemporizador, detenerVoz, setProgreso]);

    useEffect(() => {
        if (escucha.error) emitir("fallo");
    }, [escucha.error, emitir]);

    useEffect(() => {
        if (!activo || estado !== "en_espera" || pausado) return;
        const temporizador = setTimeout(() => {
            void hablar("Desactivo el modo voz por inactividad.")
                .catch(() => undefined)
                .finally(() => setActivo(false));
        }, INACTIVIDAD_MS);
        return () => clearTimeout(temporizador);
    }, [activo, estado, pausado, hablar, setActivo]);

    // Avisos hablados (comunicaciones nuevas): se dicen si está esperando; si está
    // ocupado, el último se guarda y se dice al volver a la espera.
    const avisoPendienteRef = useRef<string | null>(null);
    const pausadoRef = useRef(pausado);
    useEffect(() => {
        pausadoRef.current = pausado;
    });
    const avisar = useCallback((texto: string) => {
        if (estadoRef.current === "en_espera" && !pausadoRef.current) void decirSuelto(texto);
        else avisoPendienteRef.current = texto;
    }, [decirSuelto]);
    useAvisosHablados(activo && soportado, avisar);
    useEffect(() => {
        if (estado !== "en_espera" || pausado || !avisoPendienteRef.current) return;
        const texto = avisoPendienteRef.current;
        avisoPendienteRef.current = null;
        void decirSuelto(texto);
    }, [estado, pausado, decirSuelto]);

    // Al reservar otra pantalla la voz, se deja a medias lo que se estuviera haciendo.
    useEffect(() => {
        if (!pausado) return;
        if (ESTADOS_OCUPADO.includes(estadoRef.current) || estadoRef.current === "escuchando_orden") interrumpir();
        setTextoEnVivo(null);
    }, [pausado, interrumpir]);

    useEffect(() => () => {
        limpiarTemporizador();
        abortRef.current?.abort();
        grabacionRef.current?.abort();
    }, [limpiarTemporizador]);

    const reintentar = useCallback(() => {
        escucha.reintentar();
        setErrorGrabacion(null);
        emitir("reintentar");
    }, [escucha, emitir]);

    const desactivar = useCallback(() => setActivo(false), [setActivo]);

    return {
        estado, modoCaptura, pausado, textoEnVivo, orden, progreso, respuesta,
        error: escucha.error ?? errorGrabacion, soportado, threadId,
        cancelar, hablarAhora, confirmar: valor => void confirmar(valor), reintentar, desactivar,
    };
}
