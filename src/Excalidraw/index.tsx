import { mergeAttributes, Node } from '@tiptap/core';
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

  parseHTML() {
    return [{ tag: 'excalidraw-node' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['excalidraw-node', mergeAttributes(HTMLAttributes)];
  },

  addNodeView() {
    return (props: any) => {
      console.log('props', props);
      const { node, decorations, editor, extension, HTMLAttributes, getPos } = props;
      const container = document.createElement('div');

      const updateAttributes = (attrs) => {
        const newAttrs = {
          ...node.attrs,
          ...attrs
        };

        const transaction = editor.state.tr.setNodeMarkup(getPos(), undefined, newAttrs);
        editor.view.dispatch(transaction);

        // 这个?
        container.setAttribute('data', JSON.stringify(newAttrs));
      };

      new ExcalidrawRenderer({
        ...props,
        container,
        updateAttributes
      });

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
