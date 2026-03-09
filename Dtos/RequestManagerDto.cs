namespace sergey_crud.Dtos;

public sealed class AssignMasterDto
{
    public int? MasterId { get; set; }
}

public sealed class ChangeRequestStatusDto
{
    public string RequestStatus { get; set; } = string.Empty;
}

public sealed class ExtendCompletionDateDto
{
    public DateOnly? CompletionDate { get; set; }
    public string? Comment { get; set; }
}