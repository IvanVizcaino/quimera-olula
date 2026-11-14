import { MaestroApiKeys } from './apikey/maestro/MaestroApiKeys.tsx';
import { MaestroConDetalleGruposReglas } from '@olula/ctx/auth/grupos/maestro/MaestroConDetalleGruposReglas.tsx';
import { Login } from './login/vistas/Login.tsx';
import { ResetPassword } from './login/vistas/ResetPassword.tsx';
import { VerificarEnlaceMagicoPasskey } from './passkey/vistas/VerificarEnlaceMagicoPasskey.tsx';
import { Logout } from './usuario/logout/Logout.tsx';
import { MaestroConDetalleUsuario } from "./usuario/maestro/MaestroConDetalleUsuario.tsx";
import Perfil from './usuario/perfil/Perfil.tsx';

export const routerAuth = {
    "auth/usuario": MaestroConDetalleUsuario,
    "auth/grupo": MaestroConDetalleGruposReglas,
    "auth/apikey": MaestroApiKeys,
    "login": Login,
    "logout": Logout,
    "usuario/perfil": Perfil,
    "auth/passkey/enlace-magico": VerificarEnlaceMagicoPasskey,
    "auth/reset-password": ResetPassword,
}