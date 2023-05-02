import {expectTypeOf, expect, beforeEach, test, describe} from 'vitest'
import {BibParse} from "../src/BibParse";

describe('term()', () => {

    test("when a term is parsed: return the term and move the offset forward", () => {
        const p = new BibParse("foo bar baz")
        const n = p.term()
        expect(n).toEqual("foo")
        expect(p.offset).toEqual(3)
    });

    test("when a term contains a hyphen: return the current term and move the offset forward", ()=>{
        const p = new BibParse("foo-bar baz")
        const n = p.term()
        expect(n).toEqual("foo-bar")
        expect(p.offset).toEqual(7)
    })

});

describe( 'whitespace()', ()=>{
    test( 'when an empty string is parsed for whitespace: nothing happens', ()=>{
        const p = new BibParse( '')
        p.whitespace()
        expect(p.offset).toEqual(0)
    })

    test( 'when whitespace() parses a string starting without whitespace: do nothing',()=>{
        const p = new BibParse( 'foo')
        p.whitespace()
        expect(p.offset).toEqual(0)
    })

    test( 'when whitespace() parses a string starting with whitespace: move the offset to the next non whitespace char',()=>{
        const p = new BibParse( '   foo')
        p.whitespace()
        expect(p.offset).toEqual(3)
    })
})

describe( 'string()', ()=>{
    test( "when foo, is parsed it returns 'foo'", ()=>{
        const p = new BibParse( "foo,")
      const s = p.string()
      expect(s).toEqual("foo")
      expect(p.offset).toEqual(3)
    })
    test( "when \"foo\", is parsed it returns 'foo'", ()=>{
        const p = new BibParse( "\"foo\",")
        const s = p.string()
        expect(s).toEqual("foo")
        expect(p.offset).toEqual(5)
    })
    test( "when {foo}, is parsed it returns 'foo'", ()=>{
        const p = new BibParse( "{foo},")
        const s = p.string()
        expect(s).toEqual("foo")
        expect(p.offset).toEqual(5)
    })
})

describe( 'keyValueList()', ()=>{
    test( 'when a kvl is parsed: return it as a datastructure', ()=>{
        const p = new BibParse( 'foo= {gold}, bar=silver, baz = "copper"  } ' )
        const r = p.keyValueList()
        expect(r).toStrictEqual(  { foo:"gold",bar:"silver",baz:"copper"} )
        expect(p.offset).toEqual(41)
    })
    test( 'when a kvl has a last , on the end: return it as a normal', ()=>{
        const p = new BibParse( 'foo= {gold}, bar=silver, baz = "copper",  } ' )
        const r = p.keyValueList()
        expect(r).toStrictEqual(  { foo:"gold",bar:"silver",baz:"copper"} )
        expect(p.offset).toEqual(42)
    })
    test( 'when a kvl has an ID at the front: place that in the _id property', ()=>{
        const p = new BibParse( 'my:id, foo= {gold}, bar=silver, baz = "copper",  } ' )
        const r = p.keyValueList()
        expect(r).toStrictEqual(  { _id:"my:id", foo:"gold",bar:"silver",baz:"copper"} )
        expect(p.offset).toEqual(49)
    })
})