import { fetchWithRetry } from "../core/network";
import { ConfigManager } from "../core/config-manager";
import { Ship, FetchShipsOptions, FetchShipsResponse } from "../types";

export async function fetchShips(
  options: FetchShipsOptions,
  configManager: ConfigManager
): Promise<FetchShipsResponse> {
  //   const { offset, limit } = options;
  //     const endpoints = configManager.getEndpoints();

  //   const url = new URL(endpoints.shipsEndpoint);
  //   url.searchParams.set("skip", offset.toString());
  //   url.searchParams.set("limit", limit.toString());

  //   const response = await fetchWithRetry(url.toString(), configManager);
  //   const data: { total_ship_count: number; ships: Ship[] } =
  //     await response.json();

  //   console.log("Ships API response:", data);

  //   if (!data.ships) {
  //     throw new Error("Failed to fetch ships - no ships data in response");
  //   }

  //   return data.ships;

  // Return mock data instead of making API call
  const mockData: FetchShipsResponse = {
    total_ship_count: 518,
    ships: [
      {
        id: 2,
        name: "ADORA MEDITERRANEA",
        cruise_line: "Adora Cruises Carnival China",
        imo_number: 9237345,
        display_name: "ADORA MEDITERRANEA - Adora Cruises Carnival China",
        mmsi: 311001086,
      },
      {
        id: 8,
        name: "AIDADIVA",
        cruise_line: "AIDA Cruises",
        imo_number: 9334856,
        display_name: "AIDADIVA - AIDA Cruises",
        mmsi: 247187700,
      },
      {
        id: 505,
        name: "CELEBRITY ASCENT",
        cruise_line: "Celebrity Cruises",
        imo_number: 9838383,
        display_name: "CELEBRITY ASCENT - Celebrity Cruises",
        mmsi: 256191000,
      },
      {
        id: 513,
        name: "EXPEDITION C",
        cruise_line: "[yacht]",
        imo_number: null,
        display_name: "EXPEDITION C",
        mmsi: 378111899,
      },
      {
        id: 396,
        name: "MV WORLD ODYSSEY",
        cruise_line: "Semester at Sea",
        imo_number: 9141807,
        display_name: "MV WORLD ODYSSEY - Semester at Sea",
        mmsi: 311000410,
      },
      {
        id: 3,
        name: "COSTA ATLANTICA",
        cruise_line: "Adora Cruises Carnival China",
        imo_number: 9187796,
        display_name: "COSTA ATLANTICA - Adora Cruises Carnival China",
        mmsi: 311001063,
      },
      {
        id: 500,
        name: "SILVER RAY",
        cruise_line: "Silversea Cruises",
        imo_number: 9886225,
        display_name: "SILVER RAY - Silversea Cruises",
        mmsi: 311001496,
      },
      {
        id: 17,
        name: "ADMIRALTY DREAM",
        cruise_line: "Alaskan Dream Cruises",
        imo_number: 8963727,
        display_name: "ADMIRALTY DREAM - Alaskan Dream Cruises",
        mmsi: 367486470,
      },
      {
        id: 18,
        name: "ALASKAN DREAM",
        cruise_line: "Alaskan Dream Cruises",
        imo_number: 8978679,
        display_name: "ALASKAN DREAM - Alaskan Dream Cruises",
        mmsi: 367489250,
      },
      {
        id: 19,
        name: "BARANOF DREAM",
        cruise_line: "Alaskan Dream Cruises",
        imo_number: 8963715,
        display_name: "BARANOF DREAM - Alaskan Dream Cruises",
        mmsi: 367573580,
      },
    ],
  };

  console.log("Ships API response (mock):", mockData);

  return mockData;
}
