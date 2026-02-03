from django.db import models

# Create your models here.


class Product(models.Model):
    name = models.CharField(max_length=255)
    specs = models.TextField()
    description = models.JSONField()
    brand = models.CharField(max_length=100)
    category = models.JSONField()
    price = models.IntegerField()
    rating = models.FloatField()
    quantity = models.IntegerField()
    image = models.ImageField(upload_to="products/")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

    class Meta:
        db_table = "account_product"  