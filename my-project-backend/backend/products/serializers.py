import json
from rest_framework import serializers
from .models import Product


class ProductSerializer(serializers.ModelSerializer):
    category = serializers.JSONField()
    description = serializers.JSONField()

    def validate_category(self, value):
        
        if isinstance(value, (list, dict)):
            return value
        
        
        try:
            return json.loads(value)
        except Exception:
            raise serializers.ValidationError("Category must be valid JSON")

    def validate_description(self, value):
        if isinstance(value, (list, dict)):
            return value
        
        try:
            return json.loads(value)
        except Exception:
            raise serializers.ValidationError("Description must be valid JSON")

    class Meta:
        model = Product
        fields = "__all__"
