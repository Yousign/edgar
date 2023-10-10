import {
  json,
  type ActionFunctionArgs,
  type MetaFunction,
} from '@remix-run/node';

import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { PDFLoader } from 'langchain/document_loaders/fs/pdf';

import { createClient } from '@supabase/supabase-js';
import { SupabaseVectorStore } from 'langchain/vectorstores/supabase';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';

import { UploadForm } from '~/components/UploadForm';
import { useActionData, useNavigation } from '@remix-run/react';

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const entries = Object.fromEntries(formData);

  const loader = new PDFLoader(entries['file-upload'], {
    splitPages: false,
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
        error: null,
      },
      { status: 200 }
    );
  } catch (e: any) {
    return json(
      {
        ok: false,
        document: null,
        error: e.message,
      },
      { status: 500 }
    );
  }
}

export const meta: MetaFunction = () => {
  return [
    { title: 'Edgar' },
    { name: 'description', content: 'Welcome!' },
  ];
};

export default function Index() {
  const navigation = useNavigation();
  const actionData = useActionData<typeof action>();

  const shouldShowUploadForm = !actionData?.ok;
  const isSubmitting = navigation.state === 'submitting';

  console.log(navigation);

  return (
    <div className="prose lg:prose-xl prose-slate container mx-auto p-10 bg-white shadow-md m-10 rounded-md">
      <header className="">
        <h1>Hey, my name is Edgar 👋</h1>
        {shouldShowUploadForm ? (
          <h2 className="text-gray-400">📬 Give me your document</h2>
        ) : (
          <h2 className="text-gray-400">
            💬 Ask me about your document
          </h2>
        )}
      </header>

      {shouldShowUploadForm ? (
        <UploadForm isSubmitting={isSubmitting} />
      ) : (
        <div className="rounded-md bg-slate-900 text-white p-10 my-10">
          here the prompt TBD...
        </div>
      )}
    </div>
  );
}
