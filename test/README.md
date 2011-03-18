### How to run

Get [coffee-script][0] and [expresso][1] to run these tests:

* compile to JS
	coffee -o test_js -c test

* run the unit tests
  expresso -I lib -I test_js test_js/unit/*.js

* run the integration tests
	expresso -I lib -I test_js test_js/integration/*.js
	
Do not try to use the --serial option, as that does not work with beforeExit-checks (these check if callbacks have been executed).

[0]: http://jashkenas.github.com/coffee-script/
[1]: https://github.com/visionmedia/expresso


### Organization

Tests are broken down into unit tests and integration tests.
Unit tests should check that all the individual modules we have work correctly by themselves.
Integration tests should check that the service provides all the required features. 
This separation is inspired by a [blog post on TDD][2].

So far this is incomplete, but we are aiming for 100% coverage (in total), and for 100% coverage of non-server modules in unit-tests.

[2][http://www.debuggable.com/posts/test-driven-development-at-transloadit:4cc892a7-b9fc-4d65-bb0c-1b27cbdd56cb]
