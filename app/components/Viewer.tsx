import * as React from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { useMeasure } from 'react-use';
import { retrieveFile } from '~/data/file-storage.client';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

const Viewer: React.FunctionComponent = () => {
  const [viewerRef, { width }] = useMeasure<HTMLDivElement>();
  const [numPages, setNumPages] = React.useState<number>();
  const [file, setFile] = React.useState<File | null>(null);

  const onDocumentLoadSuccess = ({
    numPages,
  }: {
    numPages: number;
  }): void => {
    setNumPages(numPages);
  };

  React.useEffect(() => {
    retrieveFile((dbFile) => setFile(dbFile));
  }, []);

  if (!file) return null;

  return (
    <div
      className="max-h-screen overflow-auto px-4 py-10"
      ref={viewerRef}
    >
      <Document
        file={file}
        renderMode="canvas"
        onLoadSuccess={onDocumentLoadSuccess}
      >
        {[...Array(numPages)].map((_, i) => (
          <Page
            width={width}
            key={i}
            pageNumber={i + 1}
            renderTextLayer={false}
            renderAnnotationLayer={false}
          />
        ))}
      </Document>
    </div>
  );
};

export { Viewer };
