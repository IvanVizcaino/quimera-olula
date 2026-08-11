import Quimera from "quimera";

function Container() {
    // Quimera.Reference is needed so Template delegates rendering to the parent (core Container).
    // Without at least one Reference child, Template renders children directly (nothing).
    return (
        <Quimera.Template id="Container">
            <Quimera.Reference id="containerBlock" type="append" />
        </Quimera.Template>
    );
}

export default Container;
