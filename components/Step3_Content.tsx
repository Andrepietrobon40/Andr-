import React, { useState } from 'react';
import type { Book } from '../types';
import { generateMultipleImages } from '../services/geminiService';
import { ChevronRightIcon, SparklesIcon, ChevronLeftIcon, UploadIcon } from './IconComponents';

interface Step3ContentProps {
  book: Book;
  setBook: React.Dispatch<React.SetStateAction<Book>>;
  onSubmit: () => void;
  onBack: () => void;
}

const Step3Content: React.FC<Step3ContentProps> = ({ book, setBook, onSubmit, onBack }) => {
  const [imageOptions, setImageOptions] = useState<{ [key: number]: string[] }>({});
  const [generatingChapterIndex, setGeneratingChapterIndex] = useState<number | null>(null);
  const [numImagesToGenerate, setNumImagesToGenerate] = useState(4);
  const isColoringBook = book.bookType === 'coloring';
  const isStandardBook = book.bookType === 'standard';

  const handleGenerateImages = async (chapterIndex: number) => {
    setGeneratingChapterIndex(chapterIndex);
    const chapter = book.chapters[chapterIndex];
    
    let prompt = '';
    if (isColoringBook) {
      prompt = `Página de livro de colorir profissional. Tema: "${chapter.title}" - ${chapter.description}. Estilo: arte de linha vetorial preta, fundo branco puro, linhas grossas e consistentes, sem áreas preenchidas de cinza, design atraente para ${book.audience}, alta resolução. Sem texto na imagem.`;
    } else {
      const toneDescriptor = book.tone === 'Humorístico' ? 'estilo cartoon 3D divertido, cores vivas' : 
                             book.tone === 'Inspirador' ? 'estilo pintura digital suave, luz dourada, inspirador' :
                             'estilo ilustração editorial premium, altamente detalhado, cores cinematográficas';

      prompt = `Ilustração profissional para livro. Título do Livro: "${book.title}". Capítulo: "${chapter.title}". Cena para ilustrar: "${chapter.description}". Estilo: ${toneDescriptor}. Qualidade 8k, composição artística, iluminação dramática, masterpiece. Sem texto na imagem.`;
    }

    try {
      const images = await generateMultipleImages(prompt, numImagesToGenerate);
      setImageOptions(prev => ({ ...prev, [chapterIndex]: images }));
    } catch (error: any) {
      console.error('Falha ao gerar imagens:', error);
      let userMessage = `Não foi possível gerar imagens para "${chapter.title}". Por favor, verifique sua conexão e tente novamente.`;
      const errorString = JSON.stringify(error) || (error.message || '').toString();
      if (errorString.includes("429") || errorString.includes("RESOURCE_EXHAUSTED") || errorString.includes("rate limit")) {
        userMessage = `Você atingiu o limite de solicitações de imagens da API (rate limit). Isso pode acontecer com o uso frequente. Por favor, aguarde alguns minutos antes de tentar gerar novas imagens.`;
      }
      alert(userMessage);
    } finally {
      setGeneratingChapterIndex(null);
    }
  };

  const handleSelectImage = (chapterIndex: number, imageUrl: string) => {
    const newChapters = [...book.chapters];
    const chapter = newChapters[chapterIndex];
    const currentImageUrls = chapter.imageUrls || [];
    
    if (isColoringBook) {
      const imageIndex = currentImageUrls.indexOf(imageUrl);
      if (imageIndex > -1) {
        currentImageUrls.splice(imageIndex, 1);
      } else {
        currentImageUrls.push(imageUrl);
      }
      chapter.imageUrls = currentImageUrls;
    } else {
      if (currentImageUrls.length > 0 && currentImageUrls[0] === imageUrl) {
        chapter.imageUrls = [];
      } else {
        chapter.imageUrls = [imageUrl];
      }
    }

    setBook(prev => ({ ...prev, chapters: newChapters }));
  };
  
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, chapterIndex: number) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const imageUrl = event.target.result as string;
          const newChapters = [...book.chapters];
          const chapter = newChapters[chapterIndex];
    
          if (isColoringBook) {
            const currentImageUrls = chapter.imageUrls || [];
            currentImageUrls.push(imageUrl);
            chapter.imageUrls = currentImageUrls;
          } else {
            chapter.imageUrls = [imageUrl];
          }
          setBook(prev => ({ ...prev, chapters: newChapters }));
        }
      };
      reader.readAsDataURL(e.target.files[0]);
      e.target.value = ''; // Permite o re-upload do mesmo arquivo
    }
  };

  const isAnyGenerationInProgress = generatingChapterIndex !== null;

  return (
    <div className="space-y-6">
       <h2 className="text-2xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-500 mb-6">
        Conteúdo e Ilustrações
      </h2>
      <p className="text-center text-gray-400 -mt-4 mb-8">
        {isColoringBook
          ? "Gere ou envie a página de colorir para cada ideia."
          : "Revise o conteúdo e adicione ilustrações para cada capítulo."
        }
      </p>

      <div className="space-y-8 max-h-[50vh] overflow-y-auto pr-4">
        {book.chapters.map((chapter, index) => (
          <div key={index} className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
            <h3 className="text-xl font-bold text-yellow-400 mb-3">{isColoringBook ? `Página ${index + 1}` : `Capítulo ${index + 1}`}: {chapter.title}</h3>
            
            {isStandardBook && (
              <div className="mb-4">
                <h4 className="font-semibold text-gray-300 mb-2">Conteúdo Gerado:</h4>
                <p className="text-gray-400 text-sm bg-gray-900 p-3 rounded-md max-h-40 overflow-y-auto">{chapter.content}</p>
              </div>
            )}
            
            <div>
                <h4 className="font-semibold text-gray-300 mb-2">{isColoringBook ? 'Páginas de Colorir Selecionadas' : 'Ilustração do Capítulo'}</h4>
                {chapter.imageUrls && chapter.imageUrls.length > 0 ? (
                    <div className="mb-2">
                        <p className="text-sm text-green-400 mb-2">✓ {chapter.imageUrls.length} imagem(ns) selecionada(s)</p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                            {chapter.imageUrls.map((url, i) => (
                                <img key={i} src={url} alt={`Ilustração para ${chapter.title} ${i+1}`} className="rounded-lg w-full aspect-[3/4] object-cover" />
                            ))}
                        </div>
                    </div>
                ) : (
                    <p className="text-sm text-gray-500 mb-2">Nenhuma ilustração selecionada ainda.</p>
                )}
            </div>

            <div className="mt-4">
                <div className="flex flex-wrap items-center gap-4">
                    <button onClick={() => handleGenerateImages(index)} disabled={isAnyGenerationInProgress} className="flex items-center justify-center gap-2 px-4 py-2 text-sm bg-yellow-600 text-black rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed">
                        {generatingChapterIndex === index ? 'Gerando...' : <><SparklesIcon className="w-4 h-4" /> {imageOptions[index] ? 'Gerar Novas Opções' : 'Gerar Ilustrações'}</>}
                    </button>
                    
                    <label htmlFor={`upload-image-${index}`} className={`flex items-center justify-center gap-2 px-4 py-2 text-sm border-2 border-yellow-600 text-yellow-500 rounded-lg font-semibold transition-colors ${isAnyGenerationInProgress ? 'opacity-50 cursor-not-allowed' : 'hover:bg-yellow-600 hover:text-black cursor-pointer'}`}>
                      <UploadIcon className="w-4 h-4" />
                      Enviar Imagem
                    </label>
                    <input type="file" id={`upload-image-${index}`} accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, index)} disabled={isAnyGenerationInProgress} />

                    <div className="flex items-center gap-2">
                        <label htmlFor={`num-images-${index}`} className="text-sm text-gray-300 whitespace-nowrap">Nº de Opções:</label>
                        <select 
                            id={`num-images-${index}`} 
                            value={numImagesToGenerate} 
                            onChange={(e) => setNumImagesToGenerate(parseInt(e.target.value))} 
                            disabled={isAnyGenerationInProgress}
                            className="bg-gray-700 border border-gray-600 rounded-md px-2 py-1 text-sm focus:ring-2 focus:ring-yellow-500 focus:outline-none"
                        >
                            {[...Array(8).keys()].map(i => <option key={i+1} value={i+1}>{i+1}</option>)}
                        </select>
                    </div>
              </div>

              {generatingChapterIndex === index && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 animate-pulse">
                      {Array.from({ length: numImagesToGenerate }).map((_, i) => (
                          <div key={i} className="aspect-[3/4] bg-gray-700 rounded-lg"></div>
                      ))}
                  </div>
              )}

              {imageOptions[index] && generatingChapterIndex !== index && (
                <div className="mt-4">
                  <p className="text-sm text-gray-300 mb-2">Clique em uma imagem para selecioná-la{isColoringBook && ' (pode selecionar várias)'}:</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {imageOptions[index]?.map((imgUrl, imgIndex) => (
                      <img
                        key={imgIndex}
                        src={imgUrl}
                        alt={`Opção ${imgIndex + 1}`}
                        onClick={() => handleSelectImage(index, imgUrl)}
                        className={`rounded-lg cursor-pointer transition-all duration-200 aspect-[3/4] object-cover hover:opacity-100 hover:ring-4 hover:ring-yellow-500 ${(chapter.imageUrls || []).includes(imgUrl) ? 'ring-4 ring-green-500 opacity-100' : 'opacity-70'}`}
                      />
                    ))}
                  </div>
                </div>
              )}
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
        <button onClick={onSubmit} className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-yellow-500 to-amber-600 text-black rounded-lg font-semibold hover:opacity-90 transition-opacity">
          Próximo: Design da Capa
          <ChevronRightIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default Step3Content;