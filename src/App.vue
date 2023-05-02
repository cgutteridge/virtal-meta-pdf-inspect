<template>
  <div class="p-8">
    <DropZone @files-dropped="filesDropped">
      <div class="drop-zone w-screen h-screen bg-opacity-50 fixed inset-0"></div>
    </DropZone>
    <RenderData :data="metadata"></RenderData>
    <hr>
    <RenderData :data="vm"></RenderData>
  </div>
</template>

<script setup lang="ts">
import DropZone from "@/components/DropZone.vue";
import RenderData from "@/components/RenderData.vue";
import * as PDFJS from 'pdfjs-dist';
import {ref} from "vue";
import {BibParse} from "@/BibParse";

PDFJS.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDFJS.version}/pdf.worker.js`;

const metadata = ref({});
metadata.value = {"PDF Metadata Viewer": "Drop a PDF file onto this page."};
const vm = ref({});

function filesDropped(files) {
  const file1 = files[0]
  let fileReader = new FileReader()
  fileReader.onload = async function () {
    let ab = this.result;
    const pdf = await PDFJS.getDocument({data: ab}).promise
    let docText = ""
    let lastY = null
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i)
      const pageText = await page.getTextContent()
      pageText.items.forEach((textItem) => {
        // nb Y=0 is the bottom of the page
        if (textItem.transform[5] != lastY) {
          // not the same line as last time
          docText += "\n"
        }
        docText += textItem.str
        lastY = textItem.transform[5]
      })
    }
    vm.value = getVisualMetaFromString(docText)
    metadata.value = await pdf.getMetadata()
  }
  fileReader.readAsArrayBuffer(file1);
}

function getVisualMetaFromString(fullText: string) {

  if (!fullText.match(/@{visual-meta-start}/)) {
    throw new Error("No VM start tag")
  }

  // if there's multiple occurrences, we just want the last one.
  const splitOnStart = fullText.split("@{visual-meta-start}");
  const lastPart = splitOnStart.pop()

  if (!lastPart.match(/@{visual-meta-end}/)) {
    throw new Error("Start tag but no end tag")
  }
  const vmTextAndJunk = lastPart.split("@{visual-meta-end}");
  const text = vmTextAndJunk[0]

  let sections = {}
  // split into sections
  const matches = [...text.matchAll(/@\{([a-zA-Z0-9-]+)-start\}(.*)@\{\1-end\}/gs)]
  matches.forEach((a_match) => {
    sections[a_match[1]] = new BibParse(a_match[2]).parse();
  })
  return sections
}


</script>

<style lang="scss">

.drop-active .drop-zone {
  background: green;
  opacity: 0.2;
}
</style>
