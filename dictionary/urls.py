from django.contrib import admin
from django.urls import path
from words.views import auth, WordsView, CardsView
from django.conf.urls import url

urlpatterns = [
    path('admin/', admin.site.urls),
    path('auth/', auth),
    path('cards/', CardsView.as_view()),
     url(r'^card/(\d*)/words/$',WordsView.as_view()),
]
