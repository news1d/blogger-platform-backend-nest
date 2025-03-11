export class BlogViewDto {
  id: string;
  name: string;
  description: string;
  websiteUrl: string;
  createdAt: Date;
  isMembership: boolean;

  static mapToView(blog): BlogViewDto {
    const dto = new BlogViewDto();

    dto.id = blog.Id.toString();
    dto.name = blog.Name;
    dto.description = blog.Description;
    dto.websiteUrl = blog.WebsiteUrl;
    dto.createdAt = blog.CreatedAt;
    dto.isMembership = blog.IsMembership;

    return dto;
  }
}
