export const menuAuth = {
    "Administración": { icono: "menu_administracion", area: "Sistema" },
    "Administración/Usuarios": { url: "/auth/usuario", regla: "auth.usuario.leer" },
    "Administración/Grupos": { url: "/auth/grupo", regla: "auth.grupo.leer" },
    "Administración/Cola de eventos": { alias: ["flcolas", "eventos fallidos", "reiniciar proceso"], url: "/auth/evento_cola", regla: "comun.evento_cola" },
    "Administración/Claves de API": { url: "/auth/apikey", regla: "auth.apikey.listar" },
};