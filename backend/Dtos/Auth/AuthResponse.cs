namespace TourPlanner.Api.Dtos.Auth
{
    public class AuthResponse
    {
        public string Username { get; set; } = null!;
        public string Token { get; set; } = null!;
        public int ExpiresInMinutes { get; set; }
    }
}
