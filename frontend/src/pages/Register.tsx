import { useState } from "react";
import { api } from "../services/api";
import { useNavigate, Link } from "react-router-dom";
import { User, Mail, Phone, Lock } from "lucide-react";

export function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: ""
  });
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/tutors', formData);
      alert("Cadastro realizado! Faça login.");
      navigate("/"); 
    } catch (error: any) {
      console.error(error);
      const msg = error.response?.data?.message || "Erro desconhecido";
      alert(`Erro ao cadastrar: ${msg}`);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">Crie sua Conta</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input 
              placeholder="Nome Completo" 
              className="pl-10 w-full p-2 border rounded"
              onChange={e => setFormData({...formData, name: e.target.value})}
            />
          </div>
          <div className="relative">
            <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input 
              placeholder="Email" 
              className="pl-10 w-full p-2 border rounded"
              onChange={e => setFormData({...formData, email: e.target.value})}
            />
          </div>
          <div className="relative">
            <Phone className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input 
              placeholder="Telefone" 
              className="pl-10 w-full p-2 border rounded"
              onChange={e => setFormData({...formData, phone: e.target.value})}
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input 
              type="password" 
              placeholder="Senha" 
              className="pl-10 w-full p-2 border rounded"
              onChange={e => setFormData({...formData, password: e.target.value})}
            />
          </div>
          <button type="submit" className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700">
            Cadastrar
          </button>
        </form>
        <p className="mt-4 text-center text-sm">
           Já tem conta? <Link to="/" className="text-blue-600 hover:underline">Entrar</Link>
        </p>
      </div>
    </div>
  );
}