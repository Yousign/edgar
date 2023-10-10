import {
  json,
  type ActionFunctionArgs,
  type MetaFunction,
} from '@remix-run/node';

import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';

import { createClient } from '@supabase/supabase-js';
import { SupabaseVectorStore } from 'langchain/vectorstores/supabase';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';

import { UploadForm } from '~/components/UploadForm';

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const { text } = Object.fromEntries(formData);

  try {
    const client = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_PRIVATE_KEY!
    );

    const splitter = RecursiveCharacterTextSplitter.fromLanguage(
      'markdown',
      {
        chunkSize: 256,
        chunkOverlap: 20,
      }
    );

    const splitDocuments = await splitter.createDocuments([
      text as string,
    ]);

    await SupabaseVectorStore.fromDocuments(
      splitDocuments,
      new OpenAIEmbeddings(),
      {
        client,
        tableName: 'documents',
        queryName: 'match_documents',
      }
    );

    return json({ ok: true }, { status: 200 });
  } catch (e: any) {
    return json({ error: e.message }, { status: 500 });
  }
}

export const meta: MetaFunction = () => {
  return [
    { title: 'Edgar' },
    { name: 'description', content: 'Welcome!' },
  ];
};

export default function Index() {
  return (
    <div className="prose lg:prose-xl container mx-auto p-10 bg-white shadow-md m-10 rounded-md">
      <h1>Hey, my name is Edgar 👋</h1>
      <h2>Give me your document</h2>

      <UploadForm />
    </div>
  );
}
