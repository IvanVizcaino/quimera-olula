import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";
import { BotoneraJornadaBorrador } from "../detalle/BotoneraJornadaBorrador.tsx";

const noOp = vi.fn();

describe("[botonera-01] En estado Activa se muestran los botones Pausar y Terminar", () => {
    test("muestra el botón Pausar", () => {
        render(<BotoneraJornadaBorrador estadoBorrador="ACTIVA" onPausa={noOp} onStop={noOp} onPlay={noOp} />);
        expect(screen.getByRole("button", { name: "Pausar" })).toBeInTheDocument();
    });

    test("muestra el botón Terminar", () => {
        render(<BotoneraJornadaBorrador estadoBorrador="ACTIVA" onPausa={noOp} onStop={noOp} onPlay={noOp} />);
        expect(screen.getByRole("button", { name: "Terminar" })).toBeInTheDocument();
    });

    test("llama a onPausa al pulsar Pausar", async () => {
        const onPausa = vi.fn();
        render(<BotoneraJornadaBorrador estadoBorrador="ACTIVA" onPausa={onPausa} onStop={noOp} onPlay={noOp} />);
        await userEvent.click(screen.getByRole("button", { name: "Pausar" }));
        expect(onPausa).toHaveBeenCalledOnce();
    });

    test("llama a onStop al pulsar Terminar", async () => {
        const onStop = vi.fn();
        render(<BotoneraJornadaBorrador estadoBorrador="ACTIVA" onPausa={noOp} onStop={onStop} onPlay={noOp} />);
        await userEvent.click(screen.getByRole("button", { name: "Terminar" }));
        expect(onStop).toHaveBeenCalledOnce();
    });

    test("no muestra el botón Reanudar", () => {
        render(<BotoneraJornadaBorrador estadoBorrador="ACTIVA" onPausa={noOp} onStop={noOp} onPlay={noOp} />);
        expect(screen.queryByRole("button", { name: "Reanudar" })).not.toBeInTheDocument();
    });
});

describe("[botonera-02] En estado Pausada se muestra el botón Reanudar", () => {
    test("muestra el botón Reanudar", () => {
        render(<BotoneraJornadaBorrador estadoBorrador="PAUSADA" onPausa={noOp} onStop={noOp} onPlay={noOp} />);
        expect(screen.getByRole("button", { name: "Reanudar" })).toBeInTheDocument();
    });

    test("llama a onPlay al pulsar Reanudar", async () => {
        const onPlay = vi.fn();
        render(<BotoneraJornadaBorrador estadoBorrador="PAUSADA" onPausa={noOp} onStop={noOp} onPlay={onPlay} />);
        await userEvent.click(screen.getByRole("button", { name: "Reanudar" }));
        expect(onPlay).toHaveBeenCalledOnce();
    });

    test("no muestra los botones Pausar ni Terminar", () => {
        render(<BotoneraJornadaBorrador estadoBorrador="PAUSADA" onPausa={noOp} onStop={noOp} onPlay={noOp} />);
        expect(screen.queryByRole("button", { name: "Pausar" })).not.toBeInTheDocument();
        expect(screen.queryByRole("button", { name: "Terminar" })).not.toBeInTheDocument();
    });
});

describe("[botonera-03] En estado Cerrada o sin estado no se muestra la botonera", () => {
    test("no muestra ningún botón cuando estadoBorrador es CERRADA", () => {
        render(<BotoneraJornadaBorrador estadoBorrador="CERRADA" onPausa={noOp} onStop={noOp} onPlay={noOp} />);
        expect(screen.queryByRole("button")).not.toBeInTheDocument();
    });

    test("no muestra ningún botón cuando estadoBorrador es null", () => {
        render(<BotoneraJornadaBorrador estadoBorrador={null} onPausa={noOp} onStop={noOp} onPlay={noOp} />);
        expect(screen.queryByRole("button")).not.toBeInTheDocument();
    });
});
