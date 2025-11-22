import React from 'react';
import type { Book } from '../types';
import { DownloadIcon, ChevronLeftIcon } from './IconComponents';

interface Step4Props {
  book: Book;
  onDownload: () => void;
  onBack: () => void;
}

const Step4Download: React.FC<Step4Props> = ({ book, onDownload, onBack }) => {
  return (
    <div className="space-y-6 text-center">
      <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-500 mb-4">Seu Livro está Pronto!</h2>
      <p className="text-gray-400 max-w-xl mx-auto">Parabéns! Seu livro, "{book.title}", foi totalmente escrito e ilustrado por IA. Agora você pode baixá-lo como um PDF.</p>
      
      <div className="flex justify-center py-8">
        <div className="w-[300px] h-[400px] bg-gray-800 rounded-lg shadow-2xl shadow-yellow-500/20 overflow-hidden transform hover:scale-105 transition-transform duration-300">
            {book.coverImageUrl ? (
              <img src={book.coverImageUrl} alt="Capa do Ebook" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-500">
                Sem prévia da capa
              </div>
            )}
        </div>
      </div>
      
      <div>
        <h3 className="text-xl font-bold mb-4">Resumo do Livro</h3>
        <div className="text-left max-w-lg mx-auto bg-gray-900 p-4 rounded-lg border border-gray-700">
            <p><strong className="text-yellow-400">Título:</strong> {book.title}</p>
            <p><strong className="text-yellow-400">Autor:</strong> {book.author}</p>
            <p><strong className="text-yellow-400">{book.bookType === 'coloring' ? 'Páginas' : 'Capítulos'}:</strong> {book.chapters.length}</p>
        </div>
      </div>

      <div className="pt-4 flex justify-center items-center gap-4">
        <button 
          onClick={onBack} 
          className="flex items-center justify-center gap-2 px-8 py-4 text-lg bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-semibold transition-colors">
          <ChevronLeftIcon className="w-6 h-6" />
          Voltar
        </button>
        <button onClick={onDownload} className="flex items-center justify-center gap-3 px-8 py-4 text-lg bg-gradient-to-r from-yellow-500 to-amber-600 text-black rounded-lg font-semibold hover:opacity-90 transition-opacity">
          <DownloadIcon className="w-6 h-6" />
          Baixar PDF
        </button>
      </div>
    </div>
  );
};

export default Step4Download;