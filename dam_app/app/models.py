from django.db import models

# Create your models here.

class DAM(models.Model):
  GEOJson = models.JSONField()
