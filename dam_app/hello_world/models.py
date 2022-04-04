from django.db import models

# Create your models here.

class User(models.Model):
  first_name = models.CharField(max_length=30)
  last_name = models.CharField(max_length=30)
  class Meta:
    ordering = ["first_name", "last_name"]
    verbose_name_plural = "Users"
    app_label = 'hello_world'
