import { ConfigManager } from "./config-manager";

export class NetworkError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = "NetworkError";
  }
}

export class RateLimitError extends NetworkError {
  constructor(message: string = "Rate limit exceeded") {
    super(message, 429);
    this.name = "RateLimitError";
  }
}

export class AuthenticationError extends NetworkError {
  constructor(message: string = "Invalid authentication key") {
    super(message, 401);
    this.name = "AuthenticationError";
  }
}

export async function fetchWithRetry(
  url: string,
  configManager: ConfigManager,
  options: RequestInit = {}
): Promise<Response> {
  const networkConfig = configManager.getNetworkConfig();
  const cruiseMapsKey = configManager.getCruiseMapsKey();

  const headers = {
    Authorization: `Bearer ${cruiseMapsKey}`,
    "Content-Type": "application/json",
    ...options.headers,
  };

  let lastError: Error = new NetworkError("Unknown network error");

  for (let attempt = 0; attempt < networkConfig.maxRetries; attempt++) {
    try {
      const response = await fetch(url, { ...options, headers });

      if (response.status === 429) {
        throw new RateLimitError();
      }

      if (response.status === 401 || response.status === 403) {
        throw new AuthenticationError();
      }

      if (!response.ok) {
        throw new NetworkError(
          `HTTP ${response.status}: ${response.statusText}`,
          response.status
        );
      }

      return response;
    } catch (error) {
      lastError = error as Error;

      // Don't retry on authentication or rate limit errors
      if (
        error instanceof AuthenticationError ||
        error instanceof RateLimitError
      ) {
        throw error;
      }

      // Exponential backoff: wait 1s, 2s, 4s...
      if (attempt < networkConfig.maxRetries - 1) {
        const delay = Math.pow(2, attempt) * 1000;
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
}
