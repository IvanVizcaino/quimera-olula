import { BotonRegistrarPasskey } from "../../passkey/vistas/BotonRegistrarPasskey.tsx";

export const Perfil = () => {
  return (
    <div style={{ padding: "2rem" }}>
      <h2>Perfil de usuario</h2>
      <section style={{ marginTop: "2rem" }}>
        <h3>Passkeys</h3>
        <p style={{ marginBottom: "1rem", color: "var(--color-texto-secundario, #666)" }}>
          Registra una passkey para iniciar sesión sin contraseña.
        </p>
        <BotonRegistrarPasskey />
      </section>
    </div>
  );
};

export default Perfil;
