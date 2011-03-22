# Grouperfish REST

REST service frontend to [grouperfish](http://github.com/michaelku/grouperfish) in node.js.

### Notes on setup
This will eventually be available from [npm](https://github.com/isaacs/npm). In the meantime:

    > # get package
    > git clone https://github.com/michaelku/grouper-rest
    > # install dependencies
    > sudo npm install ./grouper-rest

When setting up against [hbase 0.90.1][CDH3 b4], make sure hbase rest works, because there is a [bug][DISTRO-106] with missing jars.
You need to provide them, e.g. from local maven like this

    > cp -v \
    .m2/repository/asm/asm/3.3/asm-3.3.jar \
    .m2/repository/org/codehaus/jackson/jackson-jaxrs/1.5.5/*.jar \
    .m2/repository/org/codehaus/jackson/jackson-core-asl/1.6.1/*.jar \
    .m2/repository/com/sun/xml/bind/jaxb-impl/2.1.12/*.jar \
    $HBASE_HOME/lib

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

Do *not* try to use the `--serial` option! That does not work with `beforeExit`, which is needed to make sure that callbacks have been executed.

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


### Coding Style

There is a [Mozilla Style Guide](https://developer.mozilla.org/en/Mozilla_Coding_Style_Guide) on MDN. Should be followed in general.

Moreover, the [npm](https://github.com/isaacs/npm) package has pretty insightful [guidelines](https://github.com/isaacs/npm/blob/master/doc/coding-style.md).  These are more detailed, but also unconventional. They do not clash with what is on MDN too much, plus they exist. So they are used here.

Long term we probably want to use [CoffeeScript](http://jashkenas.github.com/coffee-script/) instead, which simplifies callbacks a lot. For only the tests do so.


### Copyright and License

The copyright of the original source code is with the [Mozilla Corporation](http://www.mozilla.com/), Mountain View, CA. The code *Open Source*, licensed under the [Mozilla Public License](http://www.mozilla.org/MPL/).
