import { mergeAttributes, Node } from '@tiptap/core';
import './index.css';
import ExcalidrawRenderer from './ExcalidrawRenderer';
import { uuid } from './ExcalidrawRenderer/util';
import { IExcalidrawNodeAttrs } from './ExcalidrawRenderer/type';

const localDataMap = new Map();

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

  draggable: true,

  addOptions() {
    return {
      inline: false,
      wrapperClass: '',
      uploadFn: null,
      downloadFn: null
    };
  },

  addAttributes(): IExcalidrawNodeAttrs {
    return this.options.extension.inline
      ? {
          id: null,
          data: {
            elements: [],
            appState: {},
            fileIds: [],
            thumbnailUrl: ''
          },
          // FIXME: kind of like forceUpdate
          version: 1
        }
      : {
          id: null,
          remoteDataUrl: '',
          version: 1
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
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'excalidraw' }), 0];
  },

  addNodeView() {
    return ({ node, getPos, editor }) => {
      const container = createDom(this.options.extension.wrapperClass);
      const thumbnailWrapperDiv = container.querySelector('.tiptap-excalidraw-thumbnail-wrapper');

      const updateNodeAttrs = (attrs) => {
        if (typeof getPos === 'function') {
          const position = getPos();
          const transaction = editor.state.tr.setNodeMarkup(position, undefined, attrs);
          editor.view.dispatch(transaction);
        }
      };

      // remote fetch
      if (node.attrs.remoteDataUrl && !localDataMap.get(node.attrs.id)) {
        this.options.extension
          .downloadFn(node.attrs.remoteDataUrl)
          .then((res) => {
            //  inline: false，将 data 存储到 localDataWeakMap 中，不存储到 attrs
            localDataMap.set(node.attrs.id, res.data);
            updateNodeAttrs({
              ...node.attrs,
              version: node.attrs.version + 1
            });
          })
          .catch((error) => {
            console.error('Failed to fetch remote data:', error);
          });
      } else {
        // 如果已有 data，且 inline 为 false，则从 localDataWeakMap 中获取
        const dataToRender = this.options.extension.inline ? node.attrs.data : localDataMap.get(node.attrs.id);
        renderThumbnail(dataToRender);
      }

      // handle save event
      const callback = (params: { id: string; data: { imageUrl: string; elements: any[]; appState: Record<string, any> }; remoteDataUrl: string }) => {
        const { id, data, remoteDataUrl } = params;
        if (id === node.attrs.id) {
          if (this.options.extension.inline) {
            const updatedAttrs = {
              ...node.attrs,
              data
            };
            updateNodeAttrs(updatedAttrs);
          } else {
            localDataMap.set(node.attrs.id, data);
            const updatedAttrs = {
              ...node.attrs,
              remoteDataUrl
            };
            updateNodeAttrs(updatedAttrs);
          }
        }
      };

      const renderer = this.editor.storage.excalidrawRenderer;
      renderer && renderer.emitter.on('save', callback);

      // edit button event
      const editButton = container.querySelector('.tiptap-excalidraw-edit-btn') as HTMLDivElement;

      const editHandler = () => {
        if (typeof getPos === 'function') {
          const position = getPos();
          const latestNode = editor.state.doc.nodeAt(position);

          if (latestNode) {
            const dataToEdit = this.options.extension.inline ? latestNode.attrs.data : localDataMap.get(latestNode.attrs.id);

            this.editor.storage.excalidrawRenderer.openModal({
              id: latestNode.attrs.id,
              elements: dataToEdit.elements,
              appState: dataToEdit.appState
            });
          }
        }
      };

      editButton.addEventListener('click', editHandler);
      function renderThumbnail(data) {
        if (thumbnailWrapperDiv && data && data.thumbnailUrl) {
          const imgElement = thumbnailWrapperDiv.querySelector('.tiptap-excalidraw-thumbnail') as HTMLImageElement;
          if (imgElement) {
            imgElement.src = data.thumbnailUrl;
          }
        }
      }

      return {
        dom: container,
        contentDOM: container.firstChild,
        update: (updatedNode) => {
          if (updatedNode.attrs.version !== node.attrs.version) {
            const imgElement = container.querySelector('.tiptap-excalidraw-thumbnail') as HTMLImageElement;
            if (imgElement) {
              const nodeData = localDataMap.get(updatedNode.attrs.id);
              if (nodeData) {
                imgElement.src = nodeData.thumbnailUrl; // Update img element src
              }
            }
          }
          // for inline
          if (this.options.extension.inline) {
            if (updatedNode.attrs.data && updatedNode.attrs.data.thumbnailUrl !== node.attrs.data.thumbnailUrl) {
              const imgElement = container.querySelector('.tiptap-excalidraw-thumbnail') as HTMLImageElement;
              if (imgElement) {
                imgElement.src = updatedNode.attrs.data.thumbnailUrl;
              }
            }
          }
          return false;
        },
        destroy: () => {
          editButton && editButton.removeEventListener('click', editHandler);
          renderer && renderer.emitter.off('save', callback); // remove event listener
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

          const attrs = this.options.extension.inline
            ? {
                id,
                data: {
                  elements: [],
                  appState: {},
                  fileIds: [],
                  thumbnailUrl: ''
                }
              }
            : {
                id,
                remoteDataUrl: '' // 为 inline: false 默认提供 remoteDataUrl
              };

          commands.insertContent({
            type: this.name,
            attrs
          });

          // Open modal to edit
          setTimeout(() => {
            this.editor.storage.excalidrawRenderer.openModal(attrs);
          });

          return true;
        }
    };
  },

  onBeforeCreate() {
    this.editor.storage.excalidrawRenderer = new ExcalidrawRenderer(this.options);
    console.log('tiptap excalidraw created!');
  },

  onDestroy() {
    const renderer = this.editor.storage.excalidrawRenderer;
    if (renderer) {
      renderer.unmountElement();
      this.editor.storage.excalidrawRenderer = null;
    }
    console.log('tiptap excalidraw destroyed!');
  }
});

// Utility function to create the DOM structure for the NodeView
function createDom(wrapperClass: string): HTMLDivElement {
  const iconEditBase64 =
    'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiAgICA8cGF0aCBkPSJNMy42IDIwLjRoMTYuOCIgc3Ryb2tlPSIjNTI1QzZGIiBzdHJva2Utd2lkdGg9IjEuNSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48L3BhdGg+CiAgICA8cGF0aCBkPSJNNS40NjcgMTMuMjd2My4zOTdIOC44bDkuNjUyLTkuNjU2LTMuNDA5LTMuNDEtOS42NTcgOS42Njh6IiBzdHJva2U9IiM1MjVDNkYiIHN0cm9rZS13aWR0aD0iMS41IiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48L3BhdGg+Cjwvc3ZnPg==';

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
  thumbnailImg.src = '';
  thumbnailImg.alt = 'Thumbnail';
  thumbnailImg.className = 'tiptap-excalidraw-thumbnail';

  thumbnailWrapperDiv.appendChild(thumbnailImg);

  innerDiv.appendChild(editBtnDiv);
  innerDiv.appendChild(thumbnailWrapperDiv);

  container.appendChild(innerDiv);

  return container;
}
