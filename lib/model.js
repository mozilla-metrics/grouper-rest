var fail = require('assert').fail;


/** @interface */
function Reference() {}

/** @return {?Function} Any model constructor related to this reference. */
Reference.prototype.model = function model() { fail(); };


/**
 * @constructor
 * @implements {Reference}
 *
 * @param {string} namespace Scope for this reference
 * @param {string} key Identifies collection within the namespace.
 */
function CollectionRef(namespace, key) {
  namespace && namespace.length || fail();
  key && key.length || fail();

  this.key = function key_() { return key; };
  this.namespace = function namespace_() { return namespace; };
  this.model = function model_() { return null; };
  this.toJSON = function toJSON_() {
    return {namespace: namespace, key: key};
  };
}


/**
 * @constructor
 * @implements {Reference}
 *
 * @param {!Object} ownerRef Identifies the collection of the document.
 * @param {string} id The collection-wide unique document ID.
 *
 * @return {!Object} A reference to a specific document.
 */
function DocumentRef(ownerRef, id) {
  ownerRef instanceof CollectionRef || fail();
  id && id.length || fail();

  this.ownerRef = function ownerRef_() { return ownerRef; };
  this.id = function id_() { return id; };
  this.model = function model_() { return Document; };
  this.toJSON = function toJSON_() {
    return {owner: ownerRef.toJSON(), id: id};
  };
}


/**
 * @constructor
 * @implements {Reference}
 *
 * @param {!Object} ownerRef  The collection to get cluster(s) for.
 * @param {?(number|string)} timestamp  The time of the full rebuild to use.
 *                                      If null, clients should lookup the
 *                                      latest rebuild.
 * @param {?string} label  The label/topic of the cluster.
 *                         To refer to all clusters of a collection, this can
 *                         be set to <tt>null</tt>.
 *
 * @param {?string="DEFAULT"} confName  The processing configuration that
 *                                      created this cluster.
 *
 * @return {!Object} A reference to a cluster
 */
function ClusterRef(ownerRef, timestamp, label, confName) {
  ownerRef instanceof CollectionRef || fail();
  if (timestamp) {
    isNaN(parseInt(timestamp)) && fail();
    timestamp = "" + timestamp;
  }
  label = (label && label.length) ? label : null;
  confName = confName || "DEFAULT";

  this.ownerRef = function ownerRef_() { return ownerRef; };
  this.timestamp = function timestamp_() { return timestamp; };
  this.label = function label_() { return label; };
  this.confName = function confName_() { return confName; };
  this.model = function model_() { return null; };

  this.toJSON = function toJSON_() {
    return {owner: ownerRef.toJSON(), confName: confName,
            timestamp: timestamp, label: label};
  };
}


/**
 * @constructor
 * @abstract
 */
function Model() {}

/** @return {!Reference} A reference that identifies this model. */
Model.prototype.ref = function() { fail(); };

Model.prototype.toString = function toString_() {
  return '[' + this.constructor.name + ': ' + JSON.stringify(this) + ']';
};


/**
 * @constructor
 * @implements {Model}
 * @param {DocumentRef}
 * @param {string} text The actual content.
 */
function Document(ref, text) {
  ref instanceof DocumentRef || fail();
  text && text.length || fail();

  this.ref = function ref_() { return ref; };
  this.text = function text_() { return text; };
  this.toJSON = function toJSON_() {
    return {ref: ref.toJSON(), id: ref.id(), text: text};
  };
}

Document.prototype = new Model;
Document.prototype.constructor = Document;


/**
 * @constructor
 * @implements {Model}
 * @param {CollectionRef}
 * @param {Object.<string, number>} attributes  Some or all of the collection
 *                                              attributes. Not all need be set.
 */
function Collection(ref, attributes) {
  ref instanceof CollectionRef || fail();
  attributes instanceof Object || fail();
  for (var name in attributes) {
    attributes[name] = check(name, attributes[name]);
  }

  var self = this;

  this.ref = function() { return ref; };

  /**
   * @param {string}
   * @return {number}
   */
  this.get = function get_(name) {
    name in Collection.ATTRIBUTES || fail();
    if (!(name in attributes)) return null;
    return attributes[name];
  };

  /**
   * @param {string}
   * @param {number}
   * @return {Collection} self
   */
  this.set = function set_(name, value) {
    attributes[name] = check(name, value);
    return self;
  };

  this.toJSON = function toJSON_() {
    return {ref: ref.toJSON(), attributes: attributes};
  };

  function check(name, value) {
    name in Collection.ATTRIBUTES || fail();
    isNaN(parseInt(value)) && fail();
    return parseInt(value);
  }
}

Collection.prototype = new Model;
Collection.prototype.constructor = Collection;

Collection.ATTRIBUTES = {'size': 'size',
                         'rebuilt': 'rebuilt',
                         'modified': 'modified'};


module.exports = {
  Model: Model,
  Reference: Reference,
  CollectionRef: CollectionRef,
  DocumentRef: DocumentRef,
  ClusterRef: ClusterRef,
  Document: Document,
  Collection: Collection
};
