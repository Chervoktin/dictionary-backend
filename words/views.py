from django.shortcuts import render
from django.contrib.auth import authenticate
from django import forms
import jwt
from dictionary.settings import JWT_KEY
from django.http import JsonResponse, HttpResponse
from django.views.decorators.csrf import csrf_exempt
from words.models import *
from django.contrib.auth.models import User
from datetime import datetime, timedelta
from django.views.generic import View
from django.forms import ModelForm
from django.utils.decorators import method_decorator


class UserForm(forms.Form):
    username = forms.CharField(max_length=100)
    password = forms.CharField(max_length=100)


@csrf_exempt
def auth(request):
    if request.method == 'POST':
        userForm = UserForm(request.POST)
        if userForm.is_valid():
            user = authenticate(
                username=userForm.cleaned_data['username'], password=userForm.cleaned_data['password'])
            if user is not None:
                if user.is_active:
                    jwtStr = jwt.encode({'id': user.id,
                                         'time': str(datetime.now())
                                         }, JWT_KEY, algorithm='HS256')
                    return JsonResponse(
                        {'token': str(jwtStr.decode('utf-8'))}
                    )
                else:
                    return JsonResponse(None)
            else:
                return JsonResponse({'errorMessage': 'User not found'}, status=404)
        else:
            return JsonResponse(userForm.errors, status=400)


class JWTUser():

    def __init__(self, request):
        self.request = request

    def isExpired(self):
        delta = datetime.now() - self.time
        timeOfLife = timedelta(minutes=900)
        return delta > timeOfLife

    def isValid(self):
        try:
            encoded_jwt = self.request.META['HTTP_AUTHORIZATION']
            self.user_id = jwt.decode(
                encoded_jwt, JWT_KEY, algorithms=['HS256'])['id']
            self.time = jwt.decode(encoded_jwt, JWT_KEY,
                                   algorithms=['HS256'])['time']
            self.time = datetime.strptime(self.time, '%Y-%m-%d %H:%M:%S.%f')
            return True
        except:
            return False

    def getUser(self):
        return User.objects.get(id=self.user_id)


class JWTMixin():

    def dispatch(self, request, *args, **kwargs):
        self.jwtUser = JWTUser(request)
        if self.jwtUser.isValid():
            if not self.jwtUser.isExpired():
                return super().dispatch(request, *args, **kwargs)
            else:
                return JsonResponse({'error message': 'token expired'}, status=419)
        else:
            return JsonResponse({'error message': 'token invaild'}, status=403)

    def get_user(self):
        return self.jwtUser.getUser()


class CardForm(ModelForm):
    class Meta:
        model = Card
        exclude = ['user', 'scores', 'word']


@method_decorator(csrf_exempt, name='dispatch')
class CardView(JWTMixin, View):

    def post(self, request):
        cardForm = CardForm(request.POST, request.FILES)
        if cardForm.is_valid():
            card = cardForm.save(commit=False)
            card.user = self.get_user()
            card.save()
            return HttpResponse(status=201)
        else:
            return JsonResponse(cardForm.errors)

    def get(self, request):
        return HttpResponse("", status=404)


class WordForm(ModelForm):
    class Meta:
        model = Word
        exclude = ['translations']


@method_decorator(csrf_exempt, name='dispatch')
class CardWordView(JWTMixin, View):

    def post(self, request, card_id):
        wordForm = WordForm(request.POST)
        if wordForm.is_valid():
            word = wordForm.save()
            card = Card.objects.get(id=card_id)
            wordsWithCard = WordsWithCard(word=word, card=card)
            wordsWithCard.save()
            return HttpResponse(status=201)
        else:
            return HttpResponse(status=404)
