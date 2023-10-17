import type { Message as VercelChatMessage } from 'ai';
import { StreamingTextResponse as _StreamingTextResponse } from 'ai';

import { createClient } from '@supabase/supabase-js';

import { ChatOpenAI } from 'langchain/chat_models/openai';
import { PromptTemplate } from 'langchain/prompts';
import { SupabaseVectorStore } from 'langchain/vectorstores/supabase';
import type { Document } from 'langchain/document';
import { RunnableSequence } from 'langchain/schema/runnable';
import {
  BytesOutputParser,
  StringOutputParser,
} from 'langchain/schema/output_parser';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';

const combineDocumentsFn = (docs: Document[], separator = '\n\n') => {
  const serializedDocs = docs.map((doc) => doc.pageContent);
  return serializedDocs.join(separator);
};

const formatVercelMessages = (chatHistory: VercelChatMessage[]) => {
  const formattedDialogueTurns = chatHistory.map((message) => {
    if (message.role === 'user') {
      return `Human: ${message.content}`;
    } else if (message.role === 'assistant') {
      return `Assistant: ${message.content}`;
    } else {
      return `${message.role}: ${message.content}`;
    }
  });
  return formattedDialogueTurns.join('\n');
};

const CONDENSE_QUESTION_TEMPLATE = `Given the following conversation and a follow up question, rephrase the follow up question to be a standalone question, in its original language.

<chat_history>
  {chat_history}
</chat_history>

Follow Up Input: {question}
Standalone question:`;
const condenseQuestionPrompt = PromptTemplate.fromTemplate(
  CONDENSE_QUESTION_TEMPLATE
);

const ANSWER_TEMPLATE = `You are a cool and helpful assistant robot named Edgar, and must answer all questions like a teacher & surfer would.

Answer the question based only on the following context and chat history:
<context>
  {context}
</context>

<chat_history>
  {chat_history}
</chat_history>

Question: {question}
`;
const answerPrompt = PromptTemplate.fromTemplate(ANSWER_TEMPLATE);

// vercel/ai's StreamingTextResponse does not include request.headers.raw()
// which @vercel/remix uses when deployed on vercel.
// Therefore we use a custom one.
export class StreamingTextResponse extends _StreamingTextResponse {
  constructor(res: ReadableStream, init?: ResponseInit) {
    super(res, init);
    this.getRequestHeaders();
  }

  getRequestHeaders() {
    return addRawHeaders(this.headers);
  }
}

const addRawHeaders = function addRawHeaders(headers: Headers) {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  headers.raw = function () {
    const rawHeaders: { [k in string]: string[] } = {};
    const headerEntries = headers.entries();
    for (const [key, value] of headerEntries) {
      const headerKey = key.toLowerCase();
      // eslint-disable-next-line no-prototype-builtins
      if (rawHeaders.hasOwnProperty(headerKey)) {
        rawHeaders[headerKey].push(value);
      } else {
        rawHeaders[headerKey] = [value];
      }
    }
    return rawHeaders;
  };
  return headers;
};

/**
 * This handler initializes and calls a retrieval chain. It composes the chain using
 * LangChain Expression Language. See the docs for more information:
 *
 * https://js.langchain.com/docs/guides/expression_language/cookbook#conversational-retrieval-chain
 */
export async function chat(messages: VercelChatMessage[] = []) {
  try {
    const previousMessages = messages.slice(0, -1);
    const currentMessageContent =
      messages[messages.length - 1].content;

    const model = new ChatOpenAI({
      modelName: 'gpt-3.5-turbo',
      temperature: 0.2,
    });

    const client = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_PRIVATE_KEY!
    );
    const vectorstore = new SupabaseVectorStore(
      new OpenAIEmbeddings(),
      {
        client,
        tableName: 'documents',
        queryName: 'match_documents',
      }
    );

    /**
     * We use LangChain Expression Language to compose two chains.
     * To learn more, see the guide here:
     *
     * https://js.langchain.com/docs/guides/expression_language/cookbook
     */
    const standaloneQuestionChain = RunnableSequence.from([
      condenseQuestionPrompt,
      model,
      new StringOutputParser(),
    ]);

    let resolveWithDocuments: (value: Document[]) => void;
    // const documentPromise = new Promise<Document[]>((resolve) => {
    //   resolveWithDocuments = resolve;
    // });

    const retriever = vectorstore.asRetriever({
      callbacks: [
        {
          handleRetrieverEnd(documents) {
            resolveWithDocuments(documents);
          },
        },
      ],
    });

    const retrievalChain = retriever.pipe(combineDocumentsFn);

    const answerChain = RunnableSequence.from([
      {
        context: RunnableSequence.from([
          (input) => input.question,
          retrievalChain,
        ]),
        chat_history: (input) => input.chat_history,
        question: (input) => input.question,
      },
      answerPrompt,
      model,
    ]);

    const conversationalRetrievalQAChain = RunnableSequence.from([
      {
        question: standaloneQuestionChain,
        chat_history: (input) => input.chat_history,
      },
      answerChain,
      new BytesOutputParser(),
    ]);

    const stream = await conversationalRetrievalQAChain.stream({
      question: currentMessageContent,
      chat_history: formatVercelMessages(previousMessages),
    });

    //const documents = await documentPromise;
    // const serializedSources = Buffer.from(
    //   JSON.stringify(
    //     documents.map((doc) => {
    //       return {
    //         pageContent: doc.pageContent.slice(0, 50) + '...',
    //         metadata: doc.metadata,
    //       };
    //     })
    //   )
    // ).toString('base64');

    return new StreamingTextResponse(stream, {
      // headers: {
      //   'x-message-index': (previousMessages.length + 1).toString(),
      //   'x-sources': serializedSources,
      // },
    });
  } catch (e: any) {
    //return json({ error: e.message }, { status: 500 });
  }
}
