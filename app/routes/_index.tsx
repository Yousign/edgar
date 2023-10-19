import {
  json,
  type ActionFunctionArgs,
  type MetaFunction,
} from '@remix-run/node';
import { useActionData, useNavigation } from '@remix-run/react';

import { UploadForm } from '~/components/UploadForm';
import { ChatBox } from '~/components/ChatBox';
import { upload } from '~/api/upload';

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const { _action, ...values } = Object.fromEntries(formData);

  switch (_action) {
    case 'upload':
      return upload(values);
    default:
      return json(
        {
          ok: false,
          document: null,
          error: 'Invalid action',
          docUUID: null,
        },
        { status: 400 }
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

  return (
    <div className="prose lg:prose-xl prose-slate container mx-auto p-10 bg-white shadow-md m-10 rounded-md">
      <header className="">
        <h1>Hey, my name is Edgar 👋</h1>
        {shouldShowUploadForm ? (
          <h2 className="text-gray-400">📬 Give me your document</h2>
        ) : (
          <h2 className="text-gray-400">
            💬 Ask me something about your document
          </h2>
        )}
      </header>

      {shouldShowUploadForm ? (
        <UploadForm isSubmitting={isSubmitting} />
      ) : (
        <ChatBox docUUID={actionData.docUUID} />
      )}
    </div>
  );
}
