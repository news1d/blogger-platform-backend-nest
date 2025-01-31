export class CreateCommentDomainDto {
  content: string;
  commentatorInfo: {
    userId: string;
    userLogin: string;
  };
  postId: string;
}
