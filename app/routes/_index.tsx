import {
  json,
  type ActionFunctionArgs,
  type MetaFunction,
} from '@remix-run/node';
import {
  useActionData,
  useNavigation,
  useSearchParams,
} from '@remix-run/react';

import { UploadForm } from '~/components/UploadForm';
import { ChatBox } from '~/components/ChatBox';
import { upload } from '~/api/upload';
import * as React from 'react';
import { Sidebar } from '~/components/Sidebar';
import { Viewer } from '~/components/Viewer';

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
  const [file, setFile] = React.useState<File | null>(null);

  React.useEffect(() => {
    if (actionData?.docUUID) {
      setSearchParams({ docUUID: actionData.docUUID });
    }
  }, [actionData?.docUUID, setSearchParams]);

  const docUUID = searchParams.get('docUUID') || actionData?.docUUID;

  const isSubmitting = navigation.state === 'submitting';

  return (
    <div className="grid grid-cols-layout bg-pampas">
      <Sidebar />
      <div className="px-4 py-10">
        {!docUUID ? (
          <UploadForm
            isSubmitting={isSubmitting}
            onFileChange={setFile}
          />
        ) : (
          <Viewer file={file} />
        )}
      </div>
      <div className="px-4 py-10 w-[500px] overflow-y-auto max-h-screen">
        {docUUID ? (
          <ChatBox docUUID={docUUID} />
        ) : (
          <div className=" w-[50px] h-[50px] rounded-full bd-white shadow-md overflow-hidden p-1">
            <img src="/edgar.png" alt="" />
          </div>
        )}
      </div>
    </div>
  );
}
