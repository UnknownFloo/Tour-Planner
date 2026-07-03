using Microsoft.EntityFrameworkCore;
using TourPlanner.Api.Models;

namespace TourPlanner.Api.Data
{
    public class TourPlannerDbContext : DbContext
    {
        public TourPlannerDbContext(DbContextOptions<TourPlannerDbContext> options)
            : base(options)
        {
        }

        public DbSet<User> Users => Set<User>();
        public DbSet<Tour> Tours => Set<Tour>();
        public DbSet<TourLog> TourLogs => Set<TourLog>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<User>()
                .HasIndex(u => u.Username)
                .IsUnique();

            modelBuilder.Entity<Tour>()
                .HasIndex(t => t.Name);

            modelBuilder.Entity<Tour>()
                .HasMany(t => t.TourLogs)
                .WithOne(log => log.Tour)
                .HasForeignKey(log => log.TourId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<TourLog>()
                .Property(log => log.Rating)
                .HasDefaultValue(1);

            base.OnModelCreating(modelBuilder);
        }
    }
}
