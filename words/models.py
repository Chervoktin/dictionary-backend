from django.db import models
from django.contrib.auth.models import User


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


class WordValue(models.Model):
    word = models.ForeignKey(
        Word, on_delete=models.CASCADE, verbose_name='Слово')
    value = models.ForeignKey(
        Value, on_delete=models.CASCADE, verbose_name='Значение')
    scores = models.IntegerField()


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
