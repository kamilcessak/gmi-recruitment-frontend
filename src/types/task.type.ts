export type NoteType = {
  id: number;
  title: string;
  description: string;
  created_at: string;
  status: string;
};

export type FormData = {
  title: string;
  description?: string;
};
