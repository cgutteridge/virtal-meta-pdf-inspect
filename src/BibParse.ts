
export interface vmItem {
    name : string;
    properties : Record<string, string>
}

/* this class roughly parses a bibtex structure. Please be gentle! */

export class BibParse {
    offset = 0;
    text: string;

    constructor(text : string ) {
        this.text = text
    }

    parse() : Array<vmItem> {
        this.offset = 0
        return this.itemList()
    }

    itemList() : Array<vmItem> {
        this.whitespace();
        if (this.atEnd()) {
            return []
        }
        const item = this.item()
        const items = this.itemList()
        return items.concat( [item] )
    }

    // consume whitespace
    whitespace() {
        while (!this.atEnd() && this.nextChar().match(/[\s¶]/)) {
            this.offset++;
        }
    }

    item() : vmItem {
        // consume @foo{...}
        // this is a named object with a set of it's own key value pairs.
        this.consume("@");
        const name = this.term()
        this.whitespace()
        this.consume("{")
        this.whitespace()
        const kvl = this.keyValueList();
        this.consume("}")
        return { name: name, properties: kvl }
    }

    consume(c : string) {
        if (this.nextChar() != c) {
            const a = this.text.substring(Math.max(0,this.offset-64),this.offset)
            const b = this.text.substring(this.offset,Math.min( this.text.length-1, this.offset+64))
            throw new Error(`Failed to find expected character: "${c}" ${a}<--HERE-->${b} `)
        }
        this.offset++
    }

    // foo: {bar}, baz: "boop"
    keyValueList() : Record<string,string> {
        this.whitespace()
        let key : string = this.term()
        let val : string
        this.whitespace()
        // if the next character is } or , then this was an ID
        if( this.nextChar() == "}" || this.nextChar() == "," ) {
            val = key
            key = "_id"
        } else {
            this.consume("=")
            this.whitespace()
            val = this.string()
            this.whitespace()
        }
        let kvl : Record<string,string> = {};
        if (this.nextChar() == ",") {
            this.consume(',')
            this.whitespace()
            // the last item can have a , after it so check we are not at the end
            // of the {} block
            if(this.nextChar() != "}") {
                kvl = this.keyValueList();
            }
        }
        kvl[key] = val;
        return kvl;
    }

    string() {
        // {} or "" or term
        let s = ""
        if (this.nextChar() == "{") {
            this.consume("{")
            while (!this.atEnd() && this.nextChar() != "}") {
                s += this.nextChar()
                this.offset++
            }
            this.consume("}")
        } else if (this.nextChar() == "\"") {
            this.consume("\"")
            while (!this.atEnd() && this.nextChar() != "\"") {
                s += this.nextChar()
                this.offset++
            }
            this.consume("\"")
        } else {
            s = this.term();
        }

        return s
    }

    term(): string {
        let name = ""
        while (!this.atEnd() && this.nextChar().match(/[^\s{},=]/i)) {
            name += this.nextChar();
            this.offset++;
        }
        return name
    }

    atEnd(): boolean {
        return this.offset >= this.text.length
    }

    nextChar(): string {
        return this.text.charAt(this.offset)
    }

}