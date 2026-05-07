import { describe, it, expect, beforeAll } from "vitest";
import jwt from "jsonwebtoken";

// Setup env prima di importare il modulo
beforeAll(() => {
  process.env.JWT_SECRET = "test-secret-key-almeno-32-caratteri-ok";
});

// Import dinamico dopo aver settato env
const getModule = () => import("../../../../src/modules/user/userSecurity");

describe("verifyResetPasswordToken", () => {
  it("accetta un token valido con purpose reset", async () => {
    const { verifyResetPasswordToken } = await getModule();

    const userId = "64abc123456789012345abcd";
    const token = jwt.sign(
      { userId, purpose: "reset" },
      process.env.JWT_SECRET!,
      { expiresIn: "15m" },
    );

    const payload = verifyResetPasswordToken(token, userId);

    expect(payload.userId).toBe(userId);
    expect(payload.purpose).toBe("reset");
  });

  it("rifiuta un token con purpose sbagliato", async () => {
    const { verifyResetPasswordToken } = await getModule();

    const userId = "64abc123456789012345abcd";
    const token = jwt.sign(
      { userId, purpose: "refresh" }, // purpose sbagliato
      process.env.JWT_SECRET!,
      { expiresIn: "15m" },
    );

    expect(() => verifyResetPasswordToken(token, userId)).toThrow(
      "Token non valido per questo scopo",
    );
  });

  it("rifiuta un token scaduto", async () => {
    const { verifyResetPasswordToken } = await getModule();

    const userId = "64abc123456789012345abcd";
    const token = jwt.sign(
      { userId, purpose: "reset" },
      process.env.JWT_SECRET!,
      { expiresIn: "-1s" }, // già scaduto
    );

    expect(() => verifyResetPasswordToken(token, userId)).toThrow(
      "Token non valido o scaduto",
    );
  });

  it("rifiuta un token con userId diverso", async () => {
    const { verifyResetPasswordToken } = await getModule();

    const token = jwt.sign(
      { userId: "64abc123456789012345abcd", purpose: "reset" },
      process.env.JWT_SECRET!,
      { expiresIn: "15m" },
    );

    expect(() => verifyResetPasswordToken(token, "altro-user-id")).toThrow(
      "Token non valido per questo utente",
    );
  });

  it("rifiuta un token firmato con segreto diverso", async () => {
    const { verifyResetPasswordToken } = await getModule();

    const userId = "64abc123456789012345abcd";
    const token = jwt.sign({ userId, purpose: "reset" }, "segreto-sbagliato", {
      expiresIn: "15m",
    });

    expect(() => verifyResetPasswordToken(token, userId)).toThrow(
      "Token non valido o scaduto",
    );
  });
});
