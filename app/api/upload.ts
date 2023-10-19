import { json } from '@remix-run/node';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { PDFLoader } from 'langchain/document_loaders/fs/pdf';

import { createClient } from '@supabase/supabase-js';
import { SupabaseVectorStore } from 'langchain/vectorstores/supabase';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';

export async function upload(values: Record<string, any>) {
  const docUUID = crypto.randomUUID();
  const loader = new PDFLoader(values['file-upload'], {
    splitPages: true,
  });

  const docs = await loader.load();

  try {
    const client = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_PRIVATE_KEY!
    );

    const splitter = RecursiveCharacterTextSplitter.fromLanguage(
      'js',
      {
        chunkSize: 256,
        chunkOverlap: 20,
      }
    );

    const splitDocuments = await splitter.splitDocuments(docs);
    splitDocuments.forEach((doc) => {
      doc.metadata.docUUID = docUUID;
    });

    await SupabaseVectorStore.fromDocuments(
      splitDocuments,
      new OpenAIEmbeddings(),
      {
        client,
        tableName: 'documents',
        queryName: 'match_documents',
      }
    );

    return json(
      {
        ok: true,
        document: loader.filePathOrBlob,
        docUUID,
        error: null,
      },
      { status: 200 }
    );
  } catch (e: any) {
    return json(
      {
        ok: false,
        document: null,
        docUUID: null,
        error: e.message,
      },
      { status: 500 }
    );
  }
}
