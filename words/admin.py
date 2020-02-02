from django.contrib import admin
from words.models import *

admin.site.register(Card)
admin.site.register(Word)
admin.site.register(WordsWithCard)

