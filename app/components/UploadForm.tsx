import * as React from 'react';
import { Form } from '@remix-run/react';
import { Loader } from 'react-feather';
import { clearDatabase, storeFile } from '~/data/file-storage.client';

const UploadForm: React.FunctionComponent<{
  isSubmitting: boolean;
}> = ({ isSubmitting }) => {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [file, setFile] = React.useState<File | null>(null);

  const reset = () => {
    inputRef.current?.value && (inputRef.current.value = '');
    setFile(null);
  };

  React.useEffect(() => {
    if (file) clearDatabase(() => storeFile(file));
  }, [file]);

  return (
    <Form method="post" encType="multipart/form-data">
      <div className="col-span-full">
        <div className="mt-2 flex justify-center rounded-lg border-dashed border-2 border-froly px-6 py-10">
          <div className="text-center">
            <svg
              className="mx-auto h-12 w-12 text-froly"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M1.5 6a2.25 2.25 0 012.25-2.25h16.5A2.25 2.25 0 0122.5 6v12a2.25 2.25 0 01-2.25 2.25H3.75A2.25 2.25 0 011.5 18V6zM3 16.06V18c0 .414.336.75.75.75h16.5A.75.75 0 0021 18v-1.94l-2.69-2.689a1.5 1.5 0 00-2.12 0l-.88.879.97.97a.75.75 0 11-1.06 1.06l-5.16-5.159a1.5 1.5 0 00-2.12 0L3 16.061zm10.125-7.81a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0z"
                clipRule="evenodd"
              />
            </svg>
            <div className="mt-4 flex text-sm justify-center text-center leading-6 text-gray-600">
              <label
                htmlFor="file-upload"
                className="relative cursor-pointer rounded-md bg-white font-semibold text-center text-astronaut focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-600 focus-within:ring-offset-2 hover:text-indigo-500"
              >
                <span>Upload a file</span>
                <input
                  ref={inputRef}
                  id="file-upload"
                  name="file-upload"
                  type="file"
                  className="sr-only"
                  onChange={(e) => {
                    const file = e.target.files?.[0] ?? null;
                    setFile(file);
                  }}
                />
              </label>
              <p className="pl-1">or drag and drop</p>
            </div>
            <p className="text-xs leading-5 text-gray-600">
              PDF up to 10MB
            </p>
            <hr className="my-4 border-froly" />
            <p className="text-sm text-blue-600 font-mono max-w-md">
              {file?.name}
            </p>
          </div>
        </div>
      </div>
      <div className="mt-6 flex items-center justify-end gap-x-6">
        <button
          type="button"
          className="text-sm font-semibold leading-6 text-gray-900"
          onClick={reset}
        >
          Cancel
        </button>
        {isSubmitting ? (
          <button
            disabled
            type="button"
            className="text-swamp gap-2 bg-turquoiseBlue bg-opacity-60 font-medium rounded-lg text-sm px-3 py-2 text-center mr-2 inline-flex items-center"
          >
            <Loader className="w-[16px]" />
            Loading...
          </button>
        ) : (
          <button
            type="submit"
            name="_action"
            value="upload"
            className="rounded-md bg-turquoiseBlue px-3 py-2 text-sm font-semibold text-swamp shadow-sm hover:bg-opacity-70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            disabled={isSubmitting}
          >
            Save
          </button>
        )}
      </div>
    </Form>
  );
};

export { UploadForm };
