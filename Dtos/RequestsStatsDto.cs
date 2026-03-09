namespace sergey_crud.Dtos;

public sealed class RequestStatsDto
{
    public int TotalCount { get; set; }
    public int CompletedCount { get; set; }
    public double AverageRepairDays { get; set; }
    public List<StatsItemDto> ByStatus { get; set; } = new();
    public List<StatsItemDto> ByClimateTechType { get; set; } = new();
}

public sealed class StatsItemDto
{
    public string Name { get; set; } = string.Empty;
    public int Count { get; set; }
}