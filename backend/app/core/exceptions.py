from fastapi import Request
from fastapi.responses import JSONResponse
from app.core.logging import get_logger

logger = get_logger("exceptions")


class AppError(Exception):
    def __init__(self, message: str, status_code: int = 500, detail: dict | None = None):
        self.message = message
        self.status_code = status_code
        self.detail = detail or {}
        super().__init__(self.message)


class NotFoundError(AppError):
    def __init__(self, resource: str, resource_id: str):
        super().__init__(message=f"{resource} not found: {resource_id}", status_code=404)


class ValidationError(AppError):
    def __init__(self, message: str):
        super().__init__(message=message, status_code=422)


class ExternalServiceError(AppError):
    def __init__(self, service: str, message: str):
        super().__init__(message=f"{service} error: {message}", status_code=502)


async def app_error_handler(request: Request, exc: AppError) -> JSONResponse:
    logger.error("app_error", message=exc.message, status_code=exc.status_code, path=str(request.url))
    return JSONResponse(
        status_code=exc.status_code,
        content={"error": exc.message, "detail": exc.detail},
    )
