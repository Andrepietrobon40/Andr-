import React, { useState, useEffect } from 'react';
import { Book, Chapter } from './types';
import { generateOutline, generateChapterContent } from './services/geminiService';
import { generatePdf } from './services/pdfService';
import Step1Idea from './components/Step1_Idea';
import Step2Outline from './components/Step2_Outline';
import Step3Content from './components/Step3_Content';
import Step3Cover from './components/Step3_Cover';
import Step4Download from './components/Step4_Download';
import StepIndicator from './components/StepIndicator';
import Loader from './components/Loader';

const defaultBookState: Book = {
  title: '',
  author: '',
  topic: '',
  audience: 'Adultos',
  tone: 'Informativo',
  bookLength: 'Médio (aprox. 25 páginas)',
  chapters: [],
  coverImageUrl: '',
  coverPrompt: '',
  bookType: 'standard',
  fontFamily: 'Serif',
  fontSize: 11,
};

const STORAGE_KEY = 'cria-livro-progress';

const App: React.FC = () => {
  // Inicializa o estado verificando o LocalStorage primeiro
  const [step, setStep] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved).step : 1;
    } catch (e) {
      return 1;
    }
  });

  const [book, setBook] = useState<Book>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved).book : defaultBookState;
    } catch (e) {
      return defaultBookState;
    }
  });

  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');

  // Efeito para salvar automaticamente no LocalStorage sempre que step ou book mudarem
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ step, book }));
  }, [step, book]);

  const handleResetProject = () => {
    if (window.confirm('Tem certeza que deseja iniciar um novo projeto? Todo o progresso atual não salvo em PDF será perdido.')) {
      localStorage.removeItem(STORAGE_KEY);
      setBook(defaultBookState);
      setStep(1);
    }
  };

  const handleIdeaSubmit = async (idea: Pick<Book, 'title' | 'author' | 'topic' | 'audience' | 'tone' | 'bookLength' | 'bookType' | 'fontFamily' | 'fontSize'>) => {
    setBook(prev => ({ ...prev, ...idea }));
    setIsLoading(true);
    setLoadingMessage('Gerando as ideias...');
    try {
      const outline = await generateOutline(idea.topic, idea.audience, idea.tone, idea.bookLength, idea.bookType);
      
      let coverPrompt = '';
      if (idea.bookType === 'coloring') {
          coverPrompt = `Uma capa de livro de colorir profissional e convidativa. Título: "${idea.title}". Tema: ${idea.topic}. Estilo: arte de linha preta grossa sobre fundo branco, design vetorial limpo, sem sombreamento. A imagem central deve ser fofa e atraente para ${idea.audience}. Não inclua nenhum texto na imagem.`;
      } else {
          const styleDescriptor = idea.tone === 'Humorístico' ? 'estilo cartoon vibrante e expressivo' : 
                                idea.tone === 'Inspirador' ? 'estilo etéreo, com iluminação suave e esperançosa' :
                                'estilo minimalista, moderno e sofisticado';
                                
          coverPrompt = `Uma capa de ebook profissional e premiada. Título do livro: "${idea.title}". Tópico: ${idea.topic}. Estilo Visual: ${styleDescriptor}. Qualidade fotográfica ou ilustração 3D premium, composição cinematográfica, iluminação dramática, 8k resolution. Não inclua nenhum texto na imagem.`;
      }

      setBook(prev => ({
        ...prev,
        ...idea,
        chapters: outline.map(ch => ({ ...ch, content: '', imageUrls: [] })),
        coverPrompt: coverPrompt
      }));
      setStep(2);
    } catch (error) {
      console.error('Erro ao gerar o sumário:', error);
      alert('Falha ao gerar o sumário. Por favor, tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOutlineConfirm = async (chapters: Chapter[]) => {
    setIsLoading(true);
    setLoadingMessage('Escrevendo os capítulos do seu livro...');
    
    setBook(prev => ({ ...prev, chapters }));
    
    try {
      const updatedChapters: Chapter[] = [];
      for (let i = 0; i < chapters.length; i++) {
        const chapter = chapters[i];
        let content = '';

        // Só gera texto se ainda não tiver sido gerado (para evitar regeração ao recarregar página no meio do processo, embora a lógica aqui seja sequencial)
        // Mas principalmente verifica se é standard book
        if (book.bookType === 'standard' && !chapter.content) {
            setLoadingMessage(`Escrevendo o Capítulo ${i + 1}: ${chapter.title}`);
            content = await generateChapterContent(book.title, book.topic, chapter.title, book.audience, book.tone, book.bookLength);
        } else {
            content = chapter.content; // Mantém conteúdo existente se houver
        }
        
        updatedChapters.push({ ...chapter, content, imageUrls: chapter.imageUrls || [] });
      }

      setBook(prev => ({ ...prev, chapters: updatedChapters }));
      setStep(3); // Go to the new Content step
    } catch (error) {
      console.error('Erro ao gerar o conteúdo do texto:', error);
      alert('Falha ao gerar o conteúdo do texto. Por favor, tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleContentSubmit = () => {
    setStep(4);
  };
  
  const handleCoverSubmit = (coverPrompt: string, coverImageUrl: string) => {
    setBook(prev => ({ ...prev, coverPrompt, coverImageUrl }));
    setStep(5);
  };

  const handleGoBackToIdea = () => {
    setStep(1);
  };

  const handleGoBackToOutline = () => {
    setStep(2);
  };

  const handleGoBackToContent = () => {
    setStep(3);
  };

  const handleGoBackToCover = () => {
    setStep(4);
  };


  const handleDownload = async () => {
    setIsLoading(true);
    setLoadingMessage('Preparando seu PDF...');
    try {
      await generatePdf(book);
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      alert('Falha ao gerar o PDF. Por favor, tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return <Step1Idea initialData={book} onSubmit={handleIdeaSubmit} />;
      case 2:
        return <Step2Outline book={book} onConfirm={handleOutlineConfirm} onBack={handleGoBackToIdea} />;
      case 3:
        return <Step3Content book={book} setBook={setBook} onSubmit={handleContentSubmit} onBack={handleGoBackToOutline} />;
      case 4:
        return <Step3Cover book={book} onSubmit={handleCoverSubmit} onBack={handleGoBackToContent} />;
      case 5:
        return <Step4Download book={book} onDownload={handleDownload} onBack={handleGoBackToCover} />;
      default:
        return <Step1Idea initialData={book} onSubmit={handleIdeaSubmit} />;
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-4 sm:p-8 font-sans">
      <div className="max-w-4xl mx-auto">
        <header className="flex flex-col sm:flex-row items-center justify-between mb-10 gap-4">
          <div className="text-center sm:text-left">
            <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-500">
              Cria Livro
            </h1>
            <p className="text-gray-400 mt-2">Sua ideia, um livro completo. Rápido e fácil.</p>
          </div>
          
          {(step > 1 || book.title) && (
            <button 
              onClick={handleResetProject}
              className="px-4 py-2 text-sm text-red-400 border border-red-900/50 bg-red-900/10 rounded-lg hover:bg-red-900/30 hover:text-red-300 transition-colors"
            >
              Novo Projeto
            </button>
          )}
        </header>
        
        <main>
          {isLoading ? (
            <Loader message={loadingMessage} />
          ) : (
            <>
              <StepIndicator currentStep={step} />
              <div className="mt-8 bg-gray-900/50 rounded-2xl p-6 sm:p-8 border border-yellow-800/50 shadow-2xl shadow-yellow-500/10">
                {renderStep()}
              </div>
            </>
          )}
        </main>
        <footer className="text-center mt-12 text-gray-500 text-sm">
          <p>Desenvolvido com Google Gemini. Seu progresso é salvo automaticamente.</p>
        </footer>
      </div>
    </div>
  );
};

export default App;