let app = require("./index.js");

it("should insert sentence 'the war was lost'", function () {
    let storage = new app.SentenceStorgae();
    let id = storage.insert("the war was lost");
    let result = storage.getById(id).sentence;;
    let expectedResult = "the war was lost";
    if (result !== expectedResult) {
        throw new Error(`Expected ${expectedResult}, but got ${result}`);
    }
});

it("should select sentence 'the war was lost' and 'i like apples", function () {
    let storage = new app.SentenceStorgae();
    storage.insert("the war was lost");
    storage.insert("I like apples");

    let result = storage.select(2)[0].sentence;
    let expectedResult = "the war was lost";
    let result2 = storage.select(2)[1].sentence;
    let expectedResult2 = "I like apples";

    if (result !== expectedResult) {
        throw new Error(`Expected ${expectedResult}, but got ${result}`);
    }
    if (result2 !== expectedResult2) {
        throw new Error(`Expected ${expectedResult2}, but got ${result2}`);
    }
});