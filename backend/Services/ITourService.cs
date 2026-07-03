using System.Collections.Generic;
using System.Threading.Tasks;
using TourPlanner.Api.Dtos;

namespace TourPlanner.Api.Services
{
    public interface ITourService
    {
        Task<IEnumerable<TourDto>> GetAllAsync(int userId);
        Task<IEnumerable<TourDto>> GetPublicToursAsync();
        Task<TourDto?> GetPublicByIdAsync(int id);
        Task<TourDto?> GetByIdAsync(int id, int userId);
        Task<IEnumerable<TourDto>> SearchAsync(string query, int userId);
        Task<TourDto> CreateAsync(TourDto tourDto, int userId);
        Task<TourDto?> UpdateAsync(int id, TourDto tourDto, int userId);
        Task<bool> DeleteAsync(int id, int userId);
        Task<TourLogDto?> AddLogAsync(int tourId, TourLogDto tourLogDto, int userId, string username);
        Task<TourLogDto?> UpdateLogAsync(int tourId, int logId, TourLogDto tourLogDto, int userId, string username);
        Task<bool> DeleteLogAsync(int tourId, int logId, int userId, string username);
    }
}
