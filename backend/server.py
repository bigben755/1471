"""1471 API entrypoint.

The original monolithic API is preserved in ``server_legacy`` while new feature
routers are split into focused modules.  Keeping this file as the stable
entrypoint means the existing deployment command (``server:app``) does not
change.
"""

try:  # Package import (e.g. backend.server)
    from .server_legacy import *  # noqa: F401,F403
    from .recruitment_flow import recruitment_router
except ImportError:  # Script/workdir import (e.g. uvicorn server:app)
    from server_legacy import *  # noqa: F401,F403
    from recruitment_flow import recruitment_router

# ``app`` is exported by server_legacy.
app.include_router(recruitment_router)
