using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace sergey_crud.Models;

[Table("users")]
public partial class User
{
    [Key]
    [Column("user_id")]
    public int UserId { get; set; }

    [Column("fio")]
    [StringLength(200)]
    public string Fio { get; set; } = null!;

    [Column("phone")]
    [StringLength(30)]
    public string? Phone { get; set; }

    [Column("login")]
    [StringLength(100)]
    public string? Login { get; set; }

    [Column("password")]
    [StringLength(200)]
    public string? Password { get; set; }

    [Column("type")]
    [StringLength(50)]
    public string Type { get; set; } = null!;

    [InverseProperty("Master")]
    public virtual ICollection<Comment> Comments { get; set; } = new List<Comment>();

    [InverseProperty("Client")]
    public virtual ICollection<Request> RequestClients { get; set; } = new List<Request>();

    [InverseProperty("Master")]
    public virtual ICollection<Request> RequestMasters { get; set; } = new List<Request>();
}
