import { Node } from '@tiptap/core';
import ExcalidrawRenderer from './ExcalidrawComponent';

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
    return ['excalidraw-node', HTMLAttributes];
  },

  addStorage() {
    return {};
  },

  addNodeView() {
    return (props: any) => {
      console.log('props', props);
      const { node, decorations, editor, extension, HTMLAttributes, getPos } = props;
      const container = document.createElement('div');
      const config = {
        ...props,
        updateAttributes: (attrs: Record<string, any>) => {
          const transaction = editor.state.tr.setNodeMarkup(getPos(), undefined, {
            ...node.attrs,
            ...attrs
          });
          editor.view.dispatch(transaction);
        }
      };
      new ExcalidrawRenderer({ container, ...config });
      return {
        dom: container,
        update: (updatedNode) => {
          // handle updates if necessary
          return true;
        }
      };
    };
  },

  // events: https://tiptap.dev/docs/editor/api/events
  onCreate() {
    console.log('tiptap excalidraw created!');
  }
});

export default ExcalidrawExtension;
