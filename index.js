var cors = require("cors");
var express = require("express");
const { endianness } = require("os");
var app = express();


class SentenceStorgae {
    constructor() {
        this.idSentencesIncrement = 0;
        this.idWordsIncrement = 0;
        this.sentences = [];
        this.words = [];
    }

    bindSentenceToWord(stringOfword, objectOfSentence) {
        let binded = false;
        this.words.forEach(objectOfWord => {
            if (objectOfWord.word === stringOfword) {
                objectOfSentence.scores += objectOfWord.scores;
                objectOfWord.sentences.push(objectOfSentence);
                binded = true;
            }
        })
        if (!binded) {
            this.words.push({
                id: this.idWordsIncrement++,
                word: stringOfword,
                sentences: [objectOfSentence],
                scores: 0,
            })
        }
    }

    insert(stringOfSentence) {
        debugger;
        let objectOfSentence = {
            id: this.idSentencesIncrement++,
            sentence: stringOfSentence,
            scores: 0
        };
        this.sentences.push(objectOfSentence); // 
        let stringsOfwords = stringOfSentence.split(" "); // делим фразу на массив из слов

        let objectOfWord = null;
        stringsOfwords.forEach(stringOfWord => {
            this.bindSentenceToWord(stringOfWord, objectOfSentence); // к каждому объекту word из массива words добавляем ссылку на sentence
        });
    }
    select(count) {
        this.sentences.sort((a, b) => {
            return a.scores - b.scores;
        })
        return this.sentences.slice(0,count);
    }
}

let storage = new SentenceStorgae();
const corsOptions = {
    origin: "*", // домен сервиса, с которого будут приниматься запросы
    optionsSuccessStatus: 200, // для старых браузеров
};
app.use(cors(corsOptions));
app.use(express.json()); // для парсинга application/json

app.post('/sentence', function (req, res) {
    
    storage.insert(req.body.sentence);
    res.status(200);
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.end(JSON.stringify([{ status: "ok" }]));
})

app.get('/', function(req, res){
    res.end(JSON.stringify(storage.sentences));
})

app.listen(3000, function () {
console.log("Example app listening on port 3000!");
 });