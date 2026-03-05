using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace sergey_crud.Models;

[Table("comments")]
[Index("MasterId", Name = "ix_comments_master_id")]
[Index("RequestId", Name = "ix_comments_request_id")]
public partial class Comment
{
    [Key]
    [Column("comment_id")]
    public int CommentId { get; set; }

    [Column("message")]
    public string Message { get; set; } = null!;

    [Column("master_id")]
    public int? MasterId { get; set; }

    [Column("request_id")]
    public int RequestId { get; set; }

    [ForeignKey("MasterId")]
    [InverseProperty("Comments")]
    public virtual User? Master { get; set; }

    [ForeignKey("RequestId")]
    [InverseProperty("Comments")]
    public virtual Request Request { get; set; } = null!;
}
