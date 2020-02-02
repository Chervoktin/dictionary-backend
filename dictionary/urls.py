from django.contrib import admin
from django.urls import path
from words.views import *
from django.conf.urls import url

urlpatterns = [
    path('admin/', admin.site.urls),
    path('auth/', auth),
    url(r'^card/$',CardView.as_view()),
    url(r'^card/(\d*)/word/$', CardWordView.as_view()),
   # path('cards/', CardsView.as_view()),
   # url(r'^card/(\d*)/words/$',WordsView.as_view()),
   # url(r'^word/(\d*)/', WordView.as_view()),
   # url(r'^word/([a-z\'\s]*)/', WordViewFind.as_view()),
]
