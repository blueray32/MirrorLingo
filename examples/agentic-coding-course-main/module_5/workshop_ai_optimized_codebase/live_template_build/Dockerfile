# syntax=docker/dockerfile:1

# ============================================================================
# Build stage: Install dependencies and build the application
# ============================================================================
FROM python:3.12-slim AS builder

# Copy uv from official image for fast, reliable package management
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

# Set working directory
WORKDIR /app

# Copy dependency files first for better layer caching
# This layer only rebuilds when dependencies change
COPY pyproject.toml uv.lock ./

# Install dependencies only (not the project itself) with cache mount
# This allows Docker to cache the dependency layer separately
RUN --mount=type=cache,target=/root/.cache/uv \
    uv sync --frozen --no-install-project --no-dev

# Copy the entire project
COPY . .

# Install the project in non-editable mode for production
# This creates a proper distribution without source dependencies
RUN --mount=type=cache,target=/root/.cache/uv \
    uv sync --frozen --no-editable --no-dev

# ============================================================================
# Runtime stage: Minimal image with only necessary components
# ============================================================================
FROM python:3.12-slim

# Set working directory
WORKDIR /app

# Copy only the virtual environment from builder
# This excludes source code and build artifacts, keeping the image small
COPY --from=builder /app/.venv /app/.venv

# Copy application code
COPY --from=builder /app /app

# Activate virtual environment by adding it to PATH
# This ensures all Python commands use the venv
ENV PATH="/app/.venv/bin:$PATH"

# Set Python to run in unbuffered mode for better logging in containers
ENV PYTHONUNBUFFERED=1

# Expose port for the application (if needed)
EXPOSE 8123

# Set the default command to run the application
# Using python -m ensures proper module resolution
CMD ["python", "-m", "app.main"]
