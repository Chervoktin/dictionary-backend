from django.db import models
from django.contrib.auth.models import User
from django.db import connection


class PureSqlMixin():

    def execute(self, sql, params):
        cursor = connection.cursor()
        cursor.execute(sql, params)
        description = cursor.description
        columns = [col[0] for col in description]
        rows = [row for row in cursor.fetchall()]
        cursor.close()
        return [dict(zip(columns, row)) for row in rows]
        
class Word(models.Model):
    word = models.CharField(max_length=100)
    translations = models.ManyToManyField('Translation', through='WordWithTranslation')

    class Meta:
        verbose_name = 'Слово'
        verbose_name_plural = 'Слова'

class Translation(models.Model):
    translation = models.CharField(max_length=100)
    
    class Meta:
        verbose_name = 'Перевол'
        verbose_name = 'Переводы'

class WordWithTranslation(models.Model):
    word = models.ForeignKey('Word', on_delete=models.CASCADE)
    translation = models.ForeignKey('Translation', on_delete=models.CASCADE)
    scores = models.IntegerField(default=0)

class WordsWithCard(models.Model):
    card = models.ForeignKey('Card', on_delete=models.CASCADE)
    word = models.ForeignKey('Word', on_delete=models.CASCADE)


class Card(models.Model):
    user = models.ForeignKey(User, on_delete=models.DO_NOTHING)
    phrase = models.CharField(max_length=200)
    example = models.FileField(upload_to='examples/')
    scores = models.IntegerField(default=0)
    word = models.ManyToManyField('Word', through='WordsWithCard')
    

class TranslationForWordsWithCard(models.Model):
    wordWithCard = models.ForeignKey('WordsWithcard',on_delete=models.CASCADE)
    wordWithTranslation = models.ForeignKey('WordWithTranslation', on_delete=models.CASCADE)




