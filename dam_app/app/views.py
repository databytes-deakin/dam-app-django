from asyncio.log import logger
from logging import DEBUG, WARNING, log
import re
from django import http
from django.shortcuts import render
from django.http import HttpResponse
from django.views.decorators.http import require_http_methods
from app.models import User
from django.core.serializers import serialize

# Maps
import folium
import geemap.foliumap as geemap

@require_http_methods(["POST"])
def map(request):
  figure = folium.Figure()

  Map = geemap.Map(plugin_Draw = True,
                    Draw_export = True)

  Map.add_to(figure)

  log(WARNING, request.data);
  
  Map.addLayer()

  figure.render()
  return HttpResponse(figure);


@require_http_methods(["GET"])
def home(request):

  figure = folium.Figure()

  Map = geemap.Map(plugin_Draw = True,
                    Draw_export = True)

  Map.add_to(figure)

  Map.setOptions('SATELLITE')

  figure.render()

  return render(request, "home.html", {
    "app_name": "DAM - Dam Analysis and Monitoring",
    "map": figure
  })

template_name = 'map.html'
