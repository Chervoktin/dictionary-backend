let app = require("./index.js");

it("should calculate scroes in new sentence", function () {
    let storage = new app.SentenceStorgae();
    let id = storage.insert("the war was lost");
    storage.progress(id);
    id = storage.insert("apple was good");
    let result = storage.getById(id).scores;
    let expectedResult = 1;
    if (result !== expectedResult) {
        throw new Error(`Expected ${expectedResult}, but got ${result}`);
    }
});

it("should insert sentence 'the war was lost and 'apple was good'", function () {
    let storage = new app.SentenceStorgae();
    let id = storage.insert("the war was lost");
    let id2 = storage.insert("apple was good");
    let result = storage.getById(id).sentence;
    let expectedResult = "the war was lost";
    
    if (result !== expectedResult) {
        throw new Error(`Expected ${expectedResult}, but got ${result}`);
    }
     
     result = storage.getById(id2).scores;
     expectedResult = 0;
    if (result !== expectedResult) {
        throw new Error(`Expected ${expectedResult}, but got ${result}`);
    }
});



it("should select sentence 'the war was lost' and 'i like apples", function () {
    let storage = new app.SentenceStorgae();
    let id = storage.insert("the war was lost");
    storage.insert("I like apples");
    
    storage.progress(id);

    let result = storage.select(2)[0].sentence;
    let expectedResult = "I like apples";
    let result2 = storage.select(2)[1].sentence;
    let expectedResult2 = "the war was lost";

    if (result !== expectedResult) {
        throw new Error(`Expected ${expectedResult}, but got ${result}`);
    }
    if (result2 !== expectedResult2) {
        throw new Error(`Expected ${expectedResult2}, but got ${result2}`);
    }
});

it("should calculate progress", function () {
    let storage = new app.SentenceStorgae();
    let id = storage.insert("the war was lost");
    storage.progress(id);
    let sentence = storage.getById(id);
    let expectedResult = 4;
    let result = sentence.scores;

    if (result !== expectedResult ) {
        throw new Error(`Expected ${expectedResult}, but got ${result}`);
    }
    
});

it("should calculate related from words scores", function () {
    let storage = new app.SentenceStorgae();
    let id = storage.insert("the war was lost");
    let id2 = storage.insert("apple was good");
    let sentence = storage.getById(id2);
    storage.progress(id);
   
    let expectedResult = 1;
    let result = sentence.scores;
    
    if (result !== expectedResult ) {
        throw new Error(`Expected ${expectedResult}, but got ${result}`);
    }
    
});

it("should calculate regress", function () {
    let storage = new app.SentenceStorgae();
    let id = storage.insert("the war was lost");
    storage.progress(id);
    storage.progress(id);
    storage.regress(id);

    let result = storage.getById(id).scores;
    let expectedResult = 4;

    if (result !== expectedResult ) {
        throw new Error(`Expected ${expectedResult}, but got ${result}`);
    }
    
});

it("should decrement scores when scores = 0", function () {
    let storage = new app.SentenceStorgae();
    let id = storage.insert("the war was lost");
    storage.regress(id);

    let result = storage.getById(id).scores;
    let expectedResult = 0;

    if (result !== expectedResult ) {
        throw new Error(`Expected ${expectedResult}, but got ${result}`);
    }
    
});

it("should return null", function () {
    let storage = new app.SentenceStorgae();
    let id = storage.insert("the war was lost");
    let result = storage.getById(5);
    let expectedResult = null;

    if (result !== expectedResult ) {
        throw new Error(`Expected ${expectedResult}, but got ${result}`);
    }
    
});