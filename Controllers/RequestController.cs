using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.JsonPatch;

using Microsoft.AspNetCore.Authorization;


using sergey_crud.Data;
using sergey_crud.Models;
using sergey_crud.Dtos;
using sergey_crud.Constants;

namespace sergey_crud.Controllers;

[ApiController]
[Route("api/[controller]")]


public class RequestController : ControllerBase
{
    private readonly ApplicationDbContext _db;

    public RequestController(ApplicationDbContext db) => _db = db;

    [HttpGet]
    [Authorize(Roles = Roles.ManagerOperatorOrMaster)]
    public async Task<IActionResult> GetAll(
        [FromQuery] int? requestId,
        [FromQuery] string? status,
        [FromQuery] string? climateTechType,
        [FromQuery] int? masterId,
        [FromQuery] int? clientId)
    {
        var query = _db.Set<Request>().AsNoTracking().AsQueryable();

        if (requestId.HasValue)
            query = query.Where(x => x.RequestId == requestId.Value);

        if (!string.IsNullOrEmpty(status))
            query = query.Where(x => x.RequestStatus == status);

        if (!string.IsNullOrEmpty(climateTechType))
            query = query.Where(x => x.ClimateTechType == climateTechType);

        if (masterId.HasValue)
            query = query.Where(x => x.MasterId == masterId.Value);

        if (clientId.HasValue)
            query = query.Where(x => x.ClientId == clientId.Value);

        var items = await query
            .OrderBy(x => x.RequestId)
            .Select(x => new RequestDto
            {
                RequestId = x.RequestId,
                StartDate = x.StartDate,
                ClimateTechType = x.ClimateTechType,
                ClimateTechModel = x.ClimateTechModel,
                ProblemDescription = x.ProblemDescription,
                RequestStatus = x.RequestStatus,
                CompletionDate = x.CompletionDate,
                RepairParts = x.RepairParts,
                MasterId = x.MasterId,
                ClientId = x.ClientId,
            })
            .ToListAsync();

        return Ok(items);
    }

    [HttpGet("{id:int}")]
    [Authorize(Roles = Roles.ManagerOperatorOrMaster)]
    public async Task<IActionResult> GetById(int id)
    {
        var item = await _db.Set<Request>()
            .AsNoTracking()
            .Where(x => x.RequestId == id)
            .Select(x => new RequestDto
            {
                RequestId = x.RequestId,
                StartDate = x.StartDate,
                ClimateTechType = x.ClimateTechType,
                ClimateTechModel = x.ClimateTechModel,
                ProblemDescription = x.ProblemDescription,
                RequestStatus = x.RequestStatus,
                CompletionDate = x.CompletionDate,
                RepairParts = x.RepairParts,
                MasterId = x.MasterId,
                ClientId = x.ClientId,
            })
            .FirstOrDefaultAsync();

        return item is null ? NotFound() : Ok(item);
    }

    [HttpPost]
    [Authorize(Roles = Roles.Manager + "," + Roles.Operator + "," + Roles.Client)]
    public async Task<IActionResult> Create([FromBody] RequestCreateDto dto)
    {
        var entity = new Request
        {
            StartDate = dto.StartDate,
            ClimateTechType = dto.ClimateTechType,
            ClimateTechModel = dto.ClimateTechModel,
            ProblemDescription = dto.ProblemDescription,
            RequestStatus = dto.RequestStatus,
            CompletionDate = dto.CompletionDate,
            RepairParts = dto.RepairParts,
            MasterId = dto.MasterId,
            ClientId = dto.ClientId,
        };

        _db.Set<Request>().Add(entity);
        await _db.SaveChangesAsync();

        return Ok(new RequestDto
        {
            RequestId = entity.RequestId,
            StartDate = entity.StartDate,
            ClimateTechType = entity.ClimateTechType,
            ClimateTechModel = entity.ClimateTechModel,
            ProblemDescription = entity.ProblemDescription,
            RequestStatus = entity.RequestStatus,
            CompletionDate = entity.CompletionDate,
            RepairParts = entity.RepairParts,
            MasterId = entity.MasterId,
            ClientId = entity.ClientId,
        });
    }

    [HttpPatch("{id:int}")]
    [Authorize(Roles = Roles.ManagerOperatorOrMaster)]
    public async Task<IActionResult> Patch(int id, [FromBody] JsonPatchDocument<RequestUpdateDto> patch)
    {
        if (patch is null) return BadRequest("Patch document is required.");

        var entity = await _db.Set<Request>().FirstOrDefaultAsync(x => x.RequestId == id);
        if (entity is null) return NotFound();

        var dto = new RequestUpdateDto
        {
            StartDate = entity.StartDate,
            ClimateTechType = entity.ClimateTechType,
            ClimateTechModel = entity.ClimateTechModel,
            ProblemDescription = entity.ProblemDescription,
            RequestStatus = entity.RequestStatus,
            CompletionDate = entity.CompletionDate,
            RepairParts = entity.RepairParts,
            MasterId = entity.MasterId,
            ClientId = entity.ClientId,
        };

        patch.ApplyTo(dto, ModelState);
        if (!ModelState.IsValid) return ValidationProblem(ModelState);
        entity.StartDate = dto.StartDate;
        entity.ClimateTechType = dto.ClimateTechType;
        entity.ClimateTechModel = dto.ClimateTechModel;
        entity.ProblemDescription = dto.ProblemDescription;
        entity.RequestStatus = dto.RequestStatus;
        entity.CompletionDate = dto.CompletionDate;
        entity.RepairParts = dto.RepairParts;
        entity.MasterId = dto.MasterId;
        entity.ClientId = dto.ClientId;

        await _db.SaveChangesAsync();

        return Ok(new RequestDto
        {
            RequestId = entity.RequestId,
            StartDate = entity.StartDate,
            ClimateTechType = entity.ClimateTechType,
            ClimateTechModel = entity.ClimateTechModel,
            ProblemDescription = entity.ProblemDescription,
            RequestStatus = entity.RequestStatus,
            CompletionDate = entity.CompletionDate,
            RepairParts = entity.RepairParts,
            MasterId = entity.MasterId,
            ClientId = entity.ClientId,
        });
    }

    [HttpPatch("{id:int}/assign-master")]
    [Authorize(Roles = Roles.Manager + "," + Roles.Operator)]
    public async Task<IActionResult> AssignMaster(int id, [FromBody] AssignMasterDto dto)
    {
        var request = await _db.Set<Request>().FirstOrDefaultAsync(x => x.RequestId == id);
        if (request is null) return NotFound("Заявка не найдена.");

        if (dto.MasterId.HasValue)
        {
            var masterExists = await _db.Set<User>()
                .AnyAsync(x => x.UserId == dto.MasterId.Value && x.Type == Roles.Master);

            if (!masterExists)
                return BadRequest("Указанный мастер не найден.");
        }

        request.MasterId = dto.MasterId;
        await _db.SaveChangesAsync();

        return Ok(new
        {
            message = "Мастер назначен.",
            requestId = request.RequestId,
            masterId = request.MasterId
        });
    }

    [HttpPatch("{id:int}/change-status")]
    [Authorize(Roles = Roles.Manager + "," + Roles.Operator + "," + Roles.Master)]
    public async Task<IActionResult> ChangeStatus(int id, [FromBody] ChangeRequestStatusDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.RequestStatus))
            return BadRequest("Статус обязателен.");

        var allowedStatuses = new[]
        {
            "Новая",
            "В работе",
            "Ожидание запчастей",
            "Выполнено",
            "Отменена"
        };

        var newStatus = dto.RequestStatus.Trim();

        if (!allowedStatuses.Contains(newStatus))
            return BadRequest("Недопустимый статус заявки.");

        var request = await _db.Set<Request>().FirstOrDefaultAsync(x => x.RequestId == id);
        if (request is null) return NotFound("Заявка не найдена.");

        request.RequestStatus = newStatus;

        if (newStatus == "Выполнено" && !request.CompletionDate.HasValue)
            request.CompletionDate = DateOnly.FromDateTime(DateTime.Today);

        await _db.SaveChangesAsync();

        return Ok(new
        {
            message = "Статус заявки обновлен.",
            requestId = request.RequestId,
            requestStatus = request.RequestStatus,
            completionDate = request.CompletionDate
        });
    }

    [HttpPatch("{id:int}/extend-deadline")]
    [Authorize(Roles = Roles.Manager + "," + Roles.Operator)]
    public async Task<IActionResult> ExtendDeadline(int id, [FromBody] ExtendCompletionDateDto dto)
    {
        if (!dto.CompletionDate.HasValue)
            return BadRequest("Новая дата завершения обязательна.");

        var request = await _db.Set<Request>().FirstOrDefaultAsync(x => x.RequestId == id);
        if (request is null) return NotFound("Заявка не найдена.");

        if (request.StartDate.HasValue && dto.CompletionDate.Value < request.StartDate.Value)
            return BadRequest("Дата завершения не может быть раньше даты начала.");

        request.CompletionDate = dto.CompletionDate.Value;

        await _db.SaveChangesAsync();

        if (!string.IsNullOrWhiteSpace(dto.Comment))
        {
            var managerComment = new Comment
            {
                Message = $"Продление срока: {dto.Comment}",
                RequestId = request.RequestId,
                MasterId = request.MasterId
            };

            _db.Set<Comment>().Add(managerComment);
            await _db.SaveChangesAsync();
        }

        return Ok(new
        {
            message = "Срок выполнения заявки продлен.",
            requestId = request.RequestId,
            completionDate = request.CompletionDate
        });
    }

    [HttpDelete("{id:int}")]
    [Authorize(Roles = Roles.Operator)]
    public async Task<IActionResult> Delete(int id)
    {
        var entity = await _db.Set<Request>().FirstOrDefaultAsync(x => x.RequestId == id);
        if (entity is null) return NotFound();

        _db.Remove(entity);
        await _db.SaveChangesAsync();

        return NoContent();
    }


    [HttpGet("stats")]
    [Authorize(Roles = Roles.ManagerOperatorOrMaster)]
    public async Task<IActionResult> GetStats()
    {
        var requests = await _db.Set<Request>()
            .AsNoTracking()
            .ToListAsync();

        var totalCount = requests.Count;

        var completedRequests = requests
            .Where(x => x.CompletionDate.HasValue && x.StartDate.HasValue)
            .ToList();

        var completedCount = completedRequests.Count;

        var averageRepairDays = completedCount == 0
            ? 0
            : Math.Round(
                completedRequests.Average(x => 
                    x.CompletionDate!.Value.DayNumber - x.StartDate!.Value.DayNumber),
                2);

        var byStatus = requests
            .GroupBy(x => string.IsNullOrWhiteSpace(x.RequestStatus) ? "Не указан" : x.RequestStatus!)
            .Select(g => new StatsItemDto
            {
                Name = g.Key,
                Count = g.Count()
            })
            .OrderByDescending(x => x.Count)
            .ToList();

        var byClimateTechType = requests
            .GroupBy(x => string.IsNullOrWhiteSpace(x.ClimateTechType) ? "Не указан" : x.ClimateTechType!)
            .Select(g => new StatsItemDto
            {
                Name = g.Key,
                Count = g.Count()
            })
            .OrderByDescending(x => x.Count)
            .ToList();

        var result = new RequestStatsDto
        {
            TotalCount = totalCount,
            CompletedCount = completedCount,
            AverageRepairDays = averageRepairDays,
            ByStatus = byStatus,
            ByClimateTechType = byClimateTechType
        };

        return Ok(result);
    }
}

