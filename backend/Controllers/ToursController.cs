using System;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using TourPlanner.Api.Dtos;
using TourPlanner.Api.Services;

namespace TourPlanner.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ToursController : ControllerBase
    {
        private readonly ITourService _tourService;
        private readonly ILogger<ToursController> _logger;

        public ToursController(ITourService tourService, ILogger<ToursController> logger)
        {
            _tourService = tourService;
            _logger = logger;
        }

        [HttpGet("public")]
        [AllowAnonymous]
        public async Task<IActionResult> GetPublic()
        {
            var tours = await _tourService.GetPublicToursAsync();
            return Ok(tours);
        }

        [HttpGet("public/{id:int}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetPublicById(int id)
        {
            var tour = await _tourService.GetPublicByIdAsync(id);
            return tour == null ? NotFound() : Ok(tour);
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var userId = GetCurrentUserId();
            var tours = await _tourService.GetAllAsync(userId);
            return Ok(tours);
        }

        [HttpGet("search")]
        public async Task<IActionResult> Search([FromQuery] string query)
        {
            var userId = GetCurrentUserId();
            var tours = await _tourService.SearchAsync(query, userId);
            return Ok(tours);
        }

        [HttpGet("{id:int}")]
        public async Task<IActionResult> Get(int id)
        {
            var userId = GetCurrentUserId();
            var tour = await _tourService.GetByIdAsync(id, userId);
            return tour == null ? NotFound() : Ok(tour);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] TourDto tourDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var userId = GetCurrentUserId();
            var created = await _tourService.CreateAsync(tourDto, userId);
            return CreatedAtAction(nameof(Get), new { id = created.Id }, created);
        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, [FromBody] TourDto tourDto)
        {
            if (!ModelState.IsValid)
            {
                _logger.LogWarning("ModelState invalid for tour update: {Errors}", ModelState.Values.SelectMany(v => v.Errors));
                return BadRequest(new { message = "Tour data invalid", errors = ModelState });
            }

            var userId = GetCurrentUserId();
            var updated = await _tourService.UpdateAsync(id, tourDto, userId);
            return updated == null ? NotFound() : Ok(updated);
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            var userId = GetCurrentUserId();
            return await _tourService.DeleteAsync(id, userId) ? NoContent() : NotFound();
        }

        [HttpPost("{tourId:int}/logs")]
        public async Task<IActionResult> AddLog(int tourId, [FromBody] TourLogDto logDto)
        {
            var userId = GetCurrentUserId();
            var username = GetCurrentUsername();
            var created = await _tourService.AddLogAsync(tourId, logDto, userId, username);
            return created == null ? NotFound() : CreatedAtAction(nameof(Get), new { id = tourId }, created);
        }

        [HttpPut("{tourId:int}/logs/{logId:int}")]
        public async Task<IActionResult> UpdateLog(int tourId, int logId, [FromBody] TourLogDto logDto)
        {
            var userId = GetCurrentUserId();
            var username = GetCurrentUsername();
            var updated = await _tourService.UpdateLogAsync(tourId, logId, logDto, userId, username);
            return updated == null ? NotFound() : Ok(updated);
        }

        [HttpDelete("{tourId:int}/logs/{logId:int}")]
        public async Task<IActionResult> DeleteLog(int tourId, int logId)
        {
            var userId = GetCurrentUserId();
            var username = GetCurrentUsername();
            return await _tourService.DeleteLogAsync(tourId, logId, userId, username) ? NoContent() : NotFound();
        }

        private int GetCurrentUserId()
        {
            var idClaim = User.FindFirstValue("userId");
            if (string.IsNullOrWhiteSpace(idClaim) || !int.TryParse(idClaim, out var userId))
            {
                throw new UnauthorizedAccessException("Invalid user claim.");
            }

            return userId;
        }

        private string GetCurrentUsername()
        {
            var username = User.FindFirstValue(JwtRegisteredClaimNames.Sub);
            if (string.IsNullOrWhiteSpace(username))
            {
                throw new UnauthorizedAccessException("Invalid username claim.");
            }

            return username;
        }
    }
}
