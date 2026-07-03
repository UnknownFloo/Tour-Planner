using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using TourPlanner.Api.Data;
using TourPlanner.Api.Models;

namespace TourPlanner.Api.Repositories
{
    public class UserRepository : IUserRepository
    {
        private readonly TourPlannerDbContext _context;

        public UserRepository(TourPlannerDbContext context)
        {
            _context = context;
        }

        public async Task AddAsync(User user)
        {
            await _context.Users.AddAsync(user);
        }

        public async Task<User?> FindByIdAsync(int id)
        {
            return await _context.Users.FindAsync(id);
        }

        public async Task<User?> FindByUsernameAsync(string username)
        {
            return await _context.Users.SingleOrDefaultAsync(u => u.Username == username);
        }

        public async Task<bool> SaveChangesAsync()
        {
            return await _context.SaveChangesAsync() > 0;
        }
    }
}
