<template>
  <div class="container w-[80vw] h-screen mx-auto flex flex-col">
    <h1 class="text-3xl text-center py-2">Tiptap Excalidraw Extension Demo</h1>
    <button class="border-2 absolute top-0 left-0" @click="insertExcalidraw">Insert Excalidraw</button>
    <editor-content class="rounded-lg flex-1 p-4 border border-gray" :editor="editor" />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useEditor, EditorContent } from '@tiptap/vue-3';
import StarterKit from '@tiptap/starter-kit';
import { ExcalidrawExtension } from 'tiptap-excalidraw-extension';

const editor = useEditor({
  extensions: [
    ExcalidrawExtension.configure({
      extension: {
        wrapperClass: 'my-excalidraw-static'
      },
      excalidraw: {}
    }),
    StarterKit.configure({
      history: false
    })
  ],
  immediatelyRender: false,
  autofocus: true,
 content: '<div>You can pass wrapper class to overwrite existing styles</div>'
});

const insertExcalidraw = () => {
  if (editor.value) {
    editor.value.chain().focus().addExcalidraw().run();
  }
};
</script>

<style scoped>
/* Add any necessary styles here */
</style>
