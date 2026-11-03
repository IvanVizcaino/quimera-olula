import { fetchEventSource } from "@microsoft/fetch-event-source";

export type SseHandler = (event: MessageEvent) => void;

type SseOptions = {
    withCredentials?: boolean;
    getHeaders?: () => Record<string, string> | undefined;
};

const SSE_RETRY_BASE_MS = 30000;
const SSE_RETRY_JITTER_MS = 5000;

const normalizeEventType = (eventType?: string) => {
    const normalized = (eventType || "message").trim();
    return normalized || "message";
};

export class ServerSentEventsClient {
    private abortController: AbortController | null = null;
    private refs = 0;
    private readonly listeners = new Map<string, Set<SseHandler>>();

    constructor(
        private readonly url: string | (() => string),
        private readonly options: SseOptions = {}
    ) { }

    retain(): () => void {
        this.refs += 1;
        this.sync();
        return () => this.release();
    }

    release(): void {
        this.refs = Math.max(0, this.refs - 1);
        this.sync();
    }

    reconnect(): void {
        this.close();
        this.sync();
    }

    on(eventType: string, handler: SseHandler): () => void {
        const normalizedEventType = normalizeEventType(eventType);
        const set = this.listeners.get(normalizedEventType) ?? new Set<SseHandler>();
        set.add(handler);
        this.listeners.set(normalizedEventType, set);

        return () => this.off(normalizedEventType, handler);
    }

    off(eventType: string, handler: SseHandler): void {
        const normalizedEventType = normalizeEventType(eventType);
        const set = this.listeners.get(normalizedEventType);
        if (!set) return;

        set.delete(handler);
        if (set.size > 0) return;

        this.listeners.delete(normalizedEventType);
    }

    private sync(): void {
        if (this.refs > 0) return this.open();
        this.close();
    }

    private open(): void {
        if (this.abortController) return;

        const resolvedUrl = typeof this.url === "function" ? this.url() : this.url;
        const abortController = new AbortController();
        this.abortController = abortController;

        void fetchEventSource(resolvedUrl, {
            method: "GET",
            headers: this.options.getHeaders?.(),
            credentials: this.options.withCredentials ? "include" : "same-origin",
            signal: abortController.signal,
            openWhenHidden: true,
            onopen: async (response) => {
                if (response.status === 401 || response.status === 403) {
                    abortController.abort();
                    throw new Error(`SSE auth error: ${response.status}`);
                }
            },
            onmessage: (message) => {
                const eventType = normalizeEventType(message.event);
                const handlers = this.listeners.get(eventType);
                if (!handlers) return;

                const event = new MessageEvent(eventType, {
                    data: message.data,
                    lastEventId: message.id,
                });

                for (const handler of handlers) {
                    handler(event);
                }
            },
            onerror: () => {
                // Throwing stops fetch-event-source retries.
                if (this.refs <= 0 || abortController.signal.aborted) {
                    throw new Error("SSE connection stopped");
                }

                // Slow down retries when server/network is unavailable.
                return SSE_RETRY_BASE_MS + Math.floor(Math.random() * SSE_RETRY_JITTER_MS);
            },
        }).catch(() => {
            // Errors are handled by onerror/onopen above.
        }).finally(() => {
            if (this.abortController === abortController) {
                this.abortController = null;
            }
            // No manual reopen here — fetch-event-source already retries via onerror.
        });
    }

    private close(): void {
        if (!this.abortController) return;
        this.abortController.abort();
        this.abortController = null;
    }
}
