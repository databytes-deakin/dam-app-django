from asyncio.log import logger
from logging import DEBUG, WARNING, log
import re
from django import http
from django.shortcuts import render
from django.http import HttpResponse
from django.views.decorators.http import require_http_methods
from app.models import User
from django.core.serializers import serialize
import json
import ee
import geemap 

# Initialize GEE
ee.Initialize()

# Maps
import folium
import geemap.foliumap as geemap

figure = folium.Figure()

Map = geemap.Map(plugin_Draw = True,
                  Draw_export = True)

Map.add_to(figure)

Map.setOptions('ROADMAP')

cart_classifier = ee.FeatureCollection("users/arunetckumar/cart_classifier_3")
Sentinel2A = ee.ImageCollection("COPERNICUS/S2_SR")

classifier_string = cart_classifier.first().get('classifier')

classifier = ee.Classifier.decisionTree(classifier_string)

BANDS = ['B2', 'B3', 'B4', 'B8']

ic = Sentinel2A.filterDate('2016-07-01', '2020-12-01')
ic = ic.filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 15))
ic = ic.select(BANDS)
ic = ic.median()

# Create your views here.

@require_http_methods(["GET"])
def test_view(request):
  log(level=DEBUG, msg="Test Log")
  return http.HttpResponse("Hello World", content_type="text/plain")

@require_http_methods(["POST", "GET"])
def create_user(request):
  log(level=DEBUG, msg="Create User!")

  user = User()
  user.first_name = "John"
  user.last_name = "Smith"

  user.save()

  response = http.HttpResponse(user, content_type="text/plain")
  response.status_code = 201

  return response

@require_http_methods(["GET"])
def get_user(request, id):
  log(level=DEBUG, msg="Get User!")

  user = User.objects.get(id=id)

  response = http.HttpResponse(serialize("json", [user], fields=('first_name', 'last_name')), content_type="text/json")
  response.status_code = 200

  return response

@require_http_methods(["GET"])
def home(request):

  figure.render()

  return render(request, "home.html", {
    "app_name": "DAM - Dam Analysis and Monitoring",
    "map": figure
  })

template_name = 'map.html'


@require_http_methods(["POST", "GET"])
def processCoords(request):
  body = request.body.decode('utf-8')

  log(level=WARNING, msg=body)
  data = json.loads(body)

  classified = ic.classify(classifier)
  geometry = ee.FeatureCollection(
    [ee.Feature(
        ee.Geometry.Polygon(
                [[[145.13293074346188, -37.544687551922],
                  [145.1277809021533, -37.56088247544627],
                  [145.14099882817868, -37.563740037799825],
                  [145.14288710332517, -37.551764758135846]]]),
            {
              "system:index": "0"
            })])
  final = classified.clip(geometry)

  dem_vis = {
    'min': 0,
    'max': 4000,
    'palette' : [
      '0000FF', # Water
      '008000', # Veg
      'A52A2A' # Land
    ]
  }

  figure = folium.Figure()

  Map = geemap.Map(plugin_Draw = True,
                    Draw_export = True)

  Map.add_to(figure)

  Map.setOptions('ROADMAP')

  Map.addLayer(final, dem_vis, 'classification CART')

  figure.render()
  # return {"map": figure}
  return_obj = render(request, "home.html", {
    "app_name": "DAM - Dam Analysis and Monitoring",
    "map": figure
  })

  return_obj.status_code = 200
  
  return return_obj

  # return render(request, "home.html", {
  #   "app_name": "DAM - Dam Analysis and Monitoring",
  #   "map": figure
  # })

  # print (classified)
  # response = http.JsonResponse("", content_type="text/json", safe=False)
  # response.status_code = 200

  # return response
