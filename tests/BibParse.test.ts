import {expectTypeOf, expect, beforeEach, test, describe} from 'vitest'
import {BibParse} from "../src/BibParse";

describe('name()', () => {

    test("when a name is parsed: return the name and move the offset forward", () => {
        let p = new BibParse("foo bar baz")
        let n = p.name()
        expect(n).toEqual("foo")
        expect(p.offset).toEqual(3)
    });

    test("when a name contains a hyphen: return the current name and move the offset forward", ()=>{
        let p = new BibParse("foo-bar baz")
        let n = p.name()
        expect(n).toEqual("foo-bar")
        expect(p.offset).toEqual(7)
    })

});

describe( 'whitespace()', ()=>{
    test( 'when an empty string is parsed for whitespace: nothing happens', ()=>{
        let p = new BibParse( '')
        p.whitespace()
        expect(p.offset).toEqual(0)
    })

    test( 'when whitespace() parses a string starting without whitespace: do nothing',()=>{
        let p = new BibParse( 'foo')
        p.whitespace()
        expect(p.offset).toEqual(0)
    })

    test( 'when whitespace() parses a string starting with whitespace: move the offset to the next non whitespace char',()=>{
        let p = new BibParse( '   foo')
        p.whitespace()
        expect(p.offset).toEqual(3)
    })
})

describe( 'string()', ()=>{
    test( "when foo, is parsed it returns 'foo'", ()=>{
      let p = new BibParse( "foo,")
      const s = p.string()
      expect(s).toEqual("foo")
      expect(p.offset).toEqual(3)
    })
    test( "when \"foo\", is parsed it returns 'foo'", ()=>{
        let p = new BibParse( "\"foo\",")
        const s = p.string()
        expect(s).toEqual("foo")
        expect(p.offset).toEqual(5)
    })
    test( "when {foo}, is parsed it returns 'foo'", ()=>{
        let p = new BibParse( "{foo},")
        const s = p.string()
        expect(s).toEqual("foo")
        expect(p.offset).toEqual(5)
    })
})

describe( 'keyValueList()', ()=>{
    test( 'when a kvl is parsed: return it as a datastructure', ()=>{
        let p = new BibParse( 'foo= {gold}, bar=silver, baz = "copper"  } ' )
        let r = p.keyValueList()
        expect(r).toStrictEqual(  { foo:"gold",bar:"silver",baz:"copper"} )
        expect(p.offset).toEqual(41)
    })
    test( 'when a kvl has a last , on the end: return it as a normal', ()=>{
        let p = new BibParse( 'foo= {gold}, bar=silver, baz = "copper",  } ' )
        let r = p.keyValueList()
        expect(r).toStrictEqual(  { foo:"gold",bar:"silver",baz:"copper"} )
        expect(p.offset).toEqual(42)
    })
    test( 'when a kvl has an ID at the front: place that in the _id property', ()=>{
        let p = new BibParse( 'my:id, foo= {gold}, bar=silver, baz = "copper",  } ' )
        let r = p.keyValueList()
        expect(r).toStrictEqual(  { _id:"my:id", foo:"gold",bar:"silver",baz:"copper"} )
        expect(p.offset).toEqual(49)
    })
})