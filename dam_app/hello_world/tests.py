from django.http import HttpRequest, HttpResponse
from django.test import TestCase
from django.test import Client
from hello_world import views
from django.core.serializers import serialize
from hello_world import models

# Create your tests here.

# `python ./manage.py test`

class TestTestCase(TestCase):
  def setUp(self):
    self.c = Client()
  
  def test_test_view(self):
    """Always returns HttpResponse"""
    response = self.c.get('/test/')
    self.assertEqual(response.status_code, 200)
    self.assertEqual(response.content.decode('ascii'), "Hello World")
    
    # print(response.content)
    
  def test_create_user(self):
    """Calling create should create a user"""
  
    response = self.c.post('/create/')
    
    self.assertEqual(response.status_code, 201)
    
    user = models.User.objects.get(id=1)
    
    self.assertEqual(user.first_name, "John")
    self.assertEqual(user.last_name, "Smith")
    
  def test_get_user(self):
    """Calling get id should return a user"""
  
    # Create test User 
    
    user = models.User()
    user.first_name = "John"
    user.last_name = "Smith"
    
    user.save()
    
    response = self.c.get('/users/1/')
    
    self.assertEqual(response.status_code, 200)
    
    user = models.User.objects.get(id=1)
    
    self.assertEqual(serialize("json", [user], fields=('first_name', 'last_name')), response.content.decode('ascii'))
    