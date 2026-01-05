import os
import sys
from pathlib import Path

# Ensure project root is on sys.path so `config` is importable when running this script
ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
import django
django.setup()
from django.urls import get_resolver

def walk_patterns(patterns, prefix=''):
    out = []
    for p in patterns:
        try:
            pattern = getattr(p, 'pattern', None)
            regex = str(pattern)
        except Exception:
            regex = repr(p)
        if hasattr(p, 'url_patterns'):
            out.append(prefix + regex + ' -> include')
            out += walk_patterns(p.url_patterns, prefix=prefix + regex)
        else:
            name = getattr(p, 'name', '')
            callback = getattr(p, 'callback', None)
            cb = getattr(callback, '__name__', repr(callback))
            out.append(prefix + regex + ' -> ' + cb + ' name=' + str(name))
    return out

resolver = get_resolver()
for line in walk_patterns(resolver.url_patterns):
    print(line)
