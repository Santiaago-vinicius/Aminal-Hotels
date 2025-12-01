import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const app = express();
app.use(express.json());
app.use(cors());

const prisma = new PrismaClient();
const PORT = 3333;
const SECRET_KEY = "animal-hotels-secret-key";

// Middleware de Autenticação
const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: 'Token não fornecido' });

  const [, token] = authHeader.split(' ');

  try {
    const decoded = jwt.verify(token, SECRET_KEY) as { id: string };
    req.headers['user-id'] = decoded.id;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token inválido' });
  }
};

// --- ROTAS PÚBLICAS ---

// Cadastro de Tutor
app.post('/tutors', async (req: Request, res: Response) => {
  const { name, email, phone, password } = req.body;
  
  try {
    const userExists = await prisma.tutor.findUnique({ where: { email } });
    if (userExists) {
      return res.status(400).json({ message: 'Email já cadastrado.' });
    }

    const newTutor = await prisma.tutor.create({
      data: { name, email, phone, password }
    });
    
    res.status(201).json({ id: newTutor.id, name: newTutor.name, email: newTutor.email });
  } catch (error) {
    res.status(500).json({ message: 'Erro interno ao cadastrar.' });
  }
});

// Login
app.post('/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const tutor = await prisma.tutor.findFirst({
    where: { email, password }
  });

  if (!tutor) {
    return res.status(401).json({ message: 'Email ou senha inválidos' });
  }

  const token = jwt.sign({ id: tutor.id, name: tutor.name }, SECRET_KEY, { expiresIn: '1h' });
  res.json({ tutor: { id: tutor.id, name: tutor.name, email: tutor.email }, token });
});

// --- ROTAS PRIVADAS ---

// Listar Animais
app.get('/my-animals', authMiddleware, async (req: Request, res: Response) => {
  const tutorId = req.headers['user-id'] as string;
  const myAnimals = await prisma.animal.findMany({ where: { tutorId } });
  res.json(myAnimals);
});

// Criar Animal
app.post('/animals', authMiddleware, async (req: Request, res: Response) => {
  const tutorId = req.headers['user-id'] as string;
  const { name, species, breed, age } = req.body;

  const newAnimal = await prisma.animal.create({
    data: { name, species, breed, age, tutorId }
  });

  res.status(201).json(newAnimal);
});

// Atualizar Animal
app.put('/animals/:id', authMiddleware, async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, species, breed, age } = req.body;
  
  await prisma.animal.update({
    where: { id },
    data: { name, species, breed, age }
  });
  
  res.json({ message: "Atualizado" });
});

// Deletar Animal
app.delete('/animals/:id', authMiddleware, async (req: Request, res: Response) => {
  const { id } = req.params;
  await prisma.animal.delete({ where: { id } });
  res.status(204).send();
});

// Rotas de Perfil
app.put('/tutors', authMiddleware, async (req: Request, res: Response) => {
  const id = req.headers['user-id'] as string;
  const { name, email, phone } = req.body;
  const updated = await prisma.tutor.update({ where: { id }, data: { name, email, phone } });
  res.json(updated);
});

app.delete('/tutors', authMiddleware, async (req: Request, res: Response) => {
  const id = req.headers['user-id'] as string;
  await prisma.animal.deleteMany({ where: { tutorId: id } });
  await prisma.tutor.delete({ where: { id } });
  res.status(204).send();
});

app.listen(PORT, () => console.log(`🚀 API rodando na porta ${PORT}`));