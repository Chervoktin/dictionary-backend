from django.contrib import admin
from django.urls import path
from words.views import auth, getCards, getWords
from django.conf.urls import url

urlpatterns = [
    path('admin/', admin.site.urls),
    path('auth/', auth),
    path('cards/', getCards),
     url(r'^card/(\d*)/words/$',getWords),
]
