import { MaestroConDetalleGruposReglas } from '@olula/ctx/auth/grupos/vistas/MaestroConDetalleGruposReglas.tsx';
import { Login } from './login/vistas/Login.tsx';
import { Logout } from './usuario/vistas/Logout.tsx';
import { MaestroConDetalleUsuario } from "./usuario/vistas/MaestroDetalleUsuario.tsx";
import Perfil from './usuario/vistas/Perfil.tsx';

export const routerAuth = {
    "auth/usuario": MaestroConDetalleUsuario,
    "auth/grupo": MaestroConDetalleGruposReglas,
    "login": Login,
    "logout": Logout,
    "usuario/perfil": Perfil,
}