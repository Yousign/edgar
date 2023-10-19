import * as React from 'react';
import type { Message } from 'ai/react';

const ChatMessageBubble: React.FunctionComponent<{
  message: Message;
  aiEmoji?: string;
  sources?: any[];
  isComplete?: boolean;
}> = (props) => {
  const isUser = props.message.role === 'user';
  const colorClassName = isUser ? 'bg-juniper text-white' : 'bg-pampas text-black';
  const alignmentClassName = isUser ? 'ml-auto' : 'mr-auto';
  const prefix = isUser ? '🧑' : props.aiEmoji;

  const [isSpeaking, setIsSpeaking] = React.useState(false);
  const utterance = React.useRef<SpeechSynthesisUtterance | null>(null);

  const toggleSpeakMessage = () => {
    if (isSpeaking) {
      setIsSpeaking(false);
      speechSynthesis.cancel();
    } else {
      setIsSpeaking(true);
      utterance.current = new SpeechSynthesisUtterance(props.message.content);
      utterance.current.lang = 'fr-FR';
      speechSynthesis.speak(utterance.current);
      utterance.current.onend = () => {
        setIsSpeaking(false);
      };
    }
  };

  return (
    <div
      className={`${alignmentClassName} ${colorClassName} rounded px-4 py-2 max-w-[80%] mb-8 flex not-prose`}
    >
      <div className="mr-2">{prefix}</div>
      <div className="whitespace-pre-wrap flex flex-col">
        <span>{props.message.content}</span>
        {props.sources && props.sources.length ? (
          <>
            <code className="mt-4 mr-auto bg-slate-600 px-2 py-1 rounded">
              <h2>🔍 Sources:</h2>
            </code>
            <code className="mt-1 mr-2 bg-slate-600 px-2 py-1 rounded text-xs">
              {props.sources?.map((source, i) => (
                <div className="mt-2" key={'source:' + i}>
                  {i + 1}. &quot;{source.pageContent}&quot;
                  {source.metadata?.loc?.lines !== undefined ? (
                    <div>
                      <br />
                      Lines {source.metadata?.loc?.lines?.from} to {source.metadata?.loc?.lines?.to}
                    </div>
                  ) : (
                    ''
                  )}
                </div>
              ))}
            </code>
          </>
        ) : (
          ''
        )}
      </div>
      {!isUser && props.isComplete && (
        <div className="ml-2">
          <button onClick={toggleSpeakMessage}>{isSpeaking ? '⏹️' : '🔈'}</button>
        </div>
      )}
    </div>
  );
};

export { ChatMessageBubble };
