using System.Collections.Generic;
using System.Threading.Tasks;
using TourPlanner.Api.Models;

namespace TourPlanner.Api.Repositories
{
    public interface ITourRepository
    {
        Task<IEnumerable<Tour>> GetAllAsync(int userId);
        Task<Tour?> GetByIdAsync(int id, int userId);
        Task<Tour?> GetPublicOrOwnedByIdAsync(int id, int userId);
        Task<Tour?> GetPublicByIdAsync(int id);
        Task<IEnumerable<Tour>> GetPublicToursAsync();
        Task AddAsync(Tour tour);
        void Remove(Tour tour);
        Task<bool> SaveChangesAsync();
        Task<IEnumerable<Tour>> SearchAsync(string query, int userId);
    }
}
