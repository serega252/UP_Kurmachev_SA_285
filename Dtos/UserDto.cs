namespace sergey_crud.Dtos;

public sealed class UserDto
{
    public int UserId { get; set; }
    public string Fio { get; set; }
    public string Phone { get; set; }
    public string Login { get; set; }
    public string Password { get; set; }
    public string Type { get; set; }
}
