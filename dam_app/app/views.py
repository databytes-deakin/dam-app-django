from asyncio.log import logger
from logging import DEBUG, WARNING, log
import re
from app.models import DAM
from django import http
from django.shortcuts import render
from django.http import HttpResponse
from django.views.decorators.http import require_http_methods
from django.core.serializers import serialize
import json

@require_http_methods(["GET"])
def home(request):
  return render(request, "home.html", {
    "app_name": "DAM - Dam Analysis and Monitoring"
  })

@require_http_methods(["POST"])
def reportError(request):
  body = request.body.decode('utf-8')

  data = json.loads(body)
  
  dam = DAM()
  dam.GEOJson = body
  
  dam.save()
  
  response = http.JsonResponse(data, content_type="application/json")
  response.status_code = 200;

  return response

@require_http_methods(["GET"])
def getDAMS(request):
  dams = DAM.objects.all()
  
  jsonResp = ','.join(map(lambda dam: dam.GEOJson, dams))
  
  response = http.HttpResponse(f"[{jsonResp}]", content_type="application/json")
  response.status_code = 200

  return response
