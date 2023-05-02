/* a better version of this would sort the text in pages by position and build it into
   lines rather than just guess they are in the right order in the data. It should sort
   by x,y position
 */
import {BibParse, vmItem} from "@/BibParse";
import * as PDFJS from "pdfjs-dist";
import {TextItem, TextMarkedContent} from "pdfjs-dist/types/src/display/api";

PDFJS.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDFJS.version}/pdf.worker.js`;

function isTextItem( x : TextItem | TextMarkedContent ) : x is TextItem {
    return (x as TextItem).str !== undefined
}

export async function extractFromArrayBuffer(ab: string | ArrayBuffer) {
    const pdf = await PDFJS.getDocument({data: ab}).promise
    let docText = ""
    let lastY: number;
    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i)
        const pageText = await page.getTextContent()
        pageText.items.forEach((textItem) => {
            if( !isTextItem(textItem)) { return }
            // nb Y=0 is the bottom of the page
            if (lastY && textItem.transform[5] != lastY) {
                // not the same line as last time
                docText += "\n"
            }
            docText += textItem.str
            lastY = textItem.transform[5]
        })
    }
    return {
        metadata: await pdf.getMetadata(),
        visualMeta: getVisualMetaFromString(docText)
    }
}

function getVisualMetaFromString(fullText: string) {

    if (!fullText.match(/@{visual-meta-start}/)) {
        throw new Error("No VM start tag")
    }

    // if there's multiple occurrences, we just want the last one.
    const splitOnStart = fullText.split("@{visual-meta-start}");

    const lastPart = splitOnStart.pop()
    if( !lastPart ) {
        throw new Error("No VM start tag") // this should be caught by the test above instead
    }

    if (!lastPart.match(/@{visual-meta-end}/)) {
        throw new Error("Start tag but no end tag")
    }
    const vmTextAndJunk = lastPart.split("@{visual-meta-end}");
    const text = vmTextAndJunk[0]

    const sections : Record<string,Array<vmItem>> = {}
    // split into sections
    const matches = [...text.matchAll(/@\{([a-zA-Z0-9-]+)-start\}(.*)@\{\1-end\}/gs)]
    matches.forEach((a_match) => {
        sections[a_match[1]] = new BibParse(a_match[2]).parse();
    })
    return sections
}