export const menuAuth = {
    "Administración": { icono: "menu_administracion", area: "Sistema" },
    "Administración/Usuarios": { url: "/auth/usuario", regla: "auth.usuario.leer" },
    "Administración/Grupos": { url: "/auth/grupo", regla: "auth.grupo.leer" },
    "Administración/Claves de API": { url: "/auth/apikey", regla: "auth.apikey.listar" },
};