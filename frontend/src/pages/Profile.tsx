import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { api } from "../services/api";
import { useNavigate, Link } from "react-router-dom";
import { User, Mail, Phone, Save, Trash2, ArrowLeft } from "lucide-react";

export function Profile() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: "" 
  });

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    try {
      await api.put('/tutors', formData);
      alert("Perfil atualizado! Faça login novamente para ver as mudanças.");
      logout(); 
      navigate('/');
    } catch (error) {
      alert("Erro ao atualizar.");
    }
  }

  async function handleDeleteAccount() {
    const confirm1 = confirm("ATENÇÃO: Isso excluirá sua conta e TODOS os seus animais.");
    if (!confirm1) return;
    
    const confirm2 = confirm("Tem certeza absoluta? Essa ação não pode ser desfeita.");
    if (!confirm2) return;

    try {
      await api.delete('/tutors');
      alert("Conta excluída. Sentiremos sua falta! 😢");
      logout();
      navigate('/');
    } catch (error) {
      alert("Erro ao excluir conta.");
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <Link to="/dashboard" className="flex items-center text-gray-500 hover:text-blue-600 mb-6">
          <ArrowLeft size={18} className="mr-1"/> Voltar ao Dashboard
        </Link>

        <h1 className="text-2xl font-bold text-gray-800 mb-6">Editar Perfil</h1>

        <form onSubmit={handleUpdate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nome</label>
            <div className="relative mt-1">
              <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input 
                className="pl-10 w-full p-2 border rounded"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <div className="relative mt-1">
              <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input 
                className="pl-10 w-full p-2 border rounded"
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Telefone</label>
            <div className="relative mt-1">
              <Phone className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input 
                placeholder="Novo telefone"
                className="pl-10 w-full p-2 border rounded"
                value={formData.phone}
                onChange={e => setFormData({...formData, phone: e.target.value})}
              />
            </div>
          </div>

          <button className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 flex justify-center items-center gap-2">
            <Save size={18} /> Salvar Alterações
          </button>
        </form>

        <hr className="my-8"/>

        <div className="bg-red-50 p-4 rounded border border-red-100">
          <h3 className="text-red-800 font-bold text-sm mb-2">Zona de Perigo</h3>
          <p className="text-red-600 text-xs mb-4">Excluir sua conta apagará permanentemente seus dados e todos os seus pets.</p>
          <button 
            onClick={handleDeleteAccount}
            className="w-full bg-white border border-red-500 text-red-500 p-2 rounded hover:bg-red-50 flex justify-center items-center gap-2"
          >
            <Trash2 size={18} /> Excluir Minha Conta
          </button>
        </div>
      </div>
    </div>
  );
}