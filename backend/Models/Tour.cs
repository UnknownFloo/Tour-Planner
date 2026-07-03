using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TourPlanner.Api.Models
{
    public class Tour
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

        public int UserId { get; set; }

        public User? User { get; set; }

        [MaxLength(2048)]
        public string? ImageUrl { get; set; }

        public bool IsPublic { get; set; } = false;

        [Required]
        public DateTime CreatedAt { get; set; }

        public IList<TourLog> TourLogs { get; set; } = new List<TourLog>();

        [NotMapped]
        public int Popularity => TourLogs?.Count ?? 0;

        [NotMapped]
        public double ChildFriendliness => CalculateChildFriendliness();

        private double CalculateChildFriendliness()
        {
            if (TourLogs == null || TourLogs.Count == 0)
            {
                return 0.0;
            }

            var averageDifficulty = TourLogs.Count == 0 ? 0.0 : (double)TourLogs.Sum(log => log.Rating) / TourLogs.Count;
            var score = (double)TourLogs.Sum(log => log.Rating) / TourLogs.Count;
                
            return score;
        }
    }
}
