import React, { useState, useEffect } from 'react';
import type { Book } from '../types';
import { generateImage } from '../services/geminiService';
import { ChevronRightIcon, SparklesIcon, ChevronLeftIcon } from './IconComponents';

declare const html2canvas: any;

interface Step3Props {
  book: Book;
  onSubmit: (coverPrompt: string, coverImageUrl: string) => void;
  onBack: () => void;
}

const Step3Cover: React.FC<Step3Props> = ({ book, onSubmit, onBack }) => {
  const [prompt, setPrompt] = useState(book.coverPrompt);
  const [baseImageUrl, setBaseImageUrl] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const [coverOptions, setCoverOptions] = useState({
    textColor: '#FFFFFF',
    fontFamily: 'serif',
    textAlign: 'right' as CanvasTextAlign,
    titleFontSize: 32,
    authorFontSize: 20,
  });

  const handleOptionChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCoverOptions(prev => ({ ...prev, [name]: name.includes('FontSize') ? parseInt(value) : value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          const reader = new FileReader();
          reader.onload = (event) => {
              setBaseImageUrl(event.target?.result as string);
          };
          reader.readAsDataURL(e.target.files[0]);
      }
  };

  const handleGenerate = async () => {
    if (!prompt) return;
    setIsGenerating(true);
    try {
      const url = await generateImage(prompt);
      setBaseImageUrl(url);
    } catch (error: any) {
      console.error('Falha ao gerar a imagem da capa', error);
      let userMessage = 'Não foi possível gerar a imagem da capa. Por favor, tente novamente.';
      const errorString = JSON.stringify(error) || (error.message || '').toString();
       if (errorString.includes("429") || errorString.includes("RESOURCE_EXHAUSTED") || errorString.includes("rate limit")) {
        userMessage = `Você atingiu o limite de solicitações de imagens da API (rate limit). Isso pode acontecer com o uso frequente. Por favor, aguarde alguns minutos antes de tentar gerar uma nova imagem de capa.`;
      }
      alert(userMessage);
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    handleGenerate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async () => {
    const coverElement = document.getElementById('ebook-cover-preview');
    if (!coverElement) {
        alert("Erro: não foi possível encontrar o elemento de pré-visualização da capa.");
        return;
    }

    try {
        const canvas = await html2canvas(coverElement, { scale: 2 });
        const finalImageUrl = canvas.toDataURL('image/png');
        onSubmit(prompt, finalImageUrl);
    } catch (error) {
        console.error("Erro ao criar a imagem final da capa:", error);
        alert("Não foi possível finalizar a capa. Por favor, tente novamente.");
    }
  };

  const isStandardBook = book.bookType === 'standard';

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-500 mb-6">Design da Capa</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        <div className="space-y-4">
          <div>
            <label htmlFor="cover-prompt" className="block text-sm font-medium text-gray-300 mb-2">Prompt para a Arte da Capa</label>
            <textarea
              id="cover-prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={3}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-yellow-500 focus:outline-none"
              placeholder="Ex: Uma arte vetorial minimalista de um cérebro com circuitos brilhantes"
            />
          </div>
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-yellow-600 text-black rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? 'Gerando...' : <><SparklesIcon className="w-5 h-5" /> Gerar Nova Arte</>}
          </button>
          
          <div>
            <label htmlFor="image-upload" className="block text-sm font-medium text-gray-300 mb-2">Ou envie sua imagem</label>
            <input type="file" id="image-upload" accept="image/*" onChange={handleImageUpload} className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gray-800 file:text-yellow-400 hover:file:bg-gray-700" />
          </div>

          {isStandardBook && (
            <div className="space-y-4 p-4 border border-gray-700 rounded-lg mt-4">
                <h3 className="text-lg font-semibold text-yellow-400">Personalizar Capa</h3>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="textColor" className="block text-sm font-medium text-gray-300">Cor do Texto</label>
                        <input type="color" name="textColor" value={coverOptions.textColor} onChange={handleOptionChange} className="mt-1 w-full h-8 p-0 border-none rounded cursor-pointer bg-gray-800" />
                    </div>
                    <div>
                        <label htmlFor="fontFamily" className="block text-sm font-medium text-gray-300">Fonte</label>
                        <select name="fontFamily" value={coverOptions.fontFamily} onChange={handleOptionChange} className="mt-1 w-full bg-gray-800 border border-gray-600 rounded-md px-2 py-1 focus:ring-yellow-500">
                            <option value="serif">Serifada</option>
                            <option value="sans-serif">Sem-Serifa</option>
                            <option value="monospace">Monoespaçada</option>
                            <option value="cursive">Cursiva</option>
                        </select>
                    </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Alinhamento do Texto</label>
                  <div className="flex gap-2">
                      <button onClick={() => setCoverOptions(p => ({...p, textAlign: 'left'}))} className={`px-3 py-1 text-sm rounded-md ${coverOptions.textAlign === 'left' ? 'bg-yellow-500 text-black' : 'bg-gray-800 hover:bg-gray-700'}`}>Esquerda</button>
                      <button onClick={() => setCoverOptions(p => ({...p, textAlign: 'center'}))} className={`px-3 py-1 text-sm rounded-md ${coverOptions.textAlign === 'center' ? 'bg-yellow-500 text-black' : 'bg-gray-800 hover:bg-gray-700'}`}>Centro</button>
                      <button onClick={() => setCoverOptions(p => ({...p, textAlign: 'right'}))} className={`px-3 py-1 text-sm rounded-md ${coverOptions.textAlign === 'right' ? 'bg-yellow-500 text-black' : 'bg-gray-800 hover:bg-gray-700'}`}>Direita</button>
                  </div>
                </div>
                <div>
                    <label htmlFor="titleFontSize" className="block text-sm font-medium text-gray-300">Tamanho Título ({coverOptions.titleFontSize}px)</label>
                    <input type="range" name="titleFontSize" min="16" max="64" value={coverOptions.titleFontSize} onChange={handleOptionChange} className="mt-1 w-full" />
                </div>
                <div>
                    <label htmlFor="authorFontSize" className="block text-sm font-medium text-gray-300">Tamanho Autor ({coverOptions.authorFontSize}px)</label>
                    <input type="range" name="authorFontSize" min="12" max="32" value={coverOptions.authorFontSize} onChange={handleOptionChange} className="mt-1 w-full" />
                </div>
            </div>
          )}
        </div>
        
        <div className="flex flex-col items-center">
            <p className="text-sm font-medium text-gray-300 mb-2">Pré-visualização da Capa</p>
            <div id="ebook-cover-preview" className="w-[300px] h-[400px] bg-gray-800 rounded-lg shadow-lg overflow-hidden relative">
                {isGenerating && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-20">
                        <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                    </div>
                )}
                {baseImageUrl && <img src={baseImageUrl} alt="Arte da Capa" className="absolute inset-0 w-full h-full object-cover" />}
                
                {isStandardBook && (
                  <div className="absolute inset-0 flex flex-col p-6 text-white" style={{ textAlign: coverOptions.textAlign }}>
                      <div className="flex-grow"></div>
                      <div>
                          <h1 style={{ fontFamily: coverOptions.fontFamily, fontSize: `${coverOptions.titleFontSize}px`, color: coverOptions.textColor, textShadow: '2px 2px 4px rgba(0,0,0,0.8)', overflowWrap: 'break-word' }}>{book.title}</h1>
                          <p className="mt-2" style={{ fontFamily: coverOptions.fontFamily, fontSize: `${coverOptions.authorFontSize}px`, color: coverOptions.textColor, textShadow: '1px 1px 3px rgba(0,0,0,0.8)', overflowWrap: 'break-word' }}>{book.author}</p>
                      </div>
                  </div>
                )}
            </div>
        </div>
      </div>
      
      <div className="pt-4 flex justify-between items-center">
        <button 
            onClick={onBack} 
            className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-semibold transition-colors">
            <ChevronLeftIcon className="w-5 h-5" />
            Voltar
        </button>
        <button onClick={handleSubmit} disabled={!baseImageUrl || isGenerating} className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-yellow-500 to-amber-600 text-black rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed">
          Finalizar e ir para Download
          <ChevronRightIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default Step3Cover;