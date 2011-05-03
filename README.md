# Grouperfish REST

REST service frontend to [grouperfish](http://github.com/michaelku/grouperfish) in node.js.


### Notes on setup
This will eventually be available from [npm](https://github.com/isaacs/npm). In the meantime:

    > # get package
    > git clone https://github.com/michaelku/grouper-rest
    > # install dependencies
    > sudo npm install ./grouper-rest


#### HBase
Minimum required HBase version is 0.90.1.

When setting up against [hbase 0.90.1][CDH3 b4], make sure that HBase Rest works, because there is a [bug][DISTRO-106] with missing jars.
You need to provide them, e.g. from local maven repository like this:

    > cp -v \
    .m2/repository/asm/asm/3.3/asm-3.3.jar \
    .m2/repository/org/codehaus/jackson/jackson-jaxrs/1.5.5/*.jar \
    .m2/repository/org/codehaus/jackson/jackson-core-asl/1.6.1/*.jar \
    .m2/repository/com/sun/xml/bind/jaxb-impl/2.1.12/*.jar \
    $HBASE_HOME/lib

If you do not set `$GROUPERFISH_HOME`, the service process will look for 
configuration defaults in `$(pwd)../../conf/`:


#### Configuration

* `grouperfish.json`: Your configuration (if not using `--config FILE`)
* `defaults.json`: Factory settings. Used as a fallback for settings not specified in `grouperfish.json`.

[CDH3 b4]: http://archive.cloudera.com/cdh/3/hbase-0.90.1-CDH3B4/
[DISTRO-106]: https://issues.cloudera.org/browse/DISTRO-106
[quip]:https://github.com/caolan/quip


### Running Tests

Get [coffee-script][0] and [expresso][1] to run the tests (included in the
`devDependencies`)

* Compile to JS
    > coffee -o test_js -c test

* Run the unit and integration tests
    > expresso -I lib test_js/{unit,integration}/*.js

Do *not* try to use the `--serial` option (that does not work with `beforeExit`, which is needed to make sure that callbacks have been executed).

[0]: http://jashkenas.github.com/coffee-script/
[1]: https://github.com/visionmedia/expresso


### Running the Service

    ./bin/grouperfish run CONFIG


### Organization

Tests are broken down into unit tests and integration tests.
Unit tests should check that all the individual modules we have work correctly by themselves.
Integration tests should check that the service provides all the required features, and responds without failing too hard.
This separation is inspired by a [blog post on TDD][2].

So far this is incomplete (something like 70%), but we aim for 100% coverage (in total), plus 100% coverage of non-server modules from unit-tests alone.

[2]: [http://www.debuggable.com/posts/test-driven-development-at-transloadit:4cc892a7-b9fc-4d65-bb0c-1b27cbdd56cb]


### How can I use it?
While this is not going to be very useful yet, you can start the REST service using:

    > node bin/run-grouper-rest

There is a mock service. Use it to develop and test clients without running hbase.

    > node bin/run-mock


### Code Style

Node.JS contributor [Felix Geisendörfer](http://twitter.com/felixge) has put together a comprehensive [JavaScript code style](http://nodeguide.com/style.html). It reflects common best practices fairly well and is very much compatible with the [Mozilla Style Guide](https://developer.mozilla.org/en/Mozilla_Coding_Style_Guide), but more detailed. It is the code style used for JavaScript in this project. Several additional rules of the thumb:

* Define all methods in their classes’ constructor and use captured local variables as fields.
* Use a captured `var self` reference rather than `this` from within methods, to allow for callbacks without `bind`.
* Name methods like this: `this.f = function f_() {}`. This helps to identify a function in tracebacks without overwriting local variables (those do not get the underscore).
* Use RAII (*resource acquisition is initialization*): Always work with fully configured objects. If initialization depends on an event, start with a Factory object or function and receive the fully configured object in a callback.
* Similarly, use immutable objects whenever feasible.
* Node-specific: Do not block by building large strings in memory. Use [streaming APIs](https://github.com/michaelku/json-builder) instead.

The documentation comments are in [Closure Compiler JSDoc Syntax](http://code.google.com/closure/compiler/docs/js-for-compiler.html#types). This is a bit different from other JSDoc comment styles, but can be checked for type safety using the closure compiler tools. 


### Copyright and License

The copyright of the original source code is with the [Mozilla Corporation](http://www.mozilla.com/), Mountain View, CA. The code *Open Source*, licensed under the [Mozilla Public License](http://www.mozilla.org/MPL/).
