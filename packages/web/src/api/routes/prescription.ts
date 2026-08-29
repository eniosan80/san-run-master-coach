import { Hono } from 'hono';
import type { AthleteProfile, ReadinessInput } from '../services/prescription';
import { PrescriptionEngine, ReadinessProtocol } from '../services/prescription';

const app = new Hono();

app.post('/prescribe', async (c) => {
  const body = await c.req.json() as {
    athlete: AthleteProfile;
    readiness: ReadinessInput;
  };

  // Avaliar prontidão
  const readinessResult = ReadinessProtocol.evaluate(body.readiness);

  // Prescrever treino
  const prescription = PrescriptionEngine.prescribe(
    body.athlete,
    readinessResult.readinessLevel,
    readinessResult.readinessScore
  );

  return c.json({
    readiness: readinessResult,
    prescription,
  });
});

export default app;
