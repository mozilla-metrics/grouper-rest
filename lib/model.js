var assert = require('assert');


/** @interface */
function Reference() {}

/** @return {?Function} Any model constructor related to this reference. */
Reference.prototype.model = function model() { assert.fail(); };


/**
 * @implements {Reference}
 *
 * @param {string} namespace Scope for this reference
 * @param {string} key Identifies collection within the namespace.
 */
function CollectionRef(namespace, key) {
  namespace && namespace.length || assert.fail();
  key && key.length || assert.fail();

  this.key = function key() { return key; };
  this.namespace = function namespace() { return namespace; };
  this.model = function model() { return null; };
}


/**
 * @implements {Reference}
 *
 * @param {!Object} ownerRef Identifies the collection of the document.
 * @param {string} id The collection-wide unique document ID.
 *
 * @return {!Object} A reference to a specific document.
 */
function DocumentRef(ownerRef, id) {
  ownerRef && (ownerRef instanceof CollectionRef) || assert.fail();
  id && id.length || assert.fail();

  this.ownerRef = function ownerRef() { return ownerRef; };
  this.id = function id() { return key; };
  this.model = function model() { return Document; };
}


/**
 * @implements {Reference}
 *
 * @param {!Object} ownerRef The collection to get cluster(s) for.
 * @param {?(number|string)} timestamp The timestamp of the full rebuild to use.
 *                                     If null, clients should lookup the
 *                                     latest rebuild.
 * @param {?string} label The label/topic of the cluster.
 *                        To refer to all clusters of a collection, this can
 *                        be set to <tt>null</tt>.
 *
 * @param {?string="DEFAULT"} configuration The processing configuration that
 *                                          created this cluster.
 *
 * @return {!Object} A reference to a cluster
 */
function ClusterRef(ownerRef, timestamp, label, confName) {
  ownerRef && (ownerRef instanceof CollectionRef) || assert.fail();
  if (timestamp !== null) {
    timestamp = "" + timestamp;
    timestamp.length > 0 || assert.fail();
  }
  ((label === null) || label.length) || assert.fail();
  confName = confName || "DEFAULT";

  this.ownerRef = function ownerRef() { return ownerRef; };
  this.timestamp = function timestamp() { return timestamp; };
  this.label = function label() { return label; };
  this.confName = function confName() { return confName; };
  this.model = function model() { return null; };
}


/** @interface */
function Model() {}

/** @return {!Reference} A reference that identifies this model. */
Model.prototype.ref = function() { assert.fail(); };


/** @implements {Model} */
function Document(ref, text) {
  ref && ref instanceof DocumentRef || assert.fail();
  text && text.length || assert.fail();

  this.ref = function() { return ref; };
  this.text = function() { return text; };
}

/** @implements {Model} */
function Collection(ref, properties) {
  ref && ref instanceof DocumentRef || assert.fail();
  text && text.length || assert.fail();

  this.ref = function() { return ref; };
  this.text = function() { return text; };
}


var exports = module.exports = {
  Model: Model,
  Reference: Reference,
  CollectionRef: CollectionRef,
  DocumentRef: DocumentRef,
  ClusterRef: ClusterRef,
  Document: Document
};
