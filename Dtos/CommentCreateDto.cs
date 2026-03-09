namespace sergey_crud.Dtos;

public sealed class CommentCreateDto
{
    public string Message { get; set; }
    public int? MasterId { get; set; }
    public int RequestId { get; set; }
}
