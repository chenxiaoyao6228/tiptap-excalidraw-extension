import { mergeAttributes, Node } from '@tiptap/react';
import { ReactNodeViewRenderer } from '@tiptap/react';
import ExcalidrawComponent from './ExcalidrawComponent';
import './index.css';

export interface IExcalidrawOptions {
  inlineImage?: boolean; // inline image in document
  uploader?: (file: File) => Promise<string>; // upload image to server
}

declare module '@tiptap/core' {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  interface Commands<ReturnType> {
    excalidraw: {
      /**
       * Add an Excalidraw
       * @example
       * editor.chain().focus().addExcalidraw().run();
       */
      addExcalidraw: () => ReturnType;
    };
  }
}

const ExcalidrawExtension = Node.create<IExcalidrawOptions>({
  name: 'excalidraw',
  group: 'block',
  atom: true,

  addAttributes() {
    return {
      data: {
        default: {
          elements: [],
          appState: {}
        },
        parseHTML: (element) => {
          const _data = element?.getAttribute('data') || '{}';

          if (element) {
            const res = JSON.parse(_data) || [];
            return res;
          }
          return [];
        },
        renderHTML: (attributes) => ({
          data: JSON.stringify(attributes.data)
        })
      }
    };
  },

  addCommands() {
    return {
      addExcalidraw:
        () =>
        ({ commands }) => {
          return commands.insertContent({
            type: 'excalidraw',
            attrs: {
              data: {
                elements: [],
                appState: {}
              }
            }
          });
        }
    };
  },

  parseHTML() {
    return [{ tag: 'excalidraw-node' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['excalidraw-node', mergeAttributes(HTMLAttributes)];
  },

  addStorage() {
    return {};
  },

  addNodeView() {
    return ReactNodeViewRenderer(ExcalidrawComponent);
  }
});

export default ExcalidrawExtension;
