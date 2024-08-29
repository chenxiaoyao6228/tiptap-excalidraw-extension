# tiptap-excalidraw-extension

An extension for integrating Excalidraw into Tiptap editors, supporting integration with various UI libraries including Vue, but requires React as a dependency.

## Features

- [x] Basic Element support
- [x] Supports Integration with Vue and Other UI Libraries
- [ ] Collaboration support
- [ ] Image support

## Screenshots

![screenshot](https://github.com/chenxiaoyao6228/tiptap-excalidraw-extension/blob/master/screenshot.png?raw=true)

## Installation

To install the tiptap-excalidraw-extension, you can use npm, yarn, or pnpm:

```bash
# npm
npm install tiptap-excalidraw-extension react react-dom
# yarn
yarn add tiptap-excalidraw-extension react react-dom
# pnpm
pnpm install tiptap-excalidraw-extension react react-dom

```

**🚧🚧🚧Note:** Since Excalidraw is built with React, if you are using Vue or any other UI library, you will still need to install `react` and `react-dom` as peer dependencies.

## Usage

To integrate Excalidraw into a Tiptap editor, follow the example below:

```tsx
import { EditorContent, useEditor } from '@tiptap/react'; // For React users
// import { useEditor, EditorContent } from '@tiptap/vue-3'; // For Vue users
import StarterKit from '@tiptap/starter-kit';
import { useCallback } from 'react';
import { ExcalidrawExtension } from 'tiptap-excalidraw-extension';

export default function App() {
  const editor = useEditor({
    extensions: [
      ExcalidrawExtension.configure({
        extension: {
          wrapperClass: 'my-excalidraw-static' // custom class for node wrapper
        }
      }),
      StarterKit
    ],
    immediatelyRender: false,
    content: '<div>tiptap excalidraw demo</div>'
  });

  const insertExcalidraw = useCallback(() => {
    if (editor) {
      editor.chain().focus().addExcalidraw().run();
    }
  }, [editor]);

  return (
    <div className="container w-[80vw] h-screen mx-auto  flex flex-col">
      <h1 className="text-3xl text-center py-2">Tiptap Excalidraw Extension Demo</h1>
      <button className="border-2 absolute top-0 left-0" onClick={insertExcalidraw}>
        Insert Excalidraw
      </button>
      <EditorContent className="rounded-lg flex-1 p-4 border border-rose-100" editor={editor} />
    </div>
  );
}
```

## Styling

You can overwrite the existing class

```scss
.my-excalidraw-static,
.tiptap-excalidraw-static {
  .tiptap-excalidraw-thumbnail-wrapper {
    // write your own style
  }
}
```

## Development

```bash
yarn dev
# open a second terminal
cd examples/react-demo && yarn linkExtension
```

## Acknowledgements

This project wouldn't be possible without the fantastic work of the following projects:

- [Tiptap](https://github.com/ueberdosis/tiptap)
- [Excalidraw](https://github.com/excalidraw/excalidraw)

And if you find this project useful, a star on [GitHub](https://github.com/chenxiaoyao6228/tiptap-excalidraw-extension) would be greatly appreciated. Thank you!

## License

MIT License
