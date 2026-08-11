import { plugin } from "../dominio.ts";
import {
    AUTH_STORAGE_CHANGED_EVENT,
    AUTH_STORAGE_KEYS,
} from "./auth_storage_events.ts";
import {
    ServerSentEventsClient,
    SseHandler,
} from "./server_sent_events_client.ts";
import { tokenAcceso } from "./token_acceso.ts";

type SessionSseEvents = Record<string, unknown>;

const API_BASE_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/+$/, "");
const SSE_URL = `${API_BASE_URL}/comun/eventos_sse`;

type SessionSseState = {
    retainCount: number;
    listenersBootstrapped: boolean;
    releaseSessionClient: (() => void) | null;
    sessionClient: ServerSentEventsClient;
};

type GlobalSessionSseScope = typeof globalThis & {
    __olulaSessionSseState__?: SessionSseState;
};

const getSessionSseState = (): SessionSseState => {
    const scope = globalThis as GlobalSessionSseScope;

    if (!scope.__olulaSessionSseState__) {
        scope.__olulaSessionSseState__ = {
            retainCount: 0,
            listenersBootstrapped: false,
            releaseSessionClient: null,
            sessionClient: new ServerSentEventsClient(SSE_URL, {
                withCredentials: true,
                getHeaders: () => {
                    const token = tokenAcceso.obtener();
                    return token ? { Authorization: `Bearer ${token}` } : undefined;
                },
            }),
        };
    }

    return scope.__olulaSessionSseState__;
};

const hasActiveSession = () => {
    return !!(
        localStorage.getItem("token-acceso") ||
        localStorage.getItem("token-refresco")
    );
};

const isSsePluginEnabled = () => plugin("eventos_sse") === "activo";

const shouldKeepConnected = () => {
    const state = getSessionSseState();
    return state.retainCount > 0 && hasActiveSession() && isSsePluginEnabled();
};

const syncSessionConnectionState = () => {
    const state = getSessionSseState();

    if (shouldKeepConnected()) {
        if (!state.releaseSessionClient) {
            state.releaseSessionClient = state.sessionClient.retain();
        }
        return;
    }

    if (state.releaseSessionClient) {
        state.releaseSessionClient();
        state.releaseSessionClient = null;
    }
};

const bootstrapSessionListeners = () => {
    const state = getSessionSseState();

    if (state.listenersBootstrapped) return;
    state.listenersBootstrapped = true;

    window.addEventListener("storage", (event) => {
        if (!event.key) {
            syncSessionConnectionState();
            return;
        }

        if (AUTH_STORAGE_KEYS.includes(event.key as (typeof AUTH_STORAGE_KEYS)[number])) {
            syncSessionConnectionState();
        }
    });

    window.addEventListener(AUTH_STORAGE_CHANGED_EVENT, () => {
        syncSessionConnectionState();
    });
};

export const retainGlobalServerSentEventsConnection = () => {
    const state = getSessionSseState();

    state.retainCount += 1;
    bootstrapSessionListeners();
    syncSessionConnectionState();

    return () => {
        state.retainCount = Math.max(0, state.retainCount - 1);
        syncSessionConnectionState();
    };
};

export const onGlobalServerSentEvent = <K extends keyof SessionSseEvents & string>(
    eventType: K,
    handler: SseHandler
) => {
    return getSessionSseState().sessionClient.on(eventType, handler);
};

export const reconnectGlobalServerSentEventsConnection = () => {
    getSessionSseState().sessionClient.reconnect();
    syncSessionConnectionState();
};

export const closeGlobalServerSentEventsConnection = () => {
    const state = getSessionSseState();
    state.retainCount = 0;
    syncSessionConnectionState();
};
