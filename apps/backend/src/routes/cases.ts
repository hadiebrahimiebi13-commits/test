import { Router } from 'express';
import { prisma } from '../prisma';
import { CaseCreate, AnswerSubmit } from '../../../../packages/shared/src/index';
import { requireAuth } from '../middleware/auth';

const router = Router();

// Create a case (admin)
router.post('/', requireAuth('ADMIN'), async (req, res) => {
  const parsed = CaseCreate.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.format() });
  const { title, description, finalDiagnosis, images = [], questions = [] } = parsed.data;

  const created = await prisma.$transaction(async (tx) => {
    const pc = await tx.patientCase.create({ data: { title, description, finalDiagnosis } });
    if (images.length) {
      await Promise.all(images.map((img) => tx.caseImage.create({ data: { caseId: pc.id, url: img.url, caption: img.caption } })));
    }
    if (questions.length) {
      await Promise.all(
        questions.map((q, idx) =>
          tx.caseQuestion.create({ data: { caseId: pc.id, prompt: q.prompt, options: q.options as any, correctIndex: q.correctIndex ?? null, explanation: q.explanation, order: q.order ?? idx } })
        )
      );
    }
    return pc;
  });
  res.json(created);
});

// list public cases (no questions details)
router.get('/', async (req, res) => {
  const cases = await prisma.patientCase.findMany({ select: { id: true, title: true, description: true, createdAt: true } });
  res.json(cases);
});

// get full case with questions
router.get('/:id', async (req, res) => {
  const pc = await prisma.patientCase.findUnique({ where: { id: req.params.id }, include: { images: true, questions: true } });
  if (!pc) return res.status(404).json({ error: 'Not found' });
  res.json(pc);
});

// submit answers
router.post('/:id/submit', async (req, res) => {
  const parsed = AnswerSubmit.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.format() });
  const { userId, answers } = parsed.data;
  const pc = await prisma.patientCase.findUnique({ where: { id: req.params.id }, include: { questions: true } });
  if (!pc) return res.status(404).json({ error: 'Case not found' });

  const qMap = new Map(pc.questions.map((q) => [q.id, q]));

  const responses = await prisma.$transaction(
    answers.map((a) => {
      const q = qMap.get(a.questionId);
      const correct = q && typeof q.correctIndex === 'number' ? q.correctIndex === a.selectedIndex : false;
      return prisma.userResponse.create({ data: { userId: userId ?? 'anonymous', caseId: req.params.id, questionId: a.questionId, selectedIndex: a.selectedIndex, correct } });
    })
  );

  // prepare feedback
  const feedback = answers.map((a) => {
    const q = qMap.get(a.questionId);
    return { questionId: a.questionId, selectedIndex: a.selectedIndex, correct: q ? q.correctIndex === a.selectedIndex : false, explanation: q?.explanation ?? null };
  });

  res.json({ ok: true, feedback, responses });
});

export default router;
