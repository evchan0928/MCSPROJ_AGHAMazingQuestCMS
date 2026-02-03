from rest_framework.permissions import BasePermission


def user_in_group(user, name):
    return user.groups.filter(name=name).exists()


class IsContentWorkflowAllowed(BasePermission):
    """Map DRF view actions to roles:

    Roles (user groups):
      - Encoder: upload/create content
      - Editor: upload & edit content
      - Approver: approve & publish
      - Admin: delete
      - Super Admin: full access (superuser)

    This permission class expects a ViewSet with `action` set (DRF does this).
    """

    def has_permission(self, request, view):
        user = request.user
        if not user or not user.is_authenticated:
            return False
        if user.is_superuser:
            return True

        action = getattr(view, 'action', None)
        # map actions according to strict roles:
        # Encoder -> create (upload)
        # Editor -> create, update/partial_update, send_for_approval
        # Approver -> approve, publish, deny
        # Admin -> destroy
        # list/retrieve allowed to any role that needs to view content lists
        if action in ('list', 'retrieve'):
            return (
                user_in_group(user, 'Encoder') or
                user_in_group(user, 'Editor') or
                user_in_group(user, 'Approver') or
                user_in_group(user, 'Admin')
            )
        if action in ('create',):
            return user_in_group(user, 'Encoder') or user_in_group(user, 'Editor')
        if action in ('update', 'partial_update'):
            return user_in_group(user, 'Editor')
        if action in ('send_for_approval',):
            return user_in_group(user, 'Editor')
        if action in ('approve', 'publish', 'deny'):
            return user_in_group(user, 'Approver')
        if action in ('destroy',):
            return user_in_group(user, 'Admin')

        # default deny
        return False

    def has_object_permission(self, request, view, obj):
        # same as has_permission for our simple case; could be extended for ownership
        return self.has_permission(request, view)
