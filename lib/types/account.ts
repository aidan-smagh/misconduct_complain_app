export interface AccountData {
  dateCreated: Date;
}

export type AuthenticatedSubmission<T> = {
  idToken: string;
  data: T;
};