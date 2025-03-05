export class CreatePostDto {
  title: string;
  shortDescription: string;
  content: string;
  blogName: string;
  blogId: string;
}

export class UpdatePostDto {
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
}
