namespace sergey_crud.Dtos;

public sealed class RequestCreateDto
{
    public DateOnly? StartDate { get; set; }
    public string ClimateTechType { get; set; }
    public string ClimateTechModel { get; set; }
    public string ProblemDescription { get; set; }
    public string RequestStatus { get; set; }
    public DateOnly? CompletionDate { get; set; }
    public string RepairParts { get; set; }
    public int? MasterId { get; set; }
    public int ClientId { get; set; }
}
