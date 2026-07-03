using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using TourPlanner.Api.Dtos;
using TourPlanner.Api.Models;
using TourPlanner.Api.Repositories;

namespace TourPlanner.Api.Services
{
    public class TourService : ITourService
    {
        private readonly ITourRepository _tourRepository;

        public TourService(ITourRepository tourRepository)
        {
            _tourRepository = tourRepository;
        }

        public async Task<TourDto> CreateAsync(TourDto tourDto, int userId)
        {
            var tour = new Tour
            {
                Name = tourDto.Name,
                Description = tourDto.Description,
                StartLatitude = tourDto.StartLatitude,
                StartLongitude = tourDto.StartLongitude,
                EndLatitude = tourDto.EndLatitude,
                EndLongitude = tourDto.EndLongitude,
                TransportType = tourDto.TransportType,
                DistanceKm = tourDto.DistanceKm,
                EstimatedTimeMinutes = tourDto.EstimatedTimeMinutes,
                ImageUrl = tourDto.ImageUrl,
                IsPublic = tourDto.IsPublic,
                UserId = userId,
                CreatedAt = DateTime.UtcNow,
                TourLogs = tourDto.TourLogs?.Select(MapLog).ToList() ?? new List<TourLog>()
            };

            await _tourRepository.AddAsync(tour);
            bool saved = await _tourRepository.SaveChangesAsync();
            
            if (!saved || tour.Id == 0)
            {
                throw new InvalidOperationException("Failed to save tour to the database. Please try again.");
            }

            return MapTour(tour, tourDto.Author);
        }

        public async Task<bool> DeleteAsync(int id, int userId)
        {
            var tour = await _tourRepository.GetByIdAsync(id, userId);
            if (tour == null)
            {
                return false;
            }

            _tourRepository.Remove(tour);
            bool deleted = await _tourRepository.SaveChangesAsync();
            if (!deleted)
            {
                throw new InvalidOperationException("Failed to delete tour from the database. Please try again.");
            }
            return true;
        }

        public async Task<TourDto?> GetPublicByIdAsync(int id)
        {
            var tour = await _tourRepository.GetPublicByIdAsync(id);
            return tour == null ? null : MapTour(tour);
        }

        public async Task<TourDto?> GetByIdAsync(int id, int userId)
        {
            var tour = await _tourRepository.GetPublicOrOwnedByIdAsync(id, userId);
            return tour == null ? null : MapTour(tour);
        }

        public async Task<IEnumerable<TourDto>> GetAllAsync(int userId)
        {
            var tours = await _tourRepository.GetAllAsync(userId);
            return tours.Select(t => MapTour(t));
        }

        public async Task<IEnumerable<TourDto>> GetPublicToursAsync()
        {
            var tours = await _tourRepository.GetPublicToursAsync();
            return tours.Select(t => MapTour(t));
        }

        public async Task<IEnumerable<TourDto>> SearchAsync(string query, int userId)
        {
            var tours = await _tourRepository.SearchAsync(query, userId);
            return tours.Select(t => MapTour(t));
        }

        public async Task<TourDto?> UpdateAsync(int id, TourDto tourDto, int userId)
        {
            var existing = await _tourRepository.GetByIdAsync(id, userId);
            if (existing == null)
            {
                return null;
            }

            existing.Name = tourDto.Name;
            existing.Description = tourDto.Description;
            existing.StartLatitude = tourDto.StartLatitude;
            existing.StartLongitude = tourDto.StartLongitude;
            existing.EndLatitude = tourDto.EndLatitude;
            existing.EndLongitude = tourDto.EndLongitude;
            existing.TransportType = tourDto.TransportType;
            existing.DistanceKm = tourDto.DistanceKm;
            existing.EstimatedTimeMinutes = tourDto.EstimatedTimeMinutes;
            existing.ImageUrl = tourDto.ImageUrl;
            existing.IsPublic = tourDto.IsPublic;

            existing.TourLogs = tourDto.TourLogs?.Select(MapLog).ToList() ?? new List<TourLog>();

            await _tourRepository.SaveChangesAsync();
            return MapTour(existing, tourDto.Author);
        }

        public async Task<TourLogDto?> AddLogAsync(int tourId, TourLogDto tourLogDto, int userId, string username)
        {
            var tour = await _tourRepository.GetPublicOrOwnedByIdAsync(tourId, userId);
            if (tour == null)
            {
                return null;
            }

            var log = MapLog(tourLogDto);
            log.Timestamp = DateTime.UtcNow;
            ApplyAuthorMetadata(log, tourLogDto.Comment, username, userId);
            tour.TourLogs.Add(log);
            bool saved = await _tourRepository.SaveChangesAsync();
            if (!saved || log.Id == 0)
            {
                throw new InvalidOperationException("Failed to save tour log to the database. Please try again.");
            }
            return MapLogDto(log);
        }

        public async Task<TourLogDto?> UpdateLogAsync(int tourId, int logId, TourLogDto tourLogDto, int userId, string username)
        {
            var tour = await _tourRepository.GetPublicOrOwnedByIdAsync(tourId, userId);
            if (tour == null)
            {
                return null;
            }

            var existingLog = tour.TourLogs.SingleOrDefault(log => log.Id == logId);
            if (existingLog == null || !IsCommentAuthor(existingLog, userId, username))
            {
                return null;
            }

            UpdateLogComment(existingLog, tourLogDto.Comment, username, userId);
            existingLog.Difficulty = tourLogDto.Difficulty;
            existingLog.TotalDistanceKm = tourLogDto.TotalDistanceKm;
            existingLog.TotalTimeMinutes = tourLogDto.TotalTimeMinutes;
            existingLog.Rating = tourLogDto.Rating;
            existingLog.Timestamp = tourLogDto.Timestamp == default ? existingLog.Timestamp : tourLogDto.Timestamp;

            await _tourRepository.SaveChangesAsync();
            return MapLogDto(existingLog);
        }

        public async Task<bool> DeleteLogAsync(int tourId, int logId, int userId, string username)
        {
            var tour = await _tourRepository.GetPublicOrOwnedByIdAsync(tourId, userId);
            if (tour == null)
            {
                return false;
            }

            var log = tour.TourLogs.SingleOrDefault(item => item.Id == logId);
            if (log == null || !IsCommentAuthor(log, userId, username))
            {
                return false;
            }

            tour.TourLogs.Remove(log);
            bool deleted = await _tourRepository.SaveChangesAsync();
            if (!deleted)
            {
                throw new InvalidOperationException("Failed to delete tour log from the database. Please try again.");
            }
            return true;
        }

        private static TourDto MapTour(Tour tour, string? author = null)
        {
            return new TourDto
            {
                Id = tour.Id,
                Name = tour.Name,
                Description = tour.Description,
                StartLatitude = tour.StartLatitude,
                StartLongitude = tour.StartLongitude,
                EndLatitude = tour.EndLatitude,
                EndLongitude = tour.EndLongitude,
                TransportType = tour.TransportType,
                DistanceKm = tour.DistanceKm,
                EstimatedTimeMinutes = tour.EstimatedTimeMinutes,
                ImageUrl = tour.ImageUrl,
                IsPublic = tour.IsPublic,
                Author = tour.User?.Username ?? author ?? string.Empty,
                Popularity = tour.Popularity,
                ChildFriendliness = Math.Round(tour.ChildFriendliness, 2),
                TourLogs = tour.TourLogs.Select(MapLogDto).ToList()
            };
        }

        private static TourLog MapLog(TourLogDto dto)
        {
            return new TourLog
            {
                Id = dto.Id,
                Timestamp = dto.Timestamp == default ? DateTime.UtcNow : dto.Timestamp,
                Comment = dto.Comment,
                Difficulty = dto.Difficulty,
                TotalDistanceKm = dto.TotalDistanceKm,
                TotalTimeMinutes = dto.TotalTimeMinutes,
                Rating = dto.Rating
            };
        }

        private static TourLogDto MapLogDto(TourLog log)
        {
            return new TourLogDto
            {
                Id = log.Id,
                Timestamp = log.Timestamp,
                Comment = log.Comment,
                Difficulty = log.Difficulty,
                TotalDistanceKm = log.TotalDistanceKm,
                TotalTimeMinutes = log.TotalTimeMinutes,
                Rating = log.Rating
            };
        }

        private static bool IsCommentAuthor(TourLog log, int userId, string username)
        {
            var payload = ParseCommentPayload(log.Comment);
            if (payload.AuthorId.HasValue)
            {
                return payload.AuthorId.Value == userId;
            }

            return !string.IsNullOrWhiteSpace(payload.Author)
                && payload.Author.Equals(username, StringComparison.OrdinalIgnoreCase);
        }

        private static void ApplyAuthorMetadata(TourLog log, string? commentJson, string username, int userId)
        {
            var payload = ParseCommentPayload(commentJson);
            log.Comment = SerializeCommentPayload(
                title: string.IsNullOrWhiteSpace(payload.Title) ? "Log" : payload.Title,
                author: username,
                authorId: userId,
                comment: string.IsNullOrWhiteSpace(payload.Comment) ? payload.Comment ?? string.Empty : payload.Comment
            );
        }

        private static void UpdateLogComment(TourLog log, string? commentJson, string username, int userId)
        {
            var existingPayload = ParseCommentPayload(log.Comment);
            var newPayload = ParseCommentPayload(commentJson);

            var title = string.IsNullOrWhiteSpace(newPayload.Title) ? existingPayload.Title : newPayload.Title;
            var comment = string.IsNullOrWhiteSpace(newPayload.Comment) ? existingPayload.Comment : newPayload.Comment;
            var author = string.IsNullOrWhiteSpace(existingPayload.Author) ? username : existingPayload.Author;
            var authorId = existingPayload.AuthorId ?? userId;

            log.Comment = SerializeCommentPayload(title, author, authorId, comment);
        }

        private static CommentPayload ParseCommentPayload(string? commentJson)
        {
            if (string.IsNullOrWhiteSpace(commentJson))
            {
                return new CommentPayload(string.Empty, string.Empty, null, string.Empty);
            }

            try
            {
                return JsonSerializer.Deserialize<CommentPayload>(commentJson, new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                }) ?? new CommentPayload(string.Empty, string.Empty, null, commentJson);
            }
            catch
            {
                return new CommentPayload(string.Empty, string.Empty, null, commentJson);
            }
        }

        private static string SerializeCommentPayload(string title, string author, int authorId, string comment)
        {
            return JsonSerializer.Serialize(new CommentPayload(
                Title: title,
                Author: author,
                AuthorId: authorId,
                Comment: comment
            ));
        }

        private sealed record CommentPayload(string Title, string Author, int? AuthorId, string Comment);
    }
}
