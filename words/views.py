from django.shortcuts import render
from django.contrib.auth import authenticate
from django import forms
import jwt
from dictionary.settings import JWT_KEY
from django.http import JsonResponse, HttpResponse
from django.views.decorators.csrf import csrf_exempt
from words.models import Card
from django.contrib.auth.models import User
from datetime import datetime, timedelta


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


@csrf_exempt
def getCards(request):
    try:
        encoded_jwt = request.META['HTTP_AUTHORIZATION']
        user_id = jwt.decode(encoded_jwt, JWT_KEY, algorithms=['HS256'])['id']
        time = jwt.decode(encoded_jwt, JWT_KEY, algorithms=['HS256'])['time']
        time = datetime.strptime(time, '%Y-%m-%d %H:%M:%S.%f')
        delta = datetime.now() - time
        timeOfLife = timedelta(minutes=1)
        if(delta > timeOfLife):
            return JsonResponse({'error message': 'token expired'}, status=403)
        else:
            return JsonResponse(list(Card.objects.filter(user_id=user_id).values()), safe=False)
    except:
        return JsonResponse({'error message': 'invaild token'}, status=403)
