export const AUTH_STORAGE_KEYS = ["token-acceso", "token-refresco", "whoami"] as const;
export const AUTH_STORAGE_CHANGED_EVENT = "quimera:auth-storage-changed";

export const notifyAuthStorageChanged = () => {
    window.dispatchEvent(new Event(AUTH_STORAGE_CHANGED_EVENT));
};