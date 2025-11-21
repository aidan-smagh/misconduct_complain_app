import { JurisidictionGisInfo } from "@/lib/types/jurisdiction";
import Fuse from 'fuse.js';

export async function findJurisdictionsByName(query, exclude?) {
  let jurisdictions: { id: string; name: string }[];

  try {
    const req = await fetch("/api/get_gis_index");
    const data = await req.json();
    jurisdictions = Object.entries(data).map(([id, v]: [string, JurisidictionGisInfo]) => ({ id, name: v.name }));
  } catch (error) {
    return null;
  }

  // Show all entries if query is empty
  if (query === "") {
    return jurisdictions
      .filter(r => r.id !== exclude)
      .map(r => ({
        value: r.id,
        label: r.name,
      }))
      .sort((a, b) => {
        if (a.label < b.label) {
          return -1;
        }

        if (a.label > b.label) {
          return 1;
        }

        return 0;
      });
  } else {
    const fuse = new Fuse(jurisdictions, { keys: ["name"], threshold: 0.4 });

    return fuse.search(query)
      .filter(r => r.item.id !== exclude)
      .slice(0, 5)
      .map(r => ({
        value: r.item.id,
        label: r.item.name,
      }));
  }
}