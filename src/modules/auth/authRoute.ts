import { Router } from "express";
import {
  loginController,
  logoutController,
  meController,
  refreshTokenController,
} from "./authController";
import { authRateLimit } from "../../middlewares/security";

const router = Router();

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Login utente
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login riuscito
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode: { type: number }
 *                 token: { type: string }
 *                 user: { type: object }
 *       401:
 *         description: Credenziali non valide
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post("/login", authRateLimit, loginController);

/**
 * @openapi
 * /api/auth/logout:
 *   post:
 *     tags: [Auth]
 *     summary: Logout utente
 *     security: []
 *     responses:
 *       200:
 *         description: Logout riuscito
 */
router.post("/logout", authRateLimit, logoutController);

/**
 * @openapi
 * /api/auth/refresh:
 *   post:
 *     tags: [Auth]
 *     summary: Rinnova access token tramite refresh token (cookie)
 *     security: []
 *     responses:
 *       200:
 *         description: Nuovo access token emesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode: { type: number }
 *                 token: { type: string }
 *       401:
 *         description: Refresh token mancante o non valido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post("/refresh", authRateLimit, refreshTokenController);

/**
 * @openapi
 * /api/auth/me:
 *   get:
 *     tags: [Auth]
 *     summary: Dati utente autenticato
 *     responses:
 *       200:
 *         description: Dati utente
 *       401:
 *         description: Non autenticato
 */
router.get("/me", meController);

export default router;