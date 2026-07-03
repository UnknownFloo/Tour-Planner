using System.ComponentModel.DataAnnotations;

namespace TourPlanner.Api.Dtos.Auth
{
    public class RegisterRequest
    {
        [Required]
        [MinLength(3)]
        public string Username { get; set; } = null!;

        [Required]
        [MinLength(6)]
        public string Password { get; set; } = null!;
    }
}
