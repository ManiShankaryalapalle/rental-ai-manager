import type { Tenant } from "./types";

const globalTenantStore = globalThis as unknown as { __tenantStore?: Tenant[] };
const globalTenantCounter = globalThis as unknown as { __tenantIdCounter?: number };

function nextTenantId(): string {
  if (globalTenantCounter.__tenantIdCounter === undefined) {
    globalTenantCounter.__tenantIdCounter = 100;
  }
  globalTenantCounter.__tenantIdCounter += 1;
  return `ten-${globalTenantCounter.__tenantIdCounter}`;
}

export function lastNameOf(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  return parts[parts.length - 1] ?? "";
}

function normalizeUnit(unit: string): string {
  return unit
    .toLowerCase()
    .replace(/^unit\s*/, "")
    .replace(/[^a-z0-9]/g, "");
}

function seed(): Tenant[] {
  const now = Date.now();
  const rows: Array<[string, string, string]> = [
    ["Maria Chen", "4B", "4B Willowbrook Ave"],
    ["James Okafor", "12", "12 Willowbrook Ave"],
    ["Priya Patel", "7A", "7A Willowbrook Ave"],
    ["Diego Fernandez", "2C", "2C Willowbrook Ave"],
    ["Grace Lin", "9", "9 Willowbrook Ave"],
    ["Tom Baxter", "15", "15 Willowbrook Ave"],
  ];

  return rows.map(([fullName, unit, address]) => ({
    id: nextTenantId(),
    fullName,
    lastName: lastNameOf(fullName),
    unit,
    address,
    createdAt: now,
  }));
}

function getStore(): Tenant[] {
  if (!globalTenantStore.__tenantStore) {
    globalTenantStore.__tenantStore = seed();
  }
  return globalTenantStore.__tenantStore;
}

export function listTenants(): Tenant[] {
  return [...getStore()].sort((a, b) => a.unit.localeCompare(b.unit));
}

export function addTenant(params: {
  fullName: string;
  unit: string;
  address: string;
}): Tenant {
  const tenant: Tenant = {
    id: nextTenantId(),
    fullName: params.fullName.trim(),
    lastName: lastNameOf(params.fullName),
    unit: params.unit.trim(),
    address: params.address.trim(),
    createdAt: Date.now(),
  };
  getStore().push(tenant);
  return tenant;
}

export function deleteTenant(id: string): boolean {
  const store = getStore();
  const index = store.findIndex((t) => t.id === id);
  if (index === -1) return false;
  store.splice(index, 1);
  return true;
}

// Forgiving match: last name + unit number, both normalized (case/whitespace/
// "Unit " prefix insensitive) so "4B", "unit 4b", "Unit-4B" all match the
// same record — a typo'd street address or nickname shouldn't lock a real
// tenant out, so those fields are stored for the owner's reference only.
export function findTenantMatch(fullName: string, unit: string): Tenant | null {
  const lastName = lastNameOf(fullName).toLowerCase();
  const normalizedUnit = normalizeUnit(unit);
  if (!lastName || !normalizedUnit) return null;

  return (
    getStore().find(
      (t) =>
        t.lastName.toLowerCase() === lastName &&
        normalizeUnit(t.unit) === normalizedUnit
    ) ?? null
  );
}
