using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace TourPlanner.Api.Dtos
{
    public class TourDto
    {
        public int Id { get; set; }

        [Required]
        [MaxLength(120)]
        public string Name { get; set; } = null!;

        [MaxLength(1000)]
        public string? Description { get; set; }

        [Required]
        public double StartLatitude { get; set; }

        [Required]
        public double StartLongitude { get; set; }

        [Required]
        public double EndLatitude { get; set; }

        [Required]
        public double EndLongitude { get; set; }

        [Required]
        [MaxLength(40)]
        public string TransportType { get; set; } = null!;

        public double DistanceKm { get; set; }

        public int EstimatedTimeMinutes { get; set; }

        public string? ImageUrl { get; set; }

        public bool IsPublic { get; set; }

        public string Author { get; set; } = string.Empty;

        public int Popularity { get; set; }

        public double ChildFriendliness { get; set; }

        public IList<TourLogDto> TourLogs { get; set; } = new List<TourLogDto>();
    }
}
