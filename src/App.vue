
<template>
  <div class="p-8">
    <DropZone @files-dropped="filesDropped">
      <div class="drop-zone w-screen h-screen bg-opacity-50 fixed inset-0"></div>
    </DropZone>
    <RenderData :data="metadata"></RenderData>
    <hr >
    <RenderData :data="vm"></RenderData>
  </div>
</template>

<script setup lang="ts">
import DropZone from "@/components/DropZone.vue";
import RenderData from "@/components/RenderData.vue";
import * as PDFJS from 'pdfjs-dist';
import { ref } from "vue";

PDFJS.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDFJS.version}/pdf.worker.js`;

const metadata = ref({} );
metadata.value = { "PDF Metadata Viewer": "Drop a PDF file onto this page." };
const vm = ref({} );

function filesDropped(files) {
  const file1 = files[0]
  let fileReader = new FileReader()
  fileReader.onload = async function () {
    let ab = this.result;
    const pdf = await PDFJS.getDocument({data: ab}).promise
    const pages = pdf.numPages;
    let textLines : string[] = []
    for( let i=1; i<=pdf.numPages; i++ ) {
      const page = await pdf.getPage(i)
      const pageText = await page.getTextContent()
      pageText.items.forEach( (textItem)=> {
          textLines.push( textItem.str )
      })
    }
    vm.value = getVisualMetaFromLines( textLines );
    metadata.value = await pdf.getMetadata()
  }
  fileReader.readAsArrayBuffer(file1);
}

function getVisualMetaFromLines(lines : string[] ) {

  let i = 0;
  while( i<lines.length && lines[i] != "@{visual-meta-start}") {
    i++;
  }
  if( i==lines.length ) {
    return [ "Dang, did not find any visual meta"];
  }
  i++; // skip the begin line
  let vm = {lines:[]};
  while( i<lines.length && lines[i] != "@{visual-meta-end}") {
     vm.lines.push( lines[i] );
     i++
  }
  return vm;
}

</script>

<style lang="scss" >

.drop-active .drop-zone {
  background: green;
  opacity: 0.2;
}
</style>
