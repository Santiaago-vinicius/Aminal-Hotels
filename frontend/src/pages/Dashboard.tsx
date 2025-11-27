import { Link } from "react-router-dom"; 
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";
import { Trash2, Plus, Pencil, Cat, Dog, Rabbit, Save } from "lucide-react"; // Adicionei Pencil e Save

interface Animal {
  id: string;
  name: string;
  species: 'dog' | 'cat' | 'other';
  breed: string;
  age: number;
}

export function Dashboard() {
  const { user, token, logout } = useContext(AuthContext);
  const [animals, setAnimals] = useState<Animal[]>([]);
  
  // Estado para controlar se estamos EDITANDO alguém (guarda o ID)
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    species: "dog",
    breed: "",
    age: ""
  });

  const api = axios.create({
    baseURL: 'http://localhost:3333',
    headers: { Authorization: `Bearer ${token}` }
  });

  useEffect(() => { loadAnimals(); }, []);

  async function loadAnimals() {
    try {
      const response = await api.get('/my-animals');
      setAnimals(response.data);
    } catch (error) { console.error(error); }
  }

  // Função inteligente: Serve tanto para CRIAR quanto para ATUALIZAR
  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    try {
      const payload = { ...formData, age: Number(formData.age) };

      if (editingId) {
        // MODO EDIÇÃO (PUT)
        await api.put(`/animals/${editingId}`, payload);
        setEditingId(null); // Sai do modo edição
        alert("Animal atualizado!");
      } else {
        // MODO CRIAÇÃO (POST)
        await api.post('/animals', payload);
      }
      
      setFormData({ name: "", species: "dog", breed: "", age: "" });
      loadAnimals(); 
    } catch (error) {
      alert("Erro ao salvar.");
    }
  }

  // Preenche o formulário quando clica no Lápis
  function startEditing(animal: Animal) {
    setEditingId(animal.id);
    setFormData({
      name: animal.name,
      species: animal.species,
      breed: animal.breed,
      age: String(animal.age)
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setFormData({ name: "", species: "dog", breed: "", age: "" });
  }

  async function handleDelete(id: string) {
    if(!confirm("Tem certeza?")) return;
    try {
      await api.delete(`/animals/${id}`);
      setAnimals(animals.filter(a => a.id !== id));
    } catch (error) { alert("Erro ao deletar."); }
  }

  const getIcon = (species: string) => {
    if (species === 'dog') return <Dog className="text-blue-500" />;
    if (species === 'cat') return <Cat className="text-purple-500" />;
    return <Rabbit className="text-green-500" />;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Header com Link para Perfil */}
        <div className="flex justify-between items-center mb-8 bg-white p-6 rounded-lg shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Meus Pets 🐾</h1>
            <p className="text-gray-500">Olá, {user?.name}</p>
          </div>
          <div className="flex gap-4">
            <Link to="/profile" className="text-blue-600 hover:underline px-4 py-2">
                Meu Perfil
            </Link>
            <button onClick={logout} className="text-red-500 hover:text-red-700 font-medium">
              Sair
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Formulário Inteligente */}
          <div className="bg-white p-6 rounded-lg shadow-sm h-fit border-t-4 border-blue-500">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              {editingId ? <Pencil size={20}/> : <Plus size={20} />} 
              {editingId ? "Editar Pet" : "Novo Pet"}
            </h2>
            
            <form onSubmit={handleSave} className="space-y-3">
              <input 
                placeholder="Nome" className="w-full p-2 border rounded"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})} required
              />
              <div className="flex gap-2">
                <select 
                  className="p-2 border rounded flex-1"
                  value={formData.species}
                  onChange={e => setFormData({...formData, species: e.target.value})}
                >
                  <option value="dog">Cachorro</option>
                  <option value="cat">Gato</option>
                  <option value="other">Outro</option>
                </select>
                <input 
                  type="number" placeholder="Idade" className="w-20 p-2 border rounded"
                  value={formData.age}
                  onChange={e => setFormData({...formData, age: e.target.value})} required
                />
              </div>
              <input 
                placeholder="Raça" className="w-full p-2 border rounded"
                value={formData.breed}
                onChange={e => setFormData({...formData, breed: e.target.value})} required
              />
              
              <button className={`w-full text-white p-2 rounded flex items-center justify-center gap-2 ${editingId ? 'bg-orange-500 hover:bg-orange-600' : 'bg-blue-600 hover:bg-blue-700'}`}>
                {editingId ? <><Save size={18}/> Salvar Alterações</> : "Adicionar"}
              </button>

              {editingId && (
                <button type="button" onClick={cancelEdit} className="w-full text-gray-500 text-sm hover:underline">
                  Cancelar Edição
                </button>
              )}
            </form>
          </div>

          {/* Lista */}
          <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {animals.map(animal => (
              <div key={animal.id} className={`bg-white p-4 rounded-lg shadow-sm border flex justify-between items-start ${editingId === animal.id ? 'border-orange-500 ring-2 ring-orange-100' : 'border-gray-100'}`}>
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-gray-100 rounded-full">{getIcon(animal.species)}</div>
                  <div>
                    <h3 className="font-bold text-gray-800">{animal.name}</h3>
                    <p className="text-sm text-gray-500">{animal.breed}, {animal.age} anos</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => startEditing(animal)} className="text-gray-400 hover:text-blue-500 p-1" title="Editar">
                    <Pencil size={18} />
                  </button>
                  <button onClick={() => handleDelete(animal.id)} className="text-gray-400 hover:text-red-500 p-1" title="Excluir">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}