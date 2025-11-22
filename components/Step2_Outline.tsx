import React, { useState } from 'react';
import type { Book, Chapter } from '../types';
import { ChevronRightIcon, ChevronLeftIcon } from './IconComponents';

interface Step2Props {
  book: Book;
  onConfirm: (chapters: Chapter[]) => void;
  onBack: () => void;
}

const Step2Outline: React.FC<Step2Props> = ({ book, onConfirm, onBack }) => {
  const [editableChapters, setEditableChapters] = useState<Chapter[]>(book.chapters);
  const isColoringBook = book.bookType === 'coloring';

  const handleChapterChange = (index: number, field: 'title' | 'description', value: string) => {
    const updatedChapters = [...editableChapters];
    updatedChapters[index] = { ...updatedChapters[index], [field]: value };
    setEditableChapters(updatedChapters);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-500 mb-6">
        {isColoringBook ? "Páginas do seu Livro de Colorir" : "Estrutura do seu Livro"}
      </h2>
      <p className="text-center text-gray-400 -mt-4 mb-8">
        Revise e edite os títulos e descrições conforme necessário. Quando estiver satisfeito(a), clique em "{isColoringBook ? 'Criar Páginas' : 'Escrever o Livro'}".
      </p>
      
      <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
        {editableChapters.map((chapter, index) => (
          <div key={index} className="bg-gray-800/50 p-4 rounded-lg border border-gray-700 space-y-2">
            <div>
              <label htmlFor={`chapter-title-${index}`} className="text-sm font-semibold text-yellow-400">
                {isColoringBook ? `Página ${index + 1}: Título` : `Capítulo ${index + 1}: Título`}
              </label>
              <input
                id={`chapter-title-${index}`}
                type="text"
                value={chapter.title}
                onChange={(e) => handleChapterChange(index, 'title', e.target.value)}
                className="mt-1 w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-1.5 text-white focus:ring-2 focus:ring-yellow-500 focus:outline-none"
              />
            </div>
            <div>
               <label htmlFor={`chapter-desc-${index}`} className="text-sm font-semibold text-gray-300">
                Descrição
              </label>
              <textarea
                id={`chapter-desc-${index}`}
                value={chapter.description}
                onChange={(e) => handleChapterChange(index, 'description', e.target.value)}
                rows={2}
                className="mt-1 w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-1.5 text-gray-300 focus:ring-2 focus:ring-yellow-500 focus:outline-none resize-y"
              />
            </div>
          </div>
        ))}
      </div>

      <div className="pt-4 flex justify-between items-center">
        <button 
          onClick={onBack} 
          className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-semibold transition-colors">
          <ChevronLeftIcon className="w-5 h-5" />
          Voltar
        </button>
        <button onClick={() => onConfirm(editableChapters)} className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-yellow-500 to-amber-600 text-black rounded-lg font-semibold hover:opacity-90 transition-opacity">
          {isColoringBook ? 'Criar Páginas' : 'Escrever o Livro'}
          <ChevronRightIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default Step2Outline;