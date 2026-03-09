using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.JsonPatch;

using Microsoft.AspNetCore.Authorization;

using sergey_crud.Constants;
using sergey_crud.Data;
using sergey_crud.Models;
using sergey_crud.Dtos;

namespace sergey_crud.Controllers;

[ApiController]
[Route("api/[controller]")]

public class CommentController : ControllerBase
{
    private readonly ApplicationDbContext _db;

    public CommentController(ApplicationDbContext db) => _db = db;

    [HttpGet]
    [Authorize(Roles = Roles.ManagerOperatorOrMaster)]
    public async Task<IActionResult> GetAll()
    {
        var items = await _db.Set<Comment>()
            .AsNoTracking()
            .Select(x => new CommentDto
            {
                CommentId = x.CommentId,
                Message = x.Message,
                MasterId = x.MasterId,
                RequestId = x.RequestId,
            })
            .ToListAsync();

        return Ok(items);
    }

    [HttpGet("{id:int}")]
    [Authorize(Roles = Roles.ManagerOperatorOrMaster)]
    public async Task<IActionResult> GetById(int id)
    {
        var item = await _db.Set<Comment>()
            .AsNoTracking()
            .Where(x => x.CommentId == id)
            .Select(x => new CommentDto
            {
                CommentId = x.CommentId,
                Message = x.Message,
                MasterId = x.MasterId,
                RequestId = x.RequestId,
            })
            .FirstOrDefaultAsync();

        return item is null ? NotFound() : Ok(item);
    }

    [HttpPost]
    [Authorize(Roles = Roles.ManagerOperatorOrMaster)]
    public async Task<IActionResult> Create([FromBody] CommentCreateDto dto)
    {
        var entity = new Comment
        {
            Message = dto.Message,
            MasterId = dto.MasterId,
            RequestId = dto.RequestId,
        };

        _db.Set<Comment>().Add(entity);
        await _db.SaveChangesAsync();

        return Ok(new CommentDto
        {
            CommentId = entity.CommentId,
            Message = entity.Message,
            MasterId = entity.MasterId,
            RequestId = entity.RequestId,
        });
    }

    [HttpPatch("{id:int}")]
    [Authorize(Roles = Roles.ManagerOperatorOrMaster)]
    public async Task<IActionResult> Patch(int id, [FromBody] JsonPatchDocument<CommentUpdateDto> patch)
    {
        if (patch is null) return BadRequest("Patch document is required.");

        var entity = await _db.Set<Comment>().FirstOrDefaultAsync(x => x.CommentId == id);
        if (entity is null) return NotFound();

        var dto = new CommentUpdateDto
        {
            Message = entity.Message,
            MasterId = entity.MasterId,
            RequestId = entity.RequestId,
        };

        patch.ApplyTo(dto, ModelState);
        if (!ModelState.IsValid) return ValidationProblem(ModelState);
        entity.Message = dto.Message;
        entity.MasterId = dto.MasterId;
        entity.RequestId = dto.RequestId;

        await _db.SaveChangesAsync();

        return Ok(new CommentDto
        {
            CommentId = entity.CommentId,
            Message = entity.Message,
            MasterId = entity.MasterId,
            RequestId = entity.RequestId,
        });
    }

    [HttpDelete("{id:int}")]
    [Authorize(Roles = Roles.Operator)]
    public async Task<IActionResult> Delete(int id)
    {
        var entity = await _db.Set<Comment>().FirstOrDefaultAsync(x => x.CommentId == id);
        if (entity is null) return NotFound();

        _db.Remove(entity);
        await _db.SaveChangesAsync();

        return NoContent();
    }
}
