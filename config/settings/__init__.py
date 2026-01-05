"""Expose base settings as the default settings module.

This file allows `DJANGO_SETTINGS_MODULE='config.settings'` to work and
keeps the main settings in `base.py`.
"""
from .base import *  # noqa: F401,F403
