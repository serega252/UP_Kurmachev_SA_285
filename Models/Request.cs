using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace sergey_crud.Models;

[Table("requests")]
[Index("ClientId", Name = "ix_requests_client_id")]
[Index("MasterId", Name = "ix_requests_master_id")]
[Index("RequestStatus", Name = "ix_requests_status")]
public partial class Request
{
    [Key]
    [Column("request_id")]
    public int RequestId { get; set; }

    [Column("start_date")]
    public DateOnly? StartDate { get; set; }

    [Column("climate_tech_type")]
    [StringLength(120)]
    public string? ClimateTechType { get; set; }

    [Column("climate_tech_model")]
    [StringLength(120)]
    public string? ClimateTechModel { get; set; }

    [Column("problem_description")]
    public string? ProblemDescription { get; set; }

    [Column("request_status")]
    [StringLength(50)]
    public string? RequestStatus { get; set; }

    [Column("completion_date")]
    public DateOnly? CompletionDate { get; set; }

    [Column("repair_parts")]
    public string? RepairParts { get; set; }

    [Column("master_id")]
    public int? MasterId { get; set; }

    [Column("client_id")]
    public int ClientId { get; set; }

    [ForeignKey("ClientId")]
    [InverseProperty("RequestClients")]
    public virtual User Client { get; set; } = null!;

    [InverseProperty("Request")]
    public virtual ICollection<Comment> Comments { get; set; } = new List<Comment>();

    [ForeignKey("MasterId")]
    [InverseProperty("RequestMasters")]
    public virtual User? Master { get; set; }
}
