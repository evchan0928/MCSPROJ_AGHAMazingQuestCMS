"""Expose base settings as the default settings module.

This file allows `DJANGO_SETTINGS_MODULE='config.settings'` to work and
keeps the main settings in `base.py`.
"""
import os
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables from .env file
BASE_DIR = Path(__file__).resolve().parent.parent
env_path = BASE_DIR.parent / '.env'
load_dotenv(dotenv_path=env_path)

from .base import *  # noqa: F401,F403