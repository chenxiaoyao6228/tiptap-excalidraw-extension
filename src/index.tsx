import { Node } from '@tiptap/core';
import './index.css';
import ExcalidrawRenderer from './ExcalidrawRenderer';
import { uuid } from './ExcalidrawRenderer/util';

export interface IExcalidrawOptions {
  // Static properties for Excalidraw UI
  excalidraw: Record<string, any>;
  // Props for extension
  extension: {
    wrapperClass: string;
  };
}

// Define the attributes for the Excalidraw node
interface IExcalidrawNodeAttrs {
  id: string | null;
  elements: Array<any>;
  appState: Record<string, any>;
  imageUrl: string;
}

// Update the TypeScript module with custom commands
declare module '@tiptap/core' {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  interface Commands<ReturnType> {
    excalidraw: {
      /**
       * Add an Excalidraw block
       * @example
       * editor.chain().focus().addExcalidraw().run();
       */
      addExcalidraw: () => ReturnType;
    };
  }
}

export const ExcalidrawExtension = Node.create({
  name: 'excalidraw',

  group: 'block',

  atom: true,

  addOptions() {
    return {};
  },

  addAttributes(): IExcalidrawNodeAttrs {
    return {
      id: null,
      elements: [],
      appState: {},
      imageUrl: ''
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="excalidraw"]'
      }
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', { 'data-type': 'excalidraw' }, ['img', { src: HTMLAttributes.imageUrl }]];
  },

  addNodeView() {
    return ({ node, getPos, editor }) => {
      const container = createDom(iconEditBase64, node.attrs.imageUrl, this.options.extension.wrapperClass);
      const editButton = container.querySelector('.tiptap-excalidraw-edit-btn') as HTMLDivElement;

      editButton.addEventListener('click', () => {
        if (typeof getPos === 'function') {
          const position = getPos();
          const latestNode = editor.state.doc.nodeAt(position);

          if (latestNode) {
            this.editor.storage.excalidrawRenderer.openModal({
              id: latestNode.attrs.id,
              elements: latestNode.attrs.elements,
              appState: latestNode.attrs.appState
            });
          }
        }
      });

      const renderer = this.editor.storage.excalidrawRenderer;

      // Event listener for save event
      const callback = (data: { id: string; imageUrl: string; elements: any[]; appState: Record<string, any> }) => {
        const { id, imageUrl, elements, appState } = data;
        if (id === node.attrs.id) {
          // Only update the corresponding node
          if (typeof getPos === 'function') {
            const position = getPos();
            const transaction = editor.state.tr.setNodeMarkup(position, undefined, {
              ...node.attrs,
              imageUrl,
              elements,
              appState
            });
            editor.view.dispatch(transaction);
            // console.log('editor.getJSON()', editor.getJSON());
          }
        }
      };

      renderer && renderer.emitter.on('save', callback);

      return {
        dom: container,
        contentDOM: container.firstChild,
        update: (updatedNode) => {
          if (updatedNode.attrs.imageUrl !== node.attrs.imageUrl) {
            const imgElement = container.querySelector('.tiptap-excalidraw-thumbnail') as HTMLImageElement;
            if (imgElement) {
              imgElement.src = updatedNode.attrs.imageUrl; // Update img element src
            }
          }
          return true;
        },
        destroy: () => {
          renderer && renderer.emitter.off('save', callback); // Remove event listener
        }
      };
    };
  },

  addCommands() {
    return {
      addExcalidraw:
        () =>
        ({ commands }) => {
          // Insert an empty static node
          const id = uuid();
          commands.insertContent({
            type: this.name,
            attrs: {
              id,
              elements: [],
              appState: {},
              imageUrl: ''
            }
          });

          // Open modal to edit
          setTimeout(() => {
            this.editor.storage.excalidrawRenderer.openModal({
              id,
              elements: [],
              appState: {}
            });
          });

          return true;
        }
    };
  },

  // Lifecycle hook: called before the editor is created
  onBeforeCreate() {
    this.editor.storage.excalidrawRenderer = new ExcalidrawRenderer(this.options.excalidraw);
    console.log('tiptap excalidraw created!');
  },

  // Lifecycle hook: called when the editor is destroyed
  onDestroy() {
    // Remove renderer instance on destruction
    const renderer = this.editor.storage.excalidrawRenderer;
    if (renderer) {
      renderer.unmountElement();
      this.editor.storage.excalidrawRenderer = null;
    }
  }
});

// Utility function to create the DOM structure for the NodeView
function createDom(iconEditBase64: string, imageUrl: string, wrapperClass: string): HTMLDivElement {
  const container = document.createElement('div');
  container.className = `tiptap-excalidraw-static ${wrapperClass}`;

  const innerDiv = document.createElement('div');

  const editBtnDiv = document.createElement('div');
  editBtnDiv.className = 'tiptap-excalidraw-edit-btn';

  const editImg = document.createElement('img');
  editImg.src = iconEditBase64;
  editImg.alt = 'Edit';

  editBtnDiv.appendChild(editImg);

  const thumbnailWrapperDiv = document.createElement('div');
  thumbnailWrapperDiv.className = 'tiptap-excalidraw-thumbnail-wrapper';

  const thumbnailImg = document.createElement('img');
  thumbnailImg.src = imageUrl || '';
  thumbnailImg.alt = 'Thumbnail';
  thumbnailImg.className = 'tiptap-excalidraw-thumbnail';

  thumbnailWrapperDiv.appendChild(thumbnailImg);

  innerDiv.appendChild(editBtnDiv);
  innerDiv.appendChild(thumbnailWrapperDiv);

  container.appendChild(innerDiv);

  return container;
}

const iconEditBase64 =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiAgICA8cGF0aCBkPSJNMy42IDIwLjRoMTYuOCIgc3Ryb2tlPSIjNTI1QzZGIiBzdHJva2Utd2lkdGg9IjEuNSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48L3BhdGg+CiAgICA8cGF0aCBkPSJNNS40NjcgMTMuMjd2My4zOTdIOC44bDkuNjUyLTkuNjU2LTMuNDA5LTMuNDEtOS42NTcgOS42Njh6IiBzdHJva2U9IiM1MjVDNkYiIHN0cm9rZS13aWR0aD0iMS41IiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48L3BhdGg+Cjwvc3ZnPg==';
