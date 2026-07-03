using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using TourPlanner.Api.Dtos.Auth;
using TourPlanner.Api.Services;

namespace TourPlanner.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;
        private readonly ILogger<AuthController> _logger;

        public AuthController(IAuthService authService, ILogger<AuthController> logger)
        {
            _authService = authService;
            _logger = logger;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var response = await _authService.RegisterAsync(request);
                return Created(string.Empty, response);
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning(ex, "Failed to register user {Username}", request.Username);
                return Conflict(new { error = ex.Message });
            }
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var response = await _authService.LoginAsync(request);
            if (response == null)
            {
                return Unauthorized(new { error = "Username or password is invalid." });
            }

            return Ok(response);
        }
    }
}
