using System;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using sergey_crud.Data;
using sergey_crud.Models;
using sergey_crud.Constants;
using sergey_crud.Services;

namespace sergey_crud.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly ApplicationDbContext _db;
    private readonly PasswordHasherService _hasher;
    private readonly JwtTokenService _jwt;

    public AuthController(ApplicationDbContext db, PasswordHasherService hasher, JwtTokenService jwt)
    {
        _db = db;
        _hasher = hasher;
        _jwt = jwt;
    }

    public sealed record RegisterRequest(string Username, string Password, string? Role, string? Fio, string? Phone);
    public sealed record LoginRequest(string Username, string Password);

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest req)
    {
        if (string.IsNullOrWhiteSpace(req.Username) || string.IsNullOrWhiteSpace(req.Password))
            return BadRequest("Username/password required.");

        var username = req.Username.Trim();

        var exists = await _db.Set<User>()
            .AnyAsync(x => x.Login == username);

        if (exists)
            return Conflict("User already exists.");

        var role = NormalizeRole(req.Role);

        var user = new User
        {
            Login = username,
            Password = req.Password,
            Type = role,
            Fio = string.IsNullOrWhiteSpace(req.Fio) ? username : req.Fio.Trim(),
            Phone = string.IsNullOrWhiteSpace(req.Phone) ? null : req.Phone.Trim()
        };

        _db.Set<User>().Add(user);
        await _db.SaveChangesAsync();

        return Ok(new
        {
            id = user.UserId,
            username = user.Login,
            role = user.Type
        });
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest req)
    {
        if (string.IsNullOrWhiteSpace(req.Username) || string.IsNullOrWhiteSpace(req.Password))
            return BadRequest("Username/password required.");

        var username = req.Username.Trim();

        var user = await _db.Set<User>()
            .FirstOrDefaultAsync(x => x.Login == username);

        if (user is null)
            return Unauthorized();

        if (!string.Equals(req.Password, user.Password, StringComparison.Ordinal))
            return Unauthorized();

        var token = _jwt.CreateToken(
            userId: user.UserId,
            username: user.Login ?? "",
            role: user.Type);

        return Ok(new
        {
            token,
            user = new
            {
                id = user.UserId,
                login = user.Login,
                fio = user.Fio,
                role = user.Type
            }
        });
    }

    private static string NormalizeRole(string? role)
    {
        return role?.Trim() switch
        {
            Roles.Manager => Roles.Manager,
            Roles.Master => Roles.Master,
            Roles.Operator => Roles.Operator,
            Roles.Client => Roles.Client,
            _ => Roles.Client
        };
    }
}