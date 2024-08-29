import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useCallback } from 'react';
import { ExcalidrawExtension } from 'tiptap-excalidraw-extension';

export default function App() {
  const editor = useEditor({
    extensions: [
      ExcalidrawExtension.configure({
        extension: {
          wrapperClass: 'my-excalidraw-static'
        },
        excalidraw: {}
      }),
      StarterKit.configure({
        history: false
      })
    ],
    immediatelyRender: false,
    content: {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: "click the 'insert excalidraw icon to insert"
            }
          ]
        },
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'You can pass wrapper class to overwrite existing styles'
            }
          ]
        }
      ]
    }
  });

  const insertExcalidraw = useCallback(() => {
    if (editor) {
      editor.chain().focus().addExcalidraw().run();
    }
  }, [editor]);

  return (
    <div className="container w-[80vw] h-screen mx-auto  flex flex-col">
      <h1 className="text-3xl text-center py-2">Tiptap Excalidraw Extension Demo</h1>
      <button className="border-2  absolute top-0 left-0" onClick={insertExcalidraw}>
        Insert Excalidraw
      </button>
      <EditorContent className="rounded-lg flex-1 p-4 border border-rose-100" editor={editor} />
    </div>
  );
}
