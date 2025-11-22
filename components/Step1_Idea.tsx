import React, { useState } from 'react';
import type { Book } from '../types';
import { MagicWandIcon } from './IconComponents';

interface Step1Props {
  initialData: Pick<Book, 'title' | 'author' | 'topic' | 'audience' | 'tone' | 'bookLength' | 'bookType' | 'fontFamily' | 'fontSize'>;
  onSubmit: (data: Pick<Book, 'title' | 'author' | 'topic' | 'audience' | 'tone' | 'bookLength' | 'bookType' | 'fontFamily' | 'fontSize'>) => void;
}

const Step1Idea: React.FC<Step1Props> = ({ initialData, onSubmit }) => {
  const [data, setData] = useState(initialData);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setData(prev => ({ ...prev, [name]: name === 'fontSize' ? parseInt(value, 10) : value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (data.title && data.topic && data.author) {
      onSubmit(data);
    } else {
      alert('Por favor, preencha Título, Autor e Tópico.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-2xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-500 mb-6">Comece com sua Ideia</h2>
      
       <div>
          <label htmlFor="bookType" className="block text-sm font-medium text-gray-300 mb-2">Tipo de Livro</label>
          <select name="bookType" id="bookType" value={data.bookType} onChange={handleChange} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-yellow-500 focus:outline-none">
            <option value="standard">Ebook Padrão</option>
            <option value="coloring">Livro de Colorir</option>
          </select>
        </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-2">Título do Livro</label>
          <input type="text" name="title" id="title" value={data.title} onChange={handleChange} required className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-yellow-500 focus:outline-none" placeholder="Ex: O Futuro da Inteligência Artificial" />
        </div>
        <div>
          <label htmlFor="author" className="block text-sm font-medium text-gray-300 mb-2">Nome do Autor(a)</label>
          <input type="text" name="author" id="author" value={data.author} onChange={handleChange} required className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-yellow-500 focus:outline-none" placeholder="Ex: Dra. Evelyn Reed" />
        </div>
      </div>
      
      <div>
        <label htmlFor="topic" className="block text-sm font-medium text-gray-300 mb-2">Qual é o tópico principal?</label>
        <input type="text" name="topic" id="topic" value={data.topic} onChange={handleChange} required className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-yellow-500 focus:outline-none" placeholder="Um guia completo sobre aprendizado de máquina..." />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label htmlFor="audience" className="block text-sm font-medium text-gray-300 mb-2">Público-Alvo</label>
          <select name="audience" id="audience" value={data.audience} onChange={handleChange} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-yellow-500 focus:outline-none">
            <option>Iniciantes</option>
            <option>Especialistas</option>
            <option>Crianças</option>
            <option>Adultos</option>
            <option>Estudantes</option>
          </select>
        </div>
        <div>
          <label htmlFor="tone" className="block text-sm font-medium text-gray-300 mb-2">Tom Desejado</label>
          <select name="tone" id="tone" value={data.tone} onChange={handleChange} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-yellow-500 focus:outline-none">
            <option>Informativo</option>
            <option>Casual</option>
            <option>Formal</option>
            <option>Humorístico</option>
            <option>Inspirador</option>
          </select>
        </div>
        <div>
          <label htmlFor="bookLength" className="block text-sm font-medium text-gray-300 mb-2">Tamanho do Livro</label>
          <select name="bookLength" id="bookLength" value={data.bookLength} onChange={handleChange} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-yellow-500 focus:outline-none">
            <option>Curto (aprox. 10 páginas)</option>
            <option>Médio (aprox. 25 páginas)</option>
            <option>Longo (aprox. 50 páginas)</option>
          </select>
        </div>
      </div>

       <div className="pt-6 border-t border-gray-800/50">
          <h3 className="text-lg font-semibold text-center text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-500 mb-4">Opções de Formatação (Ebook Padrão)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                  <label htmlFor="fontFamily" className="block text-sm font-medium text-gray-300 mb-2">Fonte do Texto</label>
                  <select
                      id="fontFamily"
                      name="fontFamily"
                      value={data.fontFamily || 'Serif'}
                      onChange={handleChange}
                      className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-yellow-500 focus:outline-none"
                  >
                      <option value="Serif">Serif (ex: Times New Roman)</option>
                      <option value="Sans-Serif">Sans-Serif (ex: Helvetica)</option>
                      <option value="Monospace">Monospace (ex: Courier)</option>
                  </select>
              </div>
              <div>
                  <label htmlFor="fontSize" className="block text-sm font-medium text-gray-300 mb-2">Tamanho da Fonte (Corpo)</label>
                   <select
                      id="fontSize"
                      name="fontSize"
                      value={data.fontSize || 11}
                      onChange={handleChange}
                      className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-yellow-500 focus:outline-none"
                  >
                      <option value={9}>Pequeno (9 pt)</option>
                      <option value={10}>Médio-Pequeno (10 pt)</option>
                      <option value={11}>Padrão (11 pt)</option>
                      <option value={12}>Médio-Grande (12 pt)</option>
                      <option value={14}>Grande (14 pt)</option>
                  </select>
              </div>
          </div>
        </div>

      <div className="pt-4 flex justify-end">
        <button type="submit" className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-yellow-500 to-amber-600 text-black rounded-lg font-semibold hover:opacity-90 transition-opacity">
          <MagicWandIcon className="w-5 h-5" />
          Criar Sumário
        </button>
      </div>
    </form>
  );
};

export default Step1Idea;