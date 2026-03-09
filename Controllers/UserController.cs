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
[Authorize(Roles = Roles.ManagerOrOperator)]

public class UserController : ControllerBase
{
    private readonly ApplicationDbContext _db;

    public UserController(ApplicationDbContext db) => _db = db;

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var items = await _db.Set<User>()
            .AsNoTracking()
            .Select(x => new UserDto
            {
                UserId = x.UserId,
                Fio = x.Fio,
                Phone = x.Phone,
                Login = x.Login,
                Password = x.Password,
                Type = x.Type,
            })
            .ToListAsync();

        return Ok(items);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var item = await _db.Set<User>()
            .AsNoTracking()
            .Where(x => x.UserId == id)
            .Select(x => new UserDto
            {
                UserId = x.UserId,
                Fio = x.Fio,
                Phone = x.Phone,
                Login = x.Login,
                Password = x.Password,
                Type = x.Type,
            })
            .FirstOrDefaultAsync();
        return item is null ? NotFound() : Ok(item);
    }

    [HttpPost]
    [Authorize(Roles = Roles.Operator)]
    public async Task<IActionResult> Create([FromBody] UserCreateDto dto)
    {
        var entity = new User
        {
            Fio = dto.Fio,
            Phone = dto.Phone,
            Login = dto.Login,
            Password = dto.Password,
            Type = dto.Type,
        };

        _db.Set<User>().Add(entity);
        await _db.SaveChangesAsync();

        return Ok(new UserDto
        {
            UserId = entity.UserId,
            Fio = entity.Fio,
            Phone = entity.Phone,
            Login = entity.Login,
            Password = entity.Password,
            Type = entity.Type,
        });
    }

    [HttpPatch("{id:int}")]
    public async Task<IActionResult> Patch(int id, [FromBody] JsonPatchDocument<UserUpdateDto> patch)
    {
        if (patch is null) return BadRequest("Patch document is required.");

        var entity = await _db.Set<User>().FirstOrDefaultAsync(x => x.UserId == id);
        if (entity is null) return NotFound();

        var dto = new UserUpdateDto
        {
            Fio = entity.Fio,
            Phone = entity.Phone,
            Login = entity.Login,
            Password = entity.Password,
            Type = entity.Type,
        };

        patch.ApplyTo(dto, ModelState);
        if (!ModelState.IsValid) return ValidationProblem(ModelState);
        entity.Fio = dto.Fio;
        entity.Phone = dto.Phone;
        entity.Login = dto.Login;
        entity.Password = dto.Password;
        entity.Type = dto.Type;

        await _db.SaveChangesAsync();

        return Ok(new UserDto
        {

            UserId = entity.UserId,
            Fio = entity.Fio,
            Phone = entity.Phone,
            Login = entity.Login,
            Password = entity.Password,
            Type = entity.Type,
        });
    }

    [HttpDelete("{id:int}")]
    [Authorize(Roles = Roles.Operator)]
    public async Task<IActionResult> Delete(int id)
    {
        var entity = await _db.Set<User>().FirstOrDefaultAsync(x => x.UserId == id);
        if (entity is null) return NotFound();

        _db.Remove(entity);
        await _db.SaveChangesAsync();

        return NoContent();
    }
}
