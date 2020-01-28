from django.db import models
from django.contrib.auth.models import User
from django.db import connection


class Value(models.Model):
    value = models.CharField(max_length=50, verbose_name='Значение')

    class Meta:
        verbose_name = 'Значение'
        verbose_name_plural = 'Значения'

    def __str__(self):
        return self.value


class Word(models.Model):
    word = models.CharField(max_length=70, verbose_name='Слово')
    value = models.ManyToManyField(Value, through='WordValue')

    def __str__(self):
        return self.word

    class Meta:
        verbose_name = 'Слово'
        verbose_name_plural = 'Слова'


class WordManager(models.Manager):

    def getDictionary(self, cursor):
        description = cursor.description
        columns = [col[0] for col in description]
        rows = [row for row in cursor.fetchall()]
        return [dict(zip(columns, row)) for row in rows]

    def all(self, card):
        sql = '''select 
               DISTINCT words_wordvalue.word_id as id,
               words_word.word
               from words_cardwordvalue
               inner join words_wordvalue
               on words_wordvalue.id = words_cardwordvalue.wordValue_id AND
               words_cardwordvalue.card_id = %s
               inner join words_word
               on words_wordvalue.word_id = words_word.id
               '''
        cursor = connection.cursor()
        cursor.execute(sql, [card.id])
        return self.getDictionary(cursor)


class WordValue(models.Model):
    word = models.ForeignKey(
        Word, on_delete=models.CASCADE, verbose_name='Слово')
    value = models.ForeignKey(
        Value, on_delete=models.CASCADE, verbose_name='Значение')
    scores = models.IntegerField()
    words = WordManager()

    class Meta:
        verbose_name = 'Слово со значением'
        verbose_name_plural = 'Слова со значением'

    def __str__(self):
        return self.word.word + ' - ' + self.value.value


class Card(models.Model):
    user = models.ForeignKey(
        User, on_delete=models.DO_NOTHING, verbose_name='Пользователь')
    phrase = models.CharField(max_length=100, verbose_name='Фраза')
    wordValue = models.ManyToManyField(
        WordValue, verbose_name='Слово', through='CardWordValue')
    media = models.FileField(upload_to='examples/', verbose_name='Пример')
    scores = models.IntegerField()

    def increment(self):
        cardWordValues = CardWordValue.objects.filter(card=self)
        for cardWordValue in cardWordValues:
            wordValue = cardWordValue.wordValue
            wordValue.scores = wordValue.scores + 1
            wordValue.save()
            self.scores += 1
        self.save()

    class Meta:
        verbose_name = 'Карточка'
        verbose_name_plural = 'Карточки'

    def __str__(self):
        return self.phrase


class CardWordValue(models.Model):
    card = models.ForeignKey(Card, on_delete=models.DO_NOTHING)
    wordValue = models.ForeignKey(WordValue, on_delete=models.DO_NOTHING)

    def __str__(self):
        return self.wordValue.word.word + ' - ' + self.wordValue.value.value

    class Meta:
        verbose_name = 'Слово со значением'
        verbose_name_plural = 'Слова со значением'
