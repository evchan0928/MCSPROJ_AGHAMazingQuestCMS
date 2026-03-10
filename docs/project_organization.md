# Project Organization

This document explains the structure and organization of the AGHAMazingQuestCMS project.

## Goals of Reorganization

1. Improve maintainability by grouping related files together
2. Enhance clarity with better documentation
3. Separate configuration from code
4. Provide clear pathways for common tasks

## Directory Structure Explanation

- `backend/` - Contains the Django backend application
- `frontend/` - Contains the React frontend application
- `docs/` - Contains documentation organized by topic
- `scripts/` - Contains utility scripts organized by purpose
- `config/` - Contains configuration files organized by environment
- `logs/` - Contains application logs

## Migration Notes

If you had existing configuration files in the root directory, they have been moved to `config/environments/` and replaced with symbolic links to maintain compatibility.

## Moving Forward

When adding new functionality:
1. Place documentation in the appropriate subdirectory of `docs/`
2. Place scripts in the appropriate subdirectory of `scripts/`
3. Place configuration files in the appropriate subdirectory of `config/`
