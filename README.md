# tiptap-excalidraw-extension

A framework-agnostic extension for integrating Excalidraw into Tiptap editors. This extension allows users to embed and edit Excalidraw drawings directly within Tiptap-powered editors.

## Features

- [x] Basic Element support
- [x] Framework Agnostic, Supports Integration with Vue and Other UI Libraries
- [ ] Collaboration support
- [ ] Image support

## Screenshots

![screenshot](https://github.com/chenxiaoyao6228/tiptap-excalidraw-extension/blob/master/screenshot.png?raw=true)

## Installation

For React Users, you can install the extension using npm, yarn, or pnpm:

```bash
# npm
npm install tiptap-excalidraw-extension
# yarn
yarn add tiptap-excalidraw-extension
# pnpm
pnpm install tiptap-excalidraw-extension
```

**Note:** Since Excalidraw is built with React, if you are using Vue or any other UI library, you will still need to install `react` and `react-dom` as peer dependencies.

```sh
# npm
npm install react react-dom
# yarn
yarn add react react-dom
# pnpm
pnpm install react react-dom
```

## Usage

### React Example

```tsx
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useCallback } from 'react';
import { ExcalidrawExtension } from 'tiptap-excalidraw-extension';

export default function App() {
  const editor = useEditor({
    extensions: [ExcalidrawExtension, StarterKit],
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

### Vue Example

```vue
<template>
  <div class="container w-[80vw] h-screen mx-auto flex flex-col">
    <h1 class="text-3xl text-center py-2">Tiptap Excalidraw Extension Demo</h1>
    <button class="border-2 absolute top-0 left-0" @click="insertExcalidraw">Insert Excalidraw</button>
    <editor-content class="rounded-lg flex-1 p-4 border border-rose-100" :editor="editor" />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useEditor, EditorContent } from '@tiptap/vue-3';
import StarterKit from '@tiptap/starter-kit';
import { ExcalidrawExtension } from 'tiptap-excalidraw-extension';

const editor = useEditor({
  extensions: [ExcalidrawExtension, StarterKit],
  immediatelyRender: false,
  content: '<div></div>'
});

const insertExcalidraw = () => {
  if (editor.value) {
    editor.value.chain().focus().addExcalidraw().run();
  }
};
</script>
```

## Development

```bash
yarn dev
# open a second terminal
cd examples/react-demo && yarn linkExtension
```

## Support & Feedback

If you find this project useful, a star on [GitHub](https://github.com/chenxiaoyao6228/tiptap-excalidraw-extension) would be greatly appreciated. Thank you!

## Acknowledgements

This project wouldn't be possible without the fantastic work of the following projects:

- [Tiptap](https://github.com/ueberdosis/tiptap)
- [Excalidraw](https://github.com/excalidraw/excalidraw)

## License

MIT License
