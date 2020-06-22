var cors = require("cors");
var express = require("express");
var app = express();
var multer = require("multer");
var fs = require("fs");
const { throws } = require("assert");

var str = multer.diskStorage({
    destination: function (req, file, cb) {
        let dir = 'examples/';
        fs.mkdir(dir, err => cb(err, dir));
    },
    filename: function (req, file, cb) {
        let ext = file.originalname.substring(file.originalname.lastIndexOf('.'), file.originalname.length);
        cb(null, Date.now() + ext);
    }
})

var upload = multer({ storage: str });

class SentenceStorgae {
    idSentencesIncrement = 0;
    idWordsIncrement = 0;

    sentences = [];
    words = [];

    constructor() {
        if (this.sentences.length === 0) {
            this.idSentencesIncrement = 0;
        } else {
            this.idSentencesIncrement = this.sentences[this.sentences.length - 1].id + 1;
        }

        if (this.words.length === 0) {
            this.idWordsIncrement = 0;
        } else {
            this.idWordsIncrement = this.words[this.words.length - 1].id + 1;
        }
    }

    _findWord(word) {
        let findingWord = null;
        this.words.forEach(element => {
            if (word === element.word) {
                findingWord = element;
            }
        })
        return findingWord;
    }

    insert(stringOfSentence, fileName, translation) {
        let objectOfSentence = {
            id: this.idSentencesIncrement++,
            sentence: stringOfSentence,
            fileName: fileName,
            translation: translation,
            scores: 0,
        };
        let stringsOfwords = stringOfSentence.split(" "); // делим фразу на массив из слов

        let objectOfWord = null;
        stringsOfwords.forEach(stringOfWord => {
            let word = this._findWord(stringOfWord);
            if (word === null) {
                this.words.push({
                    id: this.idWordsIncrement++,
                    word: stringOfWord,
                    scores: 0,
                })
            } else {
                objectOfSentence.scores += word.scores;
            }
        });
        this.sentences.push(objectOfSentence);
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

    _progressForWord(word) {
        this.sentences.forEach(sentence => {
            let words = sentence.sentence.split(" ");
            words.forEach(element => {
                let findingWord = this._findWord(element);
                if (findingWord.word === word) {
                    findingWord.scores += 1;
                    sentence.scores += 1;
                }
            })
        })
    }

    _regressForWord(word) {
        this.sentences.forEach(sentence => {
            let words = sentence.sentence.split(" ");
            words.forEach(element => {
                let findingWord = this._findWord(element);
                if (findingWord.word === word) {
                    findingWord.scores -= 1;
                    sentence.scores -= 1;
                }
            })
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
            if (objectOfSentence.scores > 0) {
                let words = objectOfSentence.sentence.split(" ");
                words.forEach(stringOfWord => {
                    this._regressForWord(stringOfWord);
                });
            }
            return true;
        } else {
            return false;
        }
    }
}



let storage = new SentenceStorgae();
if (fs.existsSync("sentences.json")) {
    let fileContent = fs.readFileSync("sentences.json", "utf8");
    storage.sentences = JSON.parse(fileContent);
    fileContent = fs.readFileSync("words.json", "utf8");
    storage.words = JSON.parse(fileContent);
}



const corsOptions = {
    origin: "*", // домен сервиса, с которого будут приниматься запросы
    optionsSuccessStatus: 200, // для старых браузеров
};

app.use(cors(corsOptions));
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

app.post('/sentence', upload.single('example'), function (req, res) {
    let id = storage.insert(req.body.sentence, req.file.filename);
    res.status(201);
    res.setHeader("Location", "/sentence/" + id)
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