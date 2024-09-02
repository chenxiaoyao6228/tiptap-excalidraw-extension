# tiptap-excalidraw-extension

An extension for integrating Excalidraw into Tiptap editors, supporting integration with various UI libraries including Vue, but requires React as a dependency.

## Features

- [x] Basic Element support
- [x] Supports Integration with Vue and Other UI Libraries
- [x] Support external excalidraw data by passing uploadFn and downloadFn
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
import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { ExcalidrawExtension } from 'tiptap-excalidraw-extension';

const DOC_LOCAL_STORATE_KEY = 'tiptapDocDataUrl';

const uploadFn = async (file: Blob | object, ext: 'png' | 'jpg' | 'webp' | 'json') => {
  const formData = new FormData();

  if (ext === 'json') {
    const jsonBlob = new Blob([JSON.stringify(file)], { type: 'application/json' });
    formData.append('file', jsonBlob, `data.${ext}`);
  } else if (['png', 'jpg', 'webp'].includes(ext)) {
    formData.append('file', file as Blob, `image.${ext}`);
  } else {
    throw new Error('Unsupported file type');
  }

  try {
    const response = await axios.post(`http://localhost:3000/upload?ext=${ext}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    return { dataUrl: response.data.url };
  } catch (error) {
    console.error('File upload failed:', error);
    throw new Error('File upload failed');
  }
};

const downloadFn = async (url: string) => {
  try {
    const response = await axios.get(url, { responseType: 'blob' });
    const ext = url.split('.').pop();

    if (ext === 'json') {
      const text = await response.data.text();
      return JSON.parse(text);
    } else if (['png', 'jpg', 'webp'].includes(ext)) {
      return URL.createObjectURL(response.data);
    } else {
      throw new Error('Unsupported file type');
    }
  } catch (error) {
    console.error('File download failed:', error);
    throw new Error('File download failed');
  }
};

export default function App() {
  const [loading, setLoading] = useState(false);
  const editor = useEditor({
    extensions: [
      ExcalidrawExtension.configure({
        extension: {
          inline: false,
          uploadFn,
          downloadFn
        }
      }),
      StarterKit
    ],
    autofocus: true
  });

  const saveDocument = useCallback(async () => {
    if (editor) {
      const jsonContent = editor.getJSON();
      try {
        setLoading(true);

        const result = await uploadFn(jsonContent, 'json');
        const dataUrl = result.dataUrl;
        console.log('Document saved with file ID:', dataUrl);

        localStorage.setItem(DOC_LOCAL_STORATE_KEY, dataUrl);
      } catch (error) {
        console.error('Failed to save document:', error);
      } finally {
        setLoading(false);
      }
    }
  }, [editor]);

  const loadDocument = useCallback(
    async (dataUrl: string) => {
      try {
        const jsonContent = await downloadFn(dataUrl);
        editor?.commands.setContent(jsonContent);
      } catch (error) {
        console.error('Failed to load document:', error);
      }
    },
    [editor]
  );

  useEffect(() => {
    const storedDataUrl = localStorage.getItem(DOC_LOCAL_STORATE_KEY);
    if (storedDataUrl) {
      loadDocument(storedDataUrl);
    }
  }, [loadDocument]);

  const insertExcalidraw = useCallback(() => {
    if (editor) {
      editor.chain().focus().addExcalidraw().run();
    }
  }, [editor]);

  return (
    <div className="container w-[80vw] h-screen mx-auto flex flex-col">
      <h1 className="text-3xl text-center py-2">Tiptap Excalidraw Extension Demo</h1>
      <div className=" absolute top-0 left-0">
        <button className="block mb-1 border-2" onClick={insertExcalidraw}>
          Insert Excalidraw
        </button>
        <button className="border-2 " onClick={saveDocument}>
          {loading ? 'Saving Document...' : 'Save Document'}
        </button>
      </div>
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
