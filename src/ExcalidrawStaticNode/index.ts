import { Node } from '@tiptap/core';
import './index.css';

const openExcalidrawModal = (...props: any) => {
  alert('modal open');
};

const handleExcalidrawEditing = (editor, getPos, elements, appState, onSaveCallback) => {
  openExcalidrawModal({
    elements,
    appState,
    onSave: (excalidrawAPI, elements, appState) => {
      excalidrawAPI.exportToCanvas({}).then((canvas) => {
        const imageUrl = canvas.toDataURL();

        if (getPos) {
          const position = typeof getPos === 'function' ? getPos() : getPos;
          editor.view.dispatch(
            editor.state.tr.setNodeMarkup(position, null, {
              elements,
              appState,
              imageUrl
            })
          );
        }

        if (onSaveCallback) {
          onSaveCallback(imageUrl);
        }
      });
    }
  });
};

export const iconEditBase64 =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiAgICA8cGF0aCBkPSJNMy42IDIwLjRoMTYuOCIgc3Ryb2tlPSIjNTI1QzZGIiBzdHJva2Utd2lkdGg9IjEuNSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48L3BhdGg+CiAgICA8cGF0aCBkPSJNNS40NjcgMTMuMjd2My4zOTdIOC44bDkuNjUyLTkuNjU2LTMuNDA5LTMuNDEtOS42NTcgOS42Njh6IiBzdHJva2U9IiM1MjVDNkYiIHN0cm9rZS13aWR0aD0iMS41IiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48L3BhdGg+Cjwvc3ZnPg==';

const ExcalidrawStaticNode = Node.create({
  name: 'excalidraw-static',

  group: 'block',

  atom: true,

  addOptions() {
    return {
      wrapperClass: ''
    };
  },

  addAttributes() {
    return {
      elements: {
        default: []
      },
      appState: {
        default: {}
      },
      imageUrl: {
        default: ''
      }
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="excalidraw-static"]'
      }
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', { 'data-type': 'excalidraw-static' }, ['img', { src: HTMLAttributes.imageUrl }]];
  },

  addNodeView() {
    return ({ node, getPos, editor }) => {
      const container = document.createElement('div');

      const mergedWrapperClass = `tiptap-excalidraw-static ${this.options.wrapperClass}`;

      container.className = mergedWrapperClass;

      container.innerHTML = `
          <button class="tiptap-excalidraw-edit-btn">
            <img src="${iconEditBase64}" alt="Edit" />
          </button>
          <div class="tiptap-excalidraw-thumbnail-wrapper">
            <img src="${node.attrs.imageUrl || ''}" alt="Thumbnail" class="tiptap-excalidraw-thumbnail" />
          </div>
      `;

      const editButton = container.querySelector('.tiptap-excalidraw-edit-btn');
      editButton.addEventListener('click', () => {
        handleExcalidrawEditing(editor, getPos, node.attrs.elements, node.attrs.appState, () => {});
      });

      return {
        dom: container,
        contentDOM: container.firstChild
      };
    };
  },

  addCommands() {
    return {
      addExcalidraw:
        () =>
        ({ commands, editor }) => {
          const { state, view } = editor;

          // insert an empty staic node
          commands.insertContent({
            type: this.name,
            attrs: {
              elements: [],
              appState: {},
              imageUrl: ''
            }
          });

          const nodePosition = state.selection.$anchor.pos - 1;

          // open modal to edit
          handleExcalidrawEditing(view, nodePosition, [], {}, null);

          return true;
        }
    };
  },

  // events: https://tiptap.dev/docs/editor/api/events
  onCreate() {
    console.log('tiptap excalidraw created!');
  }
});

export default ExcalidrawStaticNode;
