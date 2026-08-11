export const menuAuth = {
    // ********** Sección Administración **********
    "Administración": { icono: "ajustes", posicion: 4 },
    "Administración/Usuarios": {
        url: "/auth/usuario",
        regla: "auth.usuario.leer",
        icono: "usuarios",
    },
    "Administración/Grupos": {
        url: "/auth/grupo",
        regla: "auth.grupo.leer",
        icono: "grupo",
    },
};
