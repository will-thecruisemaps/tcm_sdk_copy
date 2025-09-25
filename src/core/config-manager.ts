import { Config, NetworkConfig, ApiConfig } from "../types";

export class ConfigManager {
  private config: Config | null = null;

  constructor() {
    this.config = null;
  }

  public configure(config: Config): void {
    this.config = config;
  }

  public getConfig(): Config {
    if (!this.config) {
      throw new Error("TCG SDK not configured. Please call configure() first.");
    }
    return this.config;
  }

  public getEndpoints(): ApiConfig {
    const config = this.getConfig();
    return config.api;
  }

  public getNetworkConfig(): NetworkConfig {
    const config = this.getConfig();
    return config.network;
  }

  public getMapBoxKey(): string {
    return this.getConfig().auth.mapBoxKey;
  }

  public getCruiseMapsKey(): string {
    return this.getConfig().auth.cruiseMapsKey;
  }

  public getDefaultMapStyle(): string {
    return this.getConfig().mapDefaults.mapStyle;
  }

  public getDefaultZoomLevel(): number {
    return this.getConfig().mapDefaults.zoomLevel;
  }

  public getMapDefaults() {
    return this.getConfig().mapDefaults;
  }

  public getAvailableMapStyles(): string[] {
    return this.getConfig().availableMapStyles;
  }

  public addMapStyle(style: string): void {
    const config = this.getConfig();
    if (!config.availableMapStyles.includes(style)) {
      config.availableMapStyles.push(style);
    }
  }

  public isConfigured(): boolean {
    return this.config !== null;
  }
}
