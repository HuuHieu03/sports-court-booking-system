export interface FeedbackProps {
  id: string;
  venueId: string;
  authorId: string;
  content: string;
  createdAt: Date;
}

export class FeedbackEntity {
  public readonly id: string;
  public readonly venueId: string;
  public readonly authorId: string;
  public content: string;
  public readonly createdAt: Date;

  constructor(props: FeedbackProps) {
    this.id = props.id;
    this.venueId = props.venueId;
    this.authorId = props.authorId;
    this.content = props.content.trim();
    this.createdAt = props.createdAt;
  }
}
