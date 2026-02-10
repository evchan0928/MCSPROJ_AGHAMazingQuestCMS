"""Lightweight placeholder middleware for API optimization.

These stubs satisfy import requirements for production deployments and
perform no-op behavior. Replace with real implementations if available.
"""
from typing import Callable


class APILoggerMiddleware:
    def __init__(self, get_response: Callable):
        self.get_response = get_response

    def __call__(self, request):
        # No-op logging placeholder
        return self.get_response(request)


class MobileAppOptimizationMiddleware:
    def __init__(self, get_response: Callable):
        self.get_response = get_response

    def __call__(self, request):
        # No-op optimization placeholder
        return self.get_response(request)


class APIResponseFormatterMiddleware:
    def __init__(self, get_response: Callable):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        # No-op formatting placeholder
        return response
