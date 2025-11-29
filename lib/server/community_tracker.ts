import { db } from "@/firebaseConfig";
import { ComplaintRecord } from "@/lib/types/community_tracker";
import { getJurisdictionGis } from "@/lib/server/jurisdiction";

export async function createComplaintRecord(record: ComplaintRecord, authorId: string) {
  record.dateCreated = new Date();
  record.lastModified = record.dateCreated;
  record.authorId = authorId;

  const jurisdiction = await getJurisdictionGis(record.jurisdiction.value);
  record.jurisdiction.label = jurisdiction.name;
  
  const docRef = await db.collection("complaint_records").add(record);

  return docRef.id;
}
