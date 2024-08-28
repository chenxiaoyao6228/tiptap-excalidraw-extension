'use client';

import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useCallback } from 'react';
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
    content: '<div></div>'
  });

  const insertExcalidraw = useCallback(() => {
    if (editor) {
      editor.chain().focus().addExcalidraw().run();
    }
  }, [editor]);

  // useEffect(() => {
  //   setTimeout(() => {
  //     insertExcalidraw();
  //   }, 500);
  // }, [insertExcalidraw]);

  return (
    <div className="container w-[80%] h-screen mx-auto">
      <h1 className="text-3xl text-center py-2">Tiptap Excalidraw Extension Demo</h1>
      <button onClick={insertExcalidraw}>Insert Excalidraw</button>
      <div>
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
