import { mergeAttributes, Node } from '@tiptap/react';
import { ReactNodeViewRenderer } from '@tiptap/react';
import ExcalidrawComponent from './ExcalidrawComponent';

interface IExcalidrawOptions {}

const Excalidraw = Node.create<IExcalidrawOptions>({
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

export default Excalidraw;
