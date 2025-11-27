import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client'; // Importamos o Prisma

const app = express();
app.use(express.json());
app.use(cors());

const prisma = new PrismaClient(); // Conecta com o arquivo dev.db
const PORT = 3333;
const SECRET_KEY = "minha_senha_super_secreta_animal_hotels";

// --- MIDDLEWARE DE AUTENTICAÇÃO (Igual ao anterior) ---
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

// --- ROTAS ---

// 1. Cadastro de Tutor (Agora salva no Banco)
app.post('/tutors', async (req: Request, res: Response) => {
  const { name, email, phone, password } = req.body;
  
  // Verifica no banco se email existe
  const userExists = await prisma.tutor.findUnique({ where: { email } });
  if (userExists) {
    return res.status(400).json({ message: 'Email já cadastrado' });
  }

  // Cria no banco
  const newTutor = await prisma.tutor.create({
    data: { name, email, phone, password }
  });
  
  res.status(201).json({ id: newTutor.id, name: newTutor.name, email: newTutor.email });
});

// 2. Login (Busca no Banco)
app.post('/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;

  // Procura alguém com esse email E senha
  const tutor = await prisma.tutor.findFirst({
    where: { email, password }
  });

  if (!tutor) {
    return res.status(401).json({ message: 'Email ou senha inválidos' });
  }

  const token = jwt.sign({ id: tutor.id, name: tutor.name }, SECRET_KEY, { expiresIn: '1h' });
  res.json({ tutor: { id: tutor.id, name: tutor.name, email: tutor.email }, token });
});

// 3. Listar MEUS animais
app.get('/my-animals', authMiddleware, async (req: Request, res: Response) => {
  const tutorId = req.headers['user-id'] as string;
  
  const myAnimals = await prisma.animal.findMany({
    where: { tutorId } // Filtra pelo ID do dono
  });
  
  res.json(myAnimals);
});

// 4. Cadastrar Animal
app.post('/animals', authMiddleware, async (req: Request, res: Response) => {
  const tutorId = req.headers['user-id'] as string;
  const { name, species, breed, age } = req.body;

  const newAnimal = await prisma.animal.create({
    data: {
      name, species, breed, age, tutorId
    }
  });

  res.status(201).json(newAnimal);
});

// 5. Deletar Animal
app.delete('/animals/:id', authMiddleware, async (req: Request, res: Response) => {
  const { id } = req.params;
  const tutorId = req.headers['user-id'] as string;

  // Deleta SOMENTE se o animal for desse tutor (Segurança!)
  const deleted = await prisma.animal.deleteMany({
    where: {
      id: id,
      tutorId: tutorId 
    }
  });

  if (deleted.count === 0) {
    return res.status(404).json({ message: 'Animal não encontrado ou não te pertence' });
  }

  res.status(204).send();
});

// 6. Atualizar Animal (UPDATE)
app.put('/animals/:id', authMiddleware, async (req: Request, res: Response) => {
  const { id } = req.params;
  const tutorId = req.headers['user-id'] as string;
  const { name, species, breed, age } = req.body;

  // Verifica se o animal pertence ao tutor antes de alterar
  const animal = await prisma.animal.findFirst({
    where: { id, tutorId }
  });

  if (!animal) {
    return res.status(404).json({ message: 'Animal não encontrado.' });
  }

  const updatedAnimal = await prisma.animal.update({
    where: { id },
    data: { name, species, breed, age }
  });

  res.json(updatedAnimal);
});

// 7. Atualizar Perfil do Tutor (UPDATE)
app.put('/tutors', authMiddleware, async (req: Request, res: Response) => {
  const id = req.headers['user-id'] as string; // Pega o ID do token
  const { name, email, phone } = req.body;

  try {
    const updatedTutor = await prisma.tutor.update({
      where: { id },
      data: { name, email, phone }
    });

    // Remove a senha antes de devolver
    const { password, ...tutorSemSenha } = updatedTutor;
    res.json(tutorSemSenha);
  } catch (error) {
    res.status(400).json({ message: 'Erro ao atualizar. Email pode já estar em uso.' });
  }
});

// 8. Deletar Conta do Tutor (DELETE) - CUIDADO! ☢️
app.delete('/tutors', authMiddleware, async (req: Request, res: Response) => {
  const id = req.headers['user-id'] as string;

  // O Prisma exige que a gente delete os animais primeiro (Cascata Manual)
  await prisma.animal.deleteMany({
    where: { tutorId: id }
  });

  // Agora deleta o tutor
  await prisma.tutor.delete({
    where: { id }
  });

  res.status(204).send();
});

app.listen(PORT, () => console.log(`🐶 API com Banco de Dados rodando na porta ${PORT}`));