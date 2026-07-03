using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using TourPlanner.Api.Data;
using TourPlanner.Api.Models;

namespace TourPlanner.Api.Repositories
{
    public class TourRepository : ITourRepository
    {
        private readonly TourPlannerDbContext _context;

        public TourRepository(TourPlannerDbContext context)
        {
            _context = context;
        }

        public async Task AddAsync(Tour tour)
        {
            await _context.Tours.AddAsync(tour);
        }

        public async Task<IEnumerable<Tour>> GetAllAsync(int userId)
        {
            return await _context.Tours
                .Include(t => t.User)
                .Include(t => t.TourLogs)
                .Where(t => t.UserId == userId)
                .OrderByDescending(t => t.CreatedAt)
                .ToListAsync();
        }

        public async Task<Tour?> GetByIdAsync(int id, int userId)
        {
            return await _context.Tours
                .Include(t => t.User)
                .Include(t => t.TourLogs)
                .SingleOrDefaultAsync(t => t.Id == id && t.UserId == userId);
        }

        public async Task<Tour?> GetPublicOrOwnedByIdAsync(int id, int userId)
        {
            return await _context.Tours
                .Include(t => t.User)
                .Include(t => t.TourLogs)
                .SingleOrDefaultAsync(t => t.Id == id && (t.UserId == userId || t.IsPublic));
        }

        public async Task<Tour?> GetPublicByIdAsync(int id)
        {
            return await _context.Tours
                .Include(t => t.User)
                .Include(t => t.TourLogs)
                .SingleOrDefaultAsync(t => t.Id == id && t.IsPublic);
        }

        public async Task<IEnumerable<Tour>> SearchAsync(string query, int userId)
        {
            if (string.IsNullOrWhiteSpace(query))
            {
                return await GetAllAsync(userId);
            }

            query = query.Trim();
            return await _context.Tours
                .Include(t => t.User)
                .Include(t => t.TourLogs)
                .Where(t => t.UserId == userId && (
                    EF.Functions.ILike(t.Name, $"%{query}%") ||
                    EF.Functions.ILike(t.Description ?? string.Empty, $"%{query}%") ||
                    EF.Functions.ILike(t.TransportType, $"%{query}%") ||
                    t.TourLogs.Any(log => EF.Functions.ILike(log.Comment ?? string.Empty, $"%{query}%"))
                ))
                .OrderByDescending(t => t.CreatedAt)
                .ToListAsync();
        }

        public void Remove(Tour tour)
        {
            _context.Tours.Remove(tour);
        }

        public async Task<IEnumerable<Tour>> GetPublicToursAsync()
        {
            return await _context.Tours
                .Include(t => t.User)
                .Include(t => t.TourLogs)
                .Where(t => t.IsPublic)
                .OrderByDescending(t => t.CreatedAt)
                .ToListAsync();
        }

        public async Task<bool> SaveChangesAsync()
        {
            return await _context.SaveChangesAsync() > 0;
        }
    }
}
