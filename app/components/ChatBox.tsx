import * as React from 'react';
import { useChat } from 'ai/react';
import { ChevronRight, Loader } from 'react-feather';
import { ChatMessageBubble } from './ChatMessageBubble';

const ChatBox: React.FunctionComponent<{
  docUUID: string | null;
}> = ({ docUUID }) => {
  const messageContainerRef = React.useRef<HTMLDivElement | null>(null);

  // const [sourcesForMessages, setSourcesForMessages] = React.useState<
  //   Record<string, any>
  // >({});
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading: chatEndpointIsLoading,
  } = useChat({
    api: '/api/chat?docUUID=' + docUUID,
    // onResponse(response) {
    //   const sourcesHeader = response.headers.get('x-sources');
    //   const sources = sourcesHeader
    //     ? JSON.parse(atob(sourcesHeader))
    //     : [];
    //   const messageIndexHeader =
    //     response.headers.get('x-message-index');
    //   if (sources.length && messageIndexHeader !== null) {
    //     setSourcesForMessages({
    //       ...sourcesForMessages,
    //       [messageIndexHeader]: sources,
    //     });
    //   }
    // },
    onError: (e) => {
      console.log(e);
    },
  });

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (messageContainerRef.current) {
      messageContainerRef.current.classList.add('grow');
    }
    if (!messages.length) {
      await new Promise((resolve) => setTimeout(resolve, 300));
    }
    if (chatEndpointIsLoading) {
      return;
    }
    handleSubmit(e);
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-xl text-swamp max-h-full overflow-y-auto">
      <div className="text-center p-4">
        <div className="flex w-[50px] h-[50px] rounded-full bd-white shadow-md overflow-hidden p-1 mx-auto mb-4">
          <img src="/edgar.png" alt="" />
        </div>
        <p className="text-xl mb-4 leading-relaxed">
          Bonjour, je suis{' '}
          <strong className="text-swamp underline decoration-wavy decoration-turquoiseBlue">
            Edgar
          </strong>
          , votre assistant virtuel.👋
        </p>
        <p>
          Je suis là pour vous aider à <strong>analyser votre document</strong>.
        </p>
      </div>
      <div
        className="flex flex-col-reverse w-full mb-4 overflow-auto transition-[flex-grow] ease-in-out"
        ref={messageContainerRef}
      >
        {messages.length > 0
          ? [...messages].reverse().map((m, i) => {
              //const sourceKey = (messages.length - 1 - i).toString();
              return (
                <ChatMessageBubble
                  key={m.id}
                  message={m}
                  aiEmoji="🤖"
                  isComplete={i < messages.length - 2 || !chatEndpointIsLoading}
                  //sources={sourcesForMessages[sourceKey]}
                />
              );
            })
          : ''}
      </div>
      <form onSubmit={onSubmit}>
        <div className="flex gap-2 items-center mt-4 relative">
          <input
            className="p-2 rounded placeholder:italic placeholder:text-ebb w-full border-ebb pr-10"
            value={input}
            placeholder="Posez votre question..."
            onChange={handleInputChange}
          />
          <button
            type="submit"
            className="text-white bg-turquoiseBlue font-medium rounded-full text-sm p-2 text-center inline-flex items-center justify-center absolute right-2 w-[30px] h-[30px]"
          >
            <span className={!chatEndpointIsLoading ? 'hidden' : ''}>
              <Loader />
            </span>
            <span className={chatEndpointIsLoading ? 'hidden' : ''}>
              <ChevronRight />
            </span>
          </button>
        </div>
      </form>
    </div>
  );
};

export { ChatBox };
