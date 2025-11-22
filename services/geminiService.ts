// FIX: Import GenerateImagesResponse to correctly type the response from generateImages API call.
import { GoogleGenAI, Type, GenerateImagesResponse } from "@google/genai";

const API_KEY = process.env.API_KEY;
if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}
const ai = new GoogleGenAI({ apiKey: API_KEY });

const callWithRetry = async <T>(apiCall: () => Promise<T>, maxRetries = 3, initialDelay = 5000): Promise<T> => {
  let retries = 0;
  let delay = initialDelay;

  while (true) {
    try {
      return await apiCall();
    } catch (error: any) {
      retries++;
      const errorString = JSON.stringify(error) || error.toString();
      
      if ((errorString.includes("429") || errorString.includes("RESOURCE_EXHAUSTED")) && retries < maxRetries) {
        console.warn(`Rate limit atingido. Tentando novamente em ${delay / 1000}s... (Tentativa ${retries}/${maxRetries-1})`);
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2; // Exponential backoff
      } else {
        console.error("Erro final da API ou máximo de tentativas atingido:", error);
        throw error;
      }
    }
  }
};

interface ChapterOutline {
    title: string;
    description: string;
}

export const generateOutline = async (topic: string, audience: string, tone: string, bookLength: string, bookType: 'standard' | 'coloring'): Promise<ChapterOutline[]> => {
  let prompt = '';

  if (bookType === 'coloring') {
      let pageCountPrompt = "Gere uma lista com exatamente 25 ideias de páginas."; // Padrão para Médio
      if (bookLength.startsWith('Curto')) {
          pageCountPrompt = "Gere uma lista com exatamente 10 ideias de páginas.";
      } else if (bookLength.startsWith('Longo')) {
          pageCountPrompt = "Gere uma lista com exatamente 50 ideias de páginas.";
      }
      prompt = `Você é um especialista em criar livros de colorir. Crie um sumário para um livro de colorir sobre o tema "${topic}", para um público de "${audience}".
      ${pageCountPrompt}
      Cada item da lista deve representar uma página para colorir, contendo um título e uma breve descrição do que a imagem deve conter.
      A resposta deve ser em português do Brasil.`;
  } else {
      let chapterCountPrompt = "Gere um sumário com exatamente 7 capítulos."; // Padrão para Médio
      if (bookLength.startsWith('Curto')) {
        chapterCountPrompt = "Gere um sumário com exatamente 4 capítulos.";
      } else if (bookLength.startsWith('Longo')) {
        chapterCountPrompt = "Gere um sumário com exatamente 12 capítulos.";
      }
      prompt = `Você é um escritor especialista. Crie um sumário detalhado para um ebook sobre o tópico "${topic}", para um público de "${audience}" com um tom "${tone}".
      ${chapterCountPrompt}
      Cada capítulo no sumário deve ter um título e uma breve descrição de uma frase.
      A resposta deve ser em português do Brasil.`;
  }
  
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
        responseMimeType: "application/json",
        responseSchema: {
            type: Type.OBJECT,
            properties: {
                chapters: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            title: {
                                type: Type.STRING,
                                description: 'O título do capítulo ou da página de colorir.'
                            },
                            description: {
                                type: Type.STRING,
                                description: 'Uma breve descrição de uma frase sobre o que o capítulo ou a página de colorir trata.'
                            }
                        },
                         required: ['title', 'description']
                    }
                }
            },
            required: ['chapters']
        }
    }
  });
  
  const jsonString = response.text.trim();
  try {
      const result = JSON.parse(jsonString);
      return result.chapters || [];
  } catch (e) {
      console.error("Falha ao analisar o JSON de generateOutline:", jsonString);
      throw new Error("Não foi possível analisar o sumário da resposta da IA.");
  }
};

export const generateChapterContent = async (bookTitle: string, topic: string, chapterTitle: string, audience: string, tone: string, bookLength: string): Promise<string> => {
    let lengthPrompt = "Escreva um capítulo de tamanho médio, com cerca de 800-900 palavras.";
    if (bookLength.startsWith('Curto')) {
        lengthPrompt = "Escreva um capítulo curto, com cerca de 600-700 palavras.";
    } else if (bookLength.startsWith('Longo')) {
        lengthPrompt = "Escreva um capítulo longo e detalhado, com cerca de 1000-1200 palavras.";
    }

    const prompt = `
        Título do Livro: "${bookTitle}"
        Tópico Geral do Livro: "${topic}"
        Título do Capítulo a ser Escrito: "${chapterTitle}"

        Instruções Específicas:
        - Público-Alvo: ${audience}
        - Tom: ${tone}
        - Tamanho: ${lengthPrompt}
        - O conteúdo deve ser envolvente, fluído e bem estruturado.
        - Não inclua o título do capítulo no início do corpo do texto, apenas o conteúdo em si.
        - Use parágrafos bem construídos e evite repetições.
        - Responda apenas com o texto do capítulo.
        - A resposta deve ser em português do Brasil.
    `;

    const response = await ai.models.generateContent({
        model: "gemini-3-pro-preview",
        contents: prompt,
        config: {
            systemInstruction: "Você é um escritor fantasma profissional e criativo. Sua escrita é humana, fluida e natural, evitando padrões robóticos. Você usa metáforas ricas, varia a estrutura das frases e adapta o vocabulário perfeitamente ao público-alvo. Seu objetivo é prender a atenção do leitor do início ao fim.",
        }
    });

    return response.text;
};

export const generateImage = async (prompt: string): Promise<string> => {
  try {
    // FIX: Explicitly provide the generic type to callWithRetry to ensure the response is correctly typed.
    const response = await callWithRetry<GenerateImagesResponse>(() => 
      ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: prompt,
        config: {
          numberOfImages: 1,
          outputMimeType: 'image/png',
        },
      })
    );
    
    const base64ImageBytes = response.generatedImages[0].image.imageBytes;
    return `data:image/png;base64,${base64ImageBytes}`;
  } catch (error) {
    console.error("Erro ao gerar imagem única:", error);
    throw error;
  }
};

export const generateMultipleImages = async (prompt: string, count: number): Promise<string[]> => {
  const images: string[] = [];
  const batchSize = 4;

  for (let i = 0; i < count; i += batchSize) {
    const currentBatchSize = Math.min(batchSize, count - i);
    try {
      // FIX: Explicitly provide the generic type to callWithRetry to ensure the response is correctly typed.
      const response = await callWithRetry<GenerateImagesResponse>(() =>
        ai.models.generateImages({
          model: 'imagen-4.0-generate-001',
          prompt: prompt,
          config: {
            numberOfImages: currentBatchSize,
            outputMimeType: 'image/png',
          },
        })
      );
      
      const batchImages = response.generatedImages.map(img => `data:image/png;base64,${img.image.imageBytes}`);
      images.push(...batchImages);

      if (count > batchSize && i + batchSize < count) {
          await new Promise(resolve => setTimeout(resolve, 1000));
      }

    } catch (error) {
      console.error("Erro ao gerar múltiplas imagens:", error);
      throw error;
    }
  }
  return images;
};