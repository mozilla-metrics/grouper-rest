# disable 'testfish_clusters'; drop 'testfish_clusters';
# disable 'testfish_collections'; drop 'testfish_collections';
# disable 'testfish_documents'; drop 'testfish_documents';

module.exports =
  documents:
    "keats/mid/doc2":
      main:
        namespace: "keats", collection: "all", id: "doc1",
        text: "I would sooner fail than not be among the greatest."
        "membership:DEFAULT": {"1299353145": "fail"}
    "will/ere/x3":
      main:
        namespace: "will", collection: "ere", id: "x3",
        text: "thrice sun done salutation to the dawn"
        "membership:DEFAULT": {"1299173619": "salutation"}
    "will/mid/doc1":
      main:
        namespace: "will", collection: "mid", id: "doc1",
        text: "One man in his life plays many parts"
        "membership:DEFAULT": {"1299352272": "general"}
    "will/mid/doc2":
      main:
        namespace: "will", collection: "mid", id: "doc2",
        text: "Two be or not two be!"
        "membership:DEFAULT": {"1299352272": "macbeth"}
    "will/mid/doc3":
      main:
        namespace: "will", collection: "mid", id: "doc3",
        text: "When shall we three meet again?"
        "membership:DEFAULT": {"1299352272": "macbeth"}
    "will/mid/doc4":
      main:
        namespace: "will", collection: "mid", id: "doc4",
        text: "Is this a dagger which I see befour me?"
        "membership:DEFAULT": {"1299352272": "macbeth"}
    "will/mid/doc5":
      main:
        namespace: "will", collection: "mid", id: "doc5",
        text: "Double, double toil and trouble"
        "membership:DEFAULT": {"1299352272": "macbeth"}
    "will/mid/doc6":
      main:
        namespace: "will", collection: "mid", id: "doc6",
        text: "Friends, Romans, countrymen"
        "membership:DEFAULT": {"1299352272": "caesar"}
    "will/mid/doc7":
      main:
        namespace: "will", collection: "mid", id: "doc7",
        text: "lend me your ears"
        "membership:DEFAULT": {"1299352272": "caesar"}
    "will/tail/doc5":
      main:
        namespace: "will", collection: "tail", id: "doc5"
        text: "Double, double toil and trouble"
        "membership:DEFAULT": {"1242375913": "entailed"}
    "will/tail/doc74":
      main:
        namespace: "will", collection: "tail", id: "doc74"
        text: "Thrift, thrift, Horatio"
        "membership:DEFAULT": {"1242375913": "entailed"}

  collections:
    "keats/all":
      main:
        namespace: "keats"
        collection: "all",
        size: '1'
        modified: '1299353145'
        "configuration:DEFAULT:rebuilt": '1299353145'
      processing: {dictionary: "<opaque>"}
    "will/ere":
      main:
        namespace: "will",
        collection: "ere",
        size: '1'
        modified: '1299173619'
        "configuration:DEFAULT:rebuilt": '1299173619'
      processing: {dictionary: "<opaque>"}
    "will/mid":
      main:
        namespace: "will"
        collection: "mid"
        size: '7'
        modified: '1299352272'
        "configuration:DEFAULT:rebuilt": '1299352272'
      processing: {dictionary: "<opaque>"}
    "will/tail":
      main:
        namespace: "will"
        collection: "tail"
        size: '2'
        modified: '1242375913'
        "configuration:DEFAULT:rebuilt": '1242375913'
      processing: {dictionary: "<opaque>"}

  clusters:
    "DEFAULT/keats/all/1299353145/fail":
      main: {namespace: "keats", collection: "all", label: "fail"}
      documents: {"doc1": '0'}
    "DEFAULT/will/ere/1299352272/salutation":
      main: {namespace: "will", collection: "ere", label: "salutation"}
      documents: {"x3": '0'}
    "DEFAULT/will/mid/1299352272/general":
      main: {namespace: "will", collection: "mid", label: "general"}
      documents: {"doc1": '0.1', "doc2": '0.2'}
    "DEFAULT/will/mid/1299352272/macbeth":
      main: {namespace: "will", collection: "mid", label: "macbeth"}
      documents: {"doc3": '0.2', "doc4": '0.25', "doc5": '0.1'}
    "DEFAULT/will/mid/1299352272/caesar":
      main: {namespace: "will", collection: "mid", label: "caesar"}
      documents: {"doc6": '0.7', "doc7": '0.3'}
    "DEFAULT/will/tail/1299352272/1242375913":
      main: {namespace: "will", collection: "tail", label: "entailed"}
      documents: {"doc5": '0.2', "doc74": '0.25'}
