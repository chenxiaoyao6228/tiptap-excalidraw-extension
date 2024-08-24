'use client';

import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useEffect } from 'react';
import { ExcalidrawExtension } from 'tiptap-excalidraw-extension';

export default function EditorComponent() {
  const editor = useEditor({
    extensions: [
      ExcalidrawExtension,
      StarterKit.configure({
        history: false
      })
    ],
    immediatelyRender: false,
    content: ''
  });

  const insertExcalidraw = () => {
    if (editor) {
      editor.chain().focus().addExcalidraw().run();
    }
  };

  useEffect(() => {
    setTimeout(() => {
      insertExcalidraw();
    }, 500);
  }, [insertExcalidraw]);

  return (
    <div className="container w-[80%] h-screen mx-auto">
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
