export type ComplaintRecord = {
  dateCreated?: Date,
  lastModified?: Date,
  authorId?: string,
  when: string,
  jurisdiction: string,
  category: string,
  details: string,
  status: string,
  updates: {
    date: string,
    title: string,
    details: string,
  }[],
  resolution: {
    date?: string,
    details?: string,
    satisfaction: number,
  }
}