import * as React from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { useMeasure } from 'react-use';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

const Viewer: React.FunctionComponent<{ file: File | null }> = ({ file }) => {
  const [viewerRef, { width }] = useMeasure<HTMLDivElement>();
  const [numPages, setNumPages] = React.useState<number>();

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }): void => {
    setNumPages(numPages);
  };

  if (!file) return null;
  return (
    <div className="max-h-screen overflow-auto" ref={viewerRef}>
      <Document file={file} renderMode="canvas" onLoadSuccess={onDocumentLoadSuccess}>
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
