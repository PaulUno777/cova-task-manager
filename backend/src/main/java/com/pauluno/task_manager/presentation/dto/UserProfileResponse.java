package com.pauluno.task_manager.presentation.dto;

import java.time.Instant;

public record UserProfileResponse(Long id, String email, Instant createdAt) {
}
