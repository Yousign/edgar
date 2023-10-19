import {
  json,
  type ActionFunctionArgs,
  type MetaFunction,
} from '@remix-run/node';
import { useActionData, useNavigation, useSearchParams } from '@remix-run/react';

import { UploadForm } from '~/components/UploadForm';
import { ChatBox } from '~/components/ChatBox';
import { upload } from '~/api/upload';
import * as React from 'react';

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
  const [searchParams, setSearchParams] = useSearchParams();

  React.useEffect(() => {
    if (actionData?.docUUID) {
      setSearchParams({ docUUID: actionData.docUUID });
    }
  }, [actionData?.docUUID, setSearchParams]);

  const docUUID = searchParams.get('docUUID') || actionData?.docUUID;

  const isSubmitting = navigation.state === 'submitting';

  return (
    <div className="prose lg:prose-xl prose-slate container mx-auto p-10 bg-white shadow-md m-10 rounded-md">
      <header className="">
        <h1>Hey, my name is Edgar 👋</h1>
        {docUUID ? (
          <h2 className="text-gray-400">
            💬 Ask me something about your document
          </h2>
        ) : (
          <h2 className="text-gray-400">📬 Give me your document</h2>
        )}
      </header>

      {docUUID ? (
        <ChatBox docUUID={docUUID} />
        ) : (
        <UploadForm isSubmitting={isSubmitting} />
      )}
    </div>
  );
}
