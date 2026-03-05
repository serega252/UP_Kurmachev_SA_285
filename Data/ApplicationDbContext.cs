using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;
using sergey_crud.Models;

namespace sergey_crud.Data;

public partial class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public virtual DbSet<Comment> Comments { get; set; }

    public virtual DbSet<Request> Requests { get; set; }

    public virtual DbSet<User> Users { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Comment>(entity =>
        {
            entity.HasKey(e => e.CommentId).HasName("comments_pkey");

            entity.HasOne(d => d.Master).WithMany(p => p.Comments)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("comments_master_id_fkey");

            entity.HasOne(d => d.Request).WithMany(p => p.Comments).HasConstraintName("comments_request_id_fkey");
        });

        modelBuilder.Entity<Request>(entity =>
        {
            entity.HasKey(e => e.RequestId).HasName("requests_pkey");

            entity.HasOne(d => d.Client).WithMany(p => p.RequestClients)
                .OnDelete(DeleteBehavior.Restrict)
                .HasConstraintName("requests_client_id_fkey");

            entity.HasOne(d => d.Master).WithMany(p => p.RequestMasters)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("requests_master_id_fkey");
        });

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.UserId).HasName("users_pkey");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
