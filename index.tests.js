let app = require("./index.js");

it("should insert sentence 'the war was lost'", function () {
    let storage = new app.SentenceStorgae();
    storage.insert("the war was lost");
    var result = storage.getById(0).sentence;;
    var expectedResult = "the war was lost";
    if (result !== expectedResult) {
        throw new Error(`Expected ${expectedResult}, but got ${result}`);
    }
});

it("should select sentence 'the war was lost'", function () {
    let storage = new app.SentenceStorgae();
    storage.insert("the war was lost");
    storage.insert("I like apples");

    var result = storage.select(2)[0].sentence;
    var expectedResult = "the war was lost";
    var result2 = storage.select(2)[1].sentence;
    var expectedResult2 = "I like apples";

    if (result !== expectedResult) {
        throw new Error(`Expected ${expectedResult}, but got ${result}`);
    }
    if (result2 !== expectedResult2) {
        throw new Error(`Expected ${expectedResult2}, but got ${result2}`);
    }
});