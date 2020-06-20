var cors = require("cors");
var express = require("express");
var app = express();
var multer = require("multer");
const upload = multer({dest: "uploads/"});
var fs = require("fs");

class SentenceStorgae {
    idSentencesIncrement = 0;
    idWordsIncrement = 0;

    sentences = [];
    words = [];

    constructor() {
        let fileContent = fs.readFileSync("sentences.json", "utf8");
        this.sentences = JSON.parse(fileContent);
        fileContent = fs.readFileSync("words.json", "utf8");
        this.words = JSON.parse(fileContent);
    }

    _bindSentenceToWord(stringOfword, objectOfSentence) {
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

    insert(stringOfSentence, fileName) {
        let objectOfSentence = {
            id: this.idSentencesIncrement++,
            sentence: stringOfSentence,
            fileName: fileName,
            scores: 0
        };
        this.sentences.push(objectOfSentence); // 
        let stringsOfwords = stringOfSentence.split(" "); // делим фразу на массив из слов

        let objectOfWord = null;
        stringsOfwords.forEach(stringOfWord => {
            // к каждому объекту word из массива words добавляем ссылку на sentence
            this._bindSentenceToWord(stringOfWord, objectOfSentence);
        });

        return objectOfSentence.id;
    }
    select(count) {
        this.sentences.sort((a, b) => {
            return a.scores - b.scores;
        })
        return this.sentences.slice(0, count);
    }

    getById(id) {
        let findingSentence = null;
        this.sentences.forEach(sentence => {
            if (sentence.id == id) {
                findingSentence = sentence;
            }
        })
        return findingSentence;
    }

    _progressForWord(stringOfWord) {
        this.words.forEach(word => {
            if (word.word === stringOfWord) {
                word.scores += 1;
                word.sentences.forEach(sentence => {
                    sentence.scores += 1;
                })
            }
        })
    }

    _decrementScores(word) {
        if (word.scores > 0) {
            word.scores -= 1;
        }
        word.sentences.forEach(sentence => {
            if (sentence.scores > 0) {
                sentence.scores -= 1;
            }
        });
    }

    _regressForWord(stringOfWord) {
        this.words.forEach(word => {
            if (word.word === stringOfWord) {
                this._decrementScores(word);
            }
        })
    }

    progress(id) {
        let objectOfSentence = this.getById(id);
        if (objectOfSentence !== null) {
            let words = objectOfSentence.sentence.split(" ");
            words.forEach(stringOfWord => {
                this._progressForWord(stringOfWord);
            });
            return true;
        } else {
            return false;
        }
    }

    regress(id) {
        let objectOfSentence = this.getById(id);
        if (objectOfSentence !== null) {
            let words = objectOfSentence.sentence.split(" ");
            words.forEach(stringOfWord => {
                this._regressForWord(stringOfWord);
            });
            return true;
        } else {
            return false;
        }
    }
}

let storage = new SentenceStorgae();


const corsOptions = {
    origin: "*", // домен сервиса, с которого будут приниматься запросы
    optionsSuccessStatus: 200, // для старых браузеров
};

app.use(cors(corsOptions));
app.use(express.json())
app.use(express.urlencoded({extended: false}))

app.post('/sentence', upload.single('example'), function (req, res) {
    console.log(req.file);
    console.log(req.body.sentence);
    //let id = storage.insert(req.body.sentence, req.body.example);
    res.status(201);
  //  res.setHeader("Location", "/sentence/" + id)
    res.end();
})

app.post('/progress/:id', function (req, res) {
    let result = storage.progress(req.params.id)
    if (result) {
        res.status(201);
    } else {
        res.status(404);
    }
    res.setHeader("Location", "/sentence/" + req.params.id)
    res.end();
})

app.get("/example/:id", function (req, res) {
    res.sendFile("examples/" + req.params.id, { root: __dirname });
});

app.post('/regress/:id', function (req, res) {
    if (storage.regress(req.params.id)) {
        res.status(201);
    } else {
        res.status(404);
    }
    res.status(201);
    res.setHeader("Location", "/sentence/" + req.params.id)
    res.end();
})

app.get('/training/:count', function (req, res) {
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(storage.select(req.params.count)));
})

app.get('/sentence/:id', function (req, res) {
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
    res.setHeader("Pragma", "no-cache");
    let sentence = storage.getById(req.params.id);
    if (sentence === null) {
        res.status(404);
        res.end();
    } else {
        res.status(200);
        res.end(JSON.stringify(sentence));
    }
})

process.on('SIGINT', function () {
    console.log("Caught interrupt signal");
    fs.writeFileSync("sentences.json", JSON.stringify(storage.sentences));
    fs.writeFileSync("words.json", JSON.stringify(storage.words));
    process.exit();
});

app.listen(3000, function () {
    console.log("Example app listening on port 3000!");
});


module.exports.SentenceStorgae = SentenceStorgae;