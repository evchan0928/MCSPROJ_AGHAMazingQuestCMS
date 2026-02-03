# Example hook to customize Wagtail admin
from wagtail import hooks

@hooks.register('insert_global_admin_css')
def global_admin_css():
    return '<link rel="stylesheet" href="/static/css/custom-admin.css">'
