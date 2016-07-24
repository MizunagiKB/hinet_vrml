// Type definitions for Hogan.js 3.0.2
// Project: https://github.com/twitter/hogan.js
// Definitions by: MizunagiKB <mizukb@live.jp>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped

declare module Hogan {

    interface compileOptions_sectionTags {
        o: string;
        c: string;
    }

    interface compileOptions {
        asString: boolean;
        disableLambda: boolean;
        delimiters: string;
        modelGet: boolean;
        sectionTags: Array<compileOptions_sectionTags>;
    }

    class scanTokens {
        tag: string;
        text: string;
    }

    class parseTree {

    }

    class template {
        buf: string;
        options: compileOptions;
        text: string;
        render(context?: Object, partials?: any, indent?: any): string;
    }

    function scan(text: string, delimiters?: string): Array<scanTokens>;
    function parse(tokens: Array<scanTokens>, text?: string, options?: compileOptions): parseTree;

    // Returns a string or template is correct.
    // * options.asString = true ... string
    // * options.asString = false ... object
    function generate(tree: parseTree, text: string, options?: compileOptions): template;

    function cacheKey(text: string, options?: compileOptions): string;

    // Returns a string or template is correct.
    function compile(text: string, options?: compileOptions): template;
}
