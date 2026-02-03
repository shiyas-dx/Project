from django.test import TestCase
from products.models import Product

class ProductModelTest(TestCase):

    def test_product_creation(self):
        product = Product.objects.create(
            name="Test Laptop",
            specs="Test Laptop i5 3050 IT",
            description={"details": "Test Laptop"},
            brand="TestBrand",
            category={"type": "Gmaing"},
            price=399999,
            rating=4.3,
            quantity=16,
            image="products/test.jpg"
        )

        self.assertEqual(product.name, "Test Laptop")
        self.assertEqual(product.brand, "TestBrand")
        self.assertEqual(product.price, 399999)
