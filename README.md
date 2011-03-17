Grouperfish REST
================

REST service frontend to [grouperfish](http://github.com/michaelku/grouperfish) in node.js.


Nodes on setup
--------------
- This package relies on unreleased versions of quip and node-hbase.
- When setting up against CDH3b4, make sure hbase rest works
  https://issues.cloudera.org/browse/DISTRO-106
  add these missing jars, e.g. from local maven like this
  > cp -v \
    .m2/repository/asm/asm/3.3/asm-3.3.jar \
    .m2/repository/org/codehaus/jackson/jackson-jaxrs/1.5.5/*.jar \
    .m2/repository/org/codehaus/jackson/jackson-core-asl/1.6.1/*.jar \
    .m2/repository/com/sun/xml/bind/jaxb-impl/2.1.12/*.jar \
  $HBASE_HOME/lib
  

How can I use it?
-----------------
You can't yet (this is just a dummy server so far). But hey, let's share the source from day 1!


Coding Style
------------

There is a [Mozilla Style Guide](https://developer.mozilla.org/en/Mozilla_Coding_Style_Guide) on MDN. This should be followed in general.

Also, the [npm](https://github.com/isaacs/npm) package has pretty insightful [guidelines](https://github.com/isaacs/npm/blob/master/doc/coding-style.md).  These are more detailed, but also unconventional. They do not clash with what  is on MDN too much, plus they exist. 

We probably want to use coffeescript and a Cakefile instead, like riak-js does  (for now we're trying that out with the unit tests).
