'use client';

import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useEffect } from 'react';
import ExcalidrawExtension from 'tiptap-excalidraw-extension';

export default function EditorComponent() {
  const editor = useEditor({
    extensions: [
      ExcalidrawExtension,
      StarterKit.configure({
        history: false
      })
    ],
    content: ''
  });

  const insertExcalidraw = () => {
    if (editor) {
      editor
        .chain()
        .focus()
        .insertContent({
          type: 'excalidraw',
          attrs: {
            data: {
              elements: [
                {
                  id: 'kIxnWnvtozaoeiag9uMb4',
                  type: 'diamond',
                  x: 143.1111183166504,
                  y: 73.33333206176758,
                  width: 187.55555725097656,
                  height: 131.55557250976562,
                  angle: 0,
                  strokeColor: '#1e1e1e',
                  backgroundColor: 'transparent',
                  fillStyle: 'solid',
                  strokeWidth: 2,
                  strokeStyle: 'solid',
                  roughness: 1,
                  opacity: 100,
                  groupIds: [],
                  frameId: null,
                  roundness: {
                    type: 2
                  },
                  seed: 1016344230,
                  version: 10,
                  versionNonce: 47096806,
                  isDeleted: false,
                  boundElements: null,
                  updated: 1724403109796,
                  link: null,
                  locked: false
                }
              ],
              appState: {}
            }
          }
        })
        .run();
    }
  };

  useEffect(() => {
    setTimeout(() => {
      insertExcalidraw();
    }, 500);
  }, []);

  return (
    <div className="container">
      <button onClick={insertExcalidraw}>Insert Excalidraw</button>
      <div
        style={{
          border: '1px solid red',
          height: '500px'
        }}
      >
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
