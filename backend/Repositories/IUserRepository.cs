using System.Threading.Tasks;
using TourPlanner.Api.Models;

namespace TourPlanner.Api.Repositories
{
    public interface IUserRepository
    {
        Task<User?> FindByUsernameAsync(string username);
        Task<User?> FindByIdAsync(int id);
        Task AddAsync(User user);
        Task<bool> SaveChangesAsync();
    }
}
