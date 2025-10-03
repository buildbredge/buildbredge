import { supabase } from "../../lib/supabase";

export interface ServiceAreaRecord {
  id: string;
  country: string;
  city: string;
  area: string;
}

export type ServiceAreaMatchSource =
  | "city_area_exact"
  | "city_area_fallback"
  | "area_with_city"
  | "area_only"
  | "manual_selection"
  | "unknown";

export interface ServiceAreaMatchResult {
  serviceArea: ServiceAreaRecord;
  matchedBy: ServiceAreaMatchSource;
  matchedValue: string;
}

interface ServiceAreaMatchInput {
  country?: string;
  city?: string;
  state?: string;
  district?: string;
  address?: string;
  placeName?: string;
}

type CandidateSource =
  | "city"
  | "state"
  | "address_city"
  | "address_part"
  | "district"
  | "place_name"
  | "fallback";

interface AreaCandidate {
  raw: string;
  normalized: string;
  queryValue: string;
  source: CandidateSource;
}

const DEFAULT_COUNTRY = "New Zealand";

const normalizeForCompare = (value: string) =>
  value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-zA-Z0-9\s'-]/g, " ")
    .replace(/\d+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();

const titleCase = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(
      /(^|[\s'-])([a-z])/g,
      (match, separator, char) => `${separator}${char.toUpperCase()}`,
    )
    .trim();

const cleanForQuery = (value: string) =>
  value.replace(/\d+/g, " ").replace(/\s+/g, " ").trim();

const addCityCandidate = (list: string[], value?: string | null) => {
  if (!value) return;
  const cleaned = titleCase(value);
  if (!cleaned) return;
  const alreadyExists = list.some(
    (candidate) =>
      normalizeForCompare(candidate) === normalizeForCompare(cleaned),
  );
  if (!alreadyExists) {
    list.push(cleaned);
  }
};

const addAreaCandidate = (
  list: AreaCandidate[],
  value: string | null | undefined,
  source: CandidateSource,
) => {
  if (!value) return;
  const trimmed = value.trim();
  if (!trimmed) return;

  const normalized = normalizeForCompare(trimmed);
  if (!normalized) return;

  const alreadyExists = list.some(
    (candidate) => candidate.normalized === normalized,
  );
  if (alreadyExists) return;

  const queryValue = cleanForQuery(trimmed);
  if (!queryValue) return;

  list.push({
    raw: trimmed,
    normalized,
    queryValue,
    source,
  });
};

const buildLookupParams = (input: ServiceAreaMatchInput) => {
  const country = titleCase(input.country || DEFAULT_COUNTRY);

  const cityCandidates: string[] = [];
  addCityCandidate(cityCandidates, input.city);
  addCityCandidate(cityCandidates, input.state);

  const addressParts = (input.address || "")
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);

  if (addressParts.length >= 2) {
    addCityCandidate(cityCandidates, addressParts[addressParts.length - 2]);
  }

  const areaCandidates: AreaCandidate[] = [];
  addAreaCandidate(areaCandidates, input.district, "district");
  addAreaCandidate(areaCandidates, input.placeName, "place_name");

  addressParts.forEach((part) => {
    if (normalizeForCompare(part) === normalizeForCompare(country)) return;
    addAreaCandidate(areaCandidates, part, "address_part");
  });

  cityCandidates.forEach((city) => {
    addAreaCandidate(areaCandidates, city, "city");
  });

  const normalizedCitySet = new Set(cityCandidates.map(normalizeForCompare));

  return {
    country,
    cityCandidates,
    areaCandidates,
    normalizedCitySet,
  };
};

export async function findServiceAreaMatch(
  input: ServiceAreaMatchInput,
): Promise<ServiceAreaMatchResult | null> {
  const { country, cityCandidates, areaCandidates, normalizedCitySet } =
    buildLookupParams(input);

  if (cityCandidates.length === 0 && areaCandidates.length === 0) {
    return null;
  }

  const areaCandidateSet = new Set(
    areaCandidates.map((candidate) => candidate.normalized),
  );

  for (const city of cityCandidates) {
    const { data, error } = await supabase
      .from("service_areas")
      .select("id, country, city, area")
      .eq("country", country)
      .eq("city", city);

    if (error) {
      console.error("Service area lookup (city) failed", error);
      continue;
    }

    if (!data || data.length === 0) continue;

    const exactMatch = data.find((record) =>
      areaCandidateSet.has(normalizeForCompare(record.area)),
    );

    if (exactMatch) {
      return {
        serviceArea: exactMatch,
        matchedBy: "city_area_exact",
        matchedValue: exactMatch.area,
      };
    }
  }

  for (const candidate of areaCandidates) {
    const pattern = `%${candidate.queryValue}%`;

    const { data, error } = await supabase
      .from("service_areas")
      .select("id, country, city, area")
      .eq("country", country)
      .ilike("area", pattern)
      .limit(20);

    if (error) {
      console.error("Service area lookup (area) failed", error);
      continue;
    }

    if (!data || data.length === 0) continue;

    const withCityMatch = data.find((record) =>
      normalizedCitySet.has(normalizeForCompare(record.city)),
    );
    if (withCityMatch) {
      return {
        serviceArea: withCityMatch,
        matchedBy: "area_with_city",
        matchedValue: withCityMatch.area,
      };
    }

    const normalizedCandidate = candidate.normalized;
    const directMatch = data.find(
      (record) => normalizeForCompare(record.area) === normalizedCandidate,
    );
    if (directMatch) {
      return {
        serviceArea: directMatch,
        matchedBy: "area_only",
        matchedValue: directMatch.area,
      };
    }
  }

  return null;
}

export type { ServiceAreaMatchInput };

export async function fetchServiceAreaCities(): Promise<string[]> {
  const { data, error } = await supabase
    .from("service_areas")
    .select("city")
    .order("city", { ascending: true });

  if (error) {
    console.error("Service area city lookup failed", error);
    return [];
  }

  const seen = new Set<string>();
  const cities: string[] = [];

  (data || []).forEach((record) => {
    const normalizedCity = titleCase(record.city || "");
    if (!normalizedCity || seen.has(normalizedCity)) {
      return;
    }
    seen.add(normalizedCity);
    cities.push(normalizedCity);
  });

  return cities;
}

export async function fetchServiceAreasByCity(
  city: string,
): Promise<ServiceAreaRecord[]> {
  const { data, error } = await supabase
    .from("service_areas")
    .select("id, country, city, area")
    .eq("city", city)
    .order("area", { ascending: true });

  if (error) {
    console.error("Service area lookup by city failed", error);
    return [];
  }

  return data || [];
}
